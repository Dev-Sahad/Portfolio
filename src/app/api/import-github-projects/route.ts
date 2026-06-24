import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics: string[]
  language: string | null
  fork: boolean
  private: boolean
}

async function fetchRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Importer/1.0',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const all: GitHubRepo[] = []
  let page = 1
  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}`,
      { headers, cache: 'no-store' }
    )
    if (!res.ok) {
      const b = await res.json().catch(() => ({}))
      throw new Error(b.message || `GitHub ${res.status}`)
    }
    const batch: GitHubRepo[] = await res.json()
    if (!batch.length) break
    all.push(...batch)
    if (batch.length < 100) break
    page++
  }
  return all.filter(r => !r.fork && !r.private)
}

async function ensureProjectsTable(
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ ok: boolean; message: string }> {
  // First check if table already exists
  const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  const { error: checkErr } = await db.from('projects').select('id').limit(1)

  if (!checkErr) return { ok: true, message: 'table exists' }

  // Table missing — try to create via Supabase SQL REST endpoint
  const createSQL = `
    CREATE TABLE IF NOT EXISTS public.projects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text,
      description text,
      technologies text,
      image_url text,
      image_urls jsonb DEFAULT '[]'::jsonb,
      live_url text,
      github_url text,
      key_features text,
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'public_rw'
      ) THEN
        CREATE POLICY "public_rw" ON public.projects
          FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `

  // Try the pg/query endpoint (service role only)
  const pgRes = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ query: createSQL }),
  }).catch(() => null)

  // Verify table now exists
  const { error: verifyErr } = await db.from('projects').select('id').limit(1)
  if (!verifyErr) return { ok: true, message: 'table auto-created' }

  return {
    ok: false,
    message: checkErr.message,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username    = searchParams.get('username') || 'Dev-Sahad'
  const githubToken = searchParams.get('gh_token') || process.env.NEXT_PUBLIC_GITHUB_TOKEN || undefined

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ success: false, error: 'Missing Supabase env vars on server.' }, { status: 500 })
  }

  const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

  // ── 1. Fetch GitHub repos ─────────────────────────────────────────
  let repos: GitHubRepo[]
  try {
    repos = await fetchRepos(username, githubToken)
  } catch (err: any) {
    return Response.json({ success: false, error: `GitHub: ${err.message}` }, { status: 502 })
  }

  // ── 2. Ensure table exists ────────────────────────────────────────
  const tableCheck = await ensureProjectsTable(supabaseUrl, supabaseKey)
  if (!tableCheck.ok) {
    // Return a clear error + the SQL they need to run
    return Response.json({
      success: false,
      needsSetup: true,
      error: `Table 'projects' not found: ${tableCheck.message}`,
      repos_found: repos.length,
      // Give them the exact SQL to run
      setup_sql: `-- Paste this in Supabase → SQL Editor → Run
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  technologies text,
  image_url text,
  image_urls jsonb DEFAULT '[]'::jsonb,
  live_url text,
  github_url text,
  key_features text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_rw" ON public.projects
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`,
    }, { status: 500 })
  }

  if (repos.length === 0) {
    return Response.json({
      success: true,
      message: `No public non-fork repos for @${username}`,
      stats: { total: 0, imported: 0, skipped: 0 },
    })
  }

  // ── 3. Skip existing ──────────────────────────────────────────────
  const { data: existing } = await db.from('projects').select('github_url')
  const existingUrls = new Set((existing ?? []).map((r: any) => r.github_url).filter(Boolean))

  const toInsert = repos
    .filter(r => !existingUrls.has(r.html_url))
    .map(r => ({
      title: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: r.description?.trim() || `GitHub project — ${r.name}`,
      github_url: r.html_url,
      live_url: r.homepage?.startsWith('http') ? r.homepage : null,
      technologies: [r.language, ...(r.topics ?? [])].filter(Boolean).join(', ') || 'JavaScript',
      key_features: r.topics?.join(', ') || null,
      image_url: null,
      image_urls: [],
    }))

  const skipped = repos.length - toInsert.length

  if (toInsert.length === 0) {
    return Response.json({
      success: true,
      message: 'All repos already imported.',
      stats: { total: repos.length, imported: 0, skipped },
    })
  }

  // ── 4. Insert ─────────────────────────────────────────────────────
  let imported = 0
  const errors: string[] = []

  for (let i = 0; i < toInsert.length; i += 20) {
    const { data, error } = await db
      .from('projects')
      .insert(toInsert.slice(i, i + 20))
      .select('id')

    if (error) errors.push(error.message)
    else imported += data?.length ?? 0
  }

  return Response.json({
    success: imported > 0 || toInsert.length === 0,
    message: `Import done for @${username}`,
    stats: { total: repos.length, imported, skipped, errors: errors.length },
    ...(errors.length && { errors }),
  })
}
