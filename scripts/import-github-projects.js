#!/usr/bin/env node

/**
 * Script to import GitHub projects to Supabase
 * Run with: node scripts/import-github-projects.js
 */

const https = require('https');

const GITHUB_USERNAME = 'Dev-Sahad';

// Get environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function fetchGitHubProjects() {
  const headers = {
    'User-Agent': 'Portfolio-Importer',
    'Accept': 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  console.log(`📦 Fetching repositories from GitHub user: ${GITHUB_USERNAME}...`);

  const options = {
    hostname: 'api.github.com',
    path: `/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
    method: 'GET',
    headers,
  };

  const response = await httpsRequest(options);

  if (response.status !== 200) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const repos = response.body.filter((repo) => !repo.fork);
  console.log(`✓ Found ${repos.length} repositories (excluding forks)`);
  return repos;
}

async function importProjectsToSupabase(repos) {
  console.log(`\n📤 Importing projects to Supabase...`);

  let imported = 0;
  let skipped = 0;

  for (const repo of repos) {
    const project = {
      title: repo.name,
      description: repo.description || `Repository for ${repo.name}`,
      live_url: repo.homepage || null,
      github_url: repo.html_url,
      technologies: repo.language || 'JavaScript',
      key_features: repo.topics?.join(', ') || 'GitHub Repository',
      image_url: null,
      image_urls: [],
      stars: repo.stargazers_count,
    };

    try {
      // Check if project already exists
      const checkOptions = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: `/rest/v1/projects?github_url=eq.${encodeURIComponent(repo.html_url)}&select=id`,
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      };

      const checkResponse = await httpsRequest(checkOptions);

      if (checkResponse.body && checkResponse.body.length > 0) {
        console.log(`  ⏭️  ${repo.name} (already exists)`);
        skipped++;
        continue;
      }

      // Insert new project
      const insertOptions = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: '/rest/v1/projects',
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
      };

      const insertResponse = await httpsRequest(insertOptions, project);

      if (insertResponse.status === 201 || insertResponse.status === 200) {
        console.log(`  ✅ ${repo.name}`);
        imported++;
      } else {
        console.log(`  ❌ ${repo.name} (status: ${insertResponse.status})`);
      }
    } catch (error) {
      console.log(`  ⚠️  ${repo.name} (error: ${error.message})`);
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Imported: ${imported}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
}

async function main() {
  try {
    const repos = await fetchGitHubProjects();
    await importProjectsToSupabase(repos);
    console.log(`\n🎉 Import complete!`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
