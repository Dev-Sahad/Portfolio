import { createClient } from '@supabase/supabase-js';

const GITHUB_USERNAME = 'Dev-Sahad';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  fork: boolean;
}

async function fetchGitHubProjects(): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const repos: GitHubRepo[] = await response.json();
  return repos.filter(repo => !repo.fork); // Filter out forked repos
}

async function importProjectsToSupabase(repos: GitHubRepo[]) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  for (const repo of repos) {
    const project = {
      title: repo.name,
      description: repo.description || `Repository for ${repo.name}`,
      live_url: repo.homepage || null,
      github_url: repo.html_url,
      technologies: repo.language || 'JavaScript',
      key_features: repo.topics?.join(', ') || 'GitHub Repository',
      image_url: null, // Will be null since GitHub repos don't have images
      image_urls: [],
      stars: repo.stargazers_count,
    };

    // Check if project already exists
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('github_url', repo.html_url)
      .single();

    if (!existing) {
      const { error } = await supabase
        .from('projects')
        .insert([project]);

      if (error) {
        console.error(`Error importing ${repo.name}:`, error);
      } else {
        console.log(`✓ Imported: ${repo.name}`);
      }
    } else {
      console.log(`- Already exists: ${repo.name}`);
    }
  }
}

async function main() {
  try {
    console.log(`Fetching projects from GitHub user: ${GITHUB_USERNAME}...`);
    const repos = await fetchGitHubProjects();
    console.log(`Found ${repos.length} repositories`);

    console.log('\nImporting to Supabase...');
    await importProjectsToSupabase(repos);

    console.log('\n✅ Import complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
