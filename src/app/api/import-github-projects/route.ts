import { createClient } from '@supabase/supabase-js'

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
  fork: boolean
  private: boolean
}

async function fetchAllRepos(username: string, githubToken?: string): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Importer/1.0',
  }

  // Use provided token, or fall back to env var
  const token = githubToken || process.env.GITHUB_TOKEN
  if (token) headers['Authorization'] = `Bearer ${token}`

  const allRepos: GitHubRepo[] = []
  let page = 1

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}`,
      { headers, next: { revalidate: 0 } }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || `GitHub API returned ${res.status}`)
    }

    const repos: GitHubRepo[] = await res.json()
    if (!repos.length) break
    allRepos.push(...repos)
    if (repos.length < 100) break
    page++
  }

  return allRepos.filter(r => !r.fork && !r.private)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username') || 'Dev-Sahad'
  const githubToken = searchParams.get('gh_token') || undefined

  // ── 1. Validate Supabase config ──────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||   // service role bypasses RLS
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // anon key as fallback

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({
      success: false,
      error: 'Server misconfiguration: missing NEXT_PUBLIC_SUPABASE_URL or Supabase key env vars.',
    }, { status: 500 })
  }

  const db = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  // ── 2. Fetch GitHub repos ─────────────────────────────────────────
  let repos: GitHubRepo[]
  try {
    repos = await fetchAllRepos(username, githubToken)
  } catch (err: any) {
    return Response.json({
      success: false,
      error: `GitHub API error: ${err.message}`,
    }, { status: 502 })
  }

  if (repos.length === 0) {
    return Response.json({
      success: true,
      message: `No public non-fork repos found for @${username}`,
      stats: { total: 0, imported: 0, skipped: 0, errors: 0 },
    })
  }

  // ── 3. Get existing github_urls to skip duplicates ────────────────
  const { data: existing, error: readErr } = await db
    .from('projects')
    .select('github_url')

  if (readErr) {
    return Response.json({
      success: false,
      error: `Supabase read error: ${readErr.message}. If using anon key, ensure SELECT is allowed by RLS.`,
    }, { status: 500 })
  }

  const existingUrls = new Set(
    (existing ?? []).map((r: any) => r.github_url).filter(Boolean)
  )

  // ── 4. Build rows to insert ───────────────────────────────────────
  const toInsert = repos
    .filter(r => !existingUrls.has(r.html_url))
    .map(r => ({
      title: r.name
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()), // Title Case
      description:
        r.description?.trim() ||
        `Open-source project on GitHub — ${r.name}`,
      github_url: r.html_url,
      live_url:
        r.homepage && r.homepage.startsWith('http')
          ? r.homepage
          : null,
      technologies:
        [r.language, ...(r.topics ?? [])]
          .filter(Boolean)
          .join(', ') || 'JavaScript',
      key_features: r.topics?.length
        ? r.topics.join(', ')
        : null,
      image_url: null,
      image_urls: [],
    }))

  const skipped = repos.length - toInsert.length

  if (toInsert.length === 0) {
    return Response.json({
      success: true,
      message: 'All repos already imported.',
      stats: { total: repos.length, imported: 0, skipped, errors: 0 },
    })
  }

  // ── 5. Insert in batches of 20 ────────────────────────────────────
  let imported = 0
  const errors: string[] = []

  for (let i = 0; i < toInsert.length; i += 20) {
    const batch = toInsert.slice(i, i + 20)
    const { data: inserted, error: insertErr } = await db
      .from('projects')
      .insert(batch)
      .select('id')

    if (insertErr) {
      // Collect error but continue other batches
      errors.push(`Batch ${Math.floor(i / 20) + 1}: ${insertErr.message}`)
    } else {
      imported += inserted?.length ?? batch.length
    }
  }

  return Response.json({
    success: errors.length === 0 || imported > 0,
    message: `Import complete for @${username}`,
    stats: { total: repos.length, imported, skipped, errors: errors.length },
    ...(errors.length > 0 && { errors }),
  })
}
