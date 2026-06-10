import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics: string[]
  language: string | null
  stargazers_count: number
}

async function fetchGitHubProjects(username: string): Promise<GitHubRepo[]> {
  const headers: any = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Importer',
  }

  const githubToken = process.env.GITHUB_TOKEN
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`
  }

  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  const repos: GitHubRepo[] = await response.json()
  return repos.filter((repo) => !repo.fork)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username') || 'Dev-Sahad'

    console.log(`Fetching repositories for ${username}...`)
    const repos = await fetchGitHubProjects(username)
    console.log(`Found ${repos.length} repositories`)

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const repo of repos) {
      try {
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
        }

        // Check if project already exists
        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('github_url', repo.html_url)
          .single()

        if (existing) {
          skipped++
          continue
        }

        // Insert new project
        const { error } = await supabase.from('projects').insert([project])

        if (error) {
          errors.push(`${repo.name}: ${error.message}`)
        } else {
          imported++
        }
      } catch (err: any) {
        errors.push(`${repo.name}: ${err.message}`)
      }
    }

    return Response.json(
      {
        success: true,
        message: `Import complete`,
        stats: {
          total: repos.length,
          imported,
          skipped,
          errors: errors.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    )
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
