import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// All tables the portfolio needs
const TABLES_SQL = [
  // Projects
  `CREATE TABLE IF NOT EXISTS public.projects (
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
  )`,

  // Certificates
  `CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    issuer text,
    date text,
    image_url text,
    created_at timestamptz DEFAULT now()
  )`,

  // Comments / guestbook
  `CREATE TABLE IF NOT EXISTS public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    comment text,
    likes int DEFAULT 0,
    is_pinned boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  )`,

  // Technologies
  `CREATE TABLE IF NOT EXISTS public.technologies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    icon text,
    category text,
    created_at timestamptz DEFAULT now()
  )`,

  // 3D scene words
  `CREATE TABLE IF NOT EXISTS public.scene3d_words (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    text text NOT NULL,
    color text DEFAULT '#ffffff',
    "fontSize" float DEFAULT 1.8,
    opacity float DEFAULT 0.75,
    created_at timestamptz DEFAULT now()
  )`,

  // Portfolio settings
  `CREATE TABLE IF NOT EXISTS public.portfolio_settings (
    id int PRIMARY KEY DEFAULT 1,
    name text,
    title text,
    subtitle text,
    bio text,
    email text,
    location text,
    available boolean DEFAULT true,
    cv_url text,
    avatar_url text,
    hero_badge text,
    hero_heading_1 text,
    hero_heading_2 text,
    hero_desc text,
    hero_skills text,
    github_url text,
    linkedin_url text,
    instagram_url text,
    youtube_url text,
    tiktok_url text,
    discord_url text,
    site_title text,
    site_description text,
    og_image_url text,
    accent_color text DEFAULT '#ffffff',
    created_at timestamptz DEFAULT now()
  )`,
]

// Default scene3d words
const DEFAULT_WORDS = [
  { text: 'Design',     color: '#ffffff', fontSize: 1.8, opacity: 0.75 },
  { text: 'Frontend',   color: '#aaaaff', fontSize: 2.0, opacity: 0.80 },
  { text: 'React',      color: '#ffffff', fontSize: 1.8, opacity: 0.70 },
  { text: 'TypeScript', color: '#88aaff', fontSize: 1.6, opacity: 0.70 },
  { text: '設計',       color: '#ffffff', fontSize: 2.2, opacity: 0.60 },
  { text: '開発',       color: '#aaaaff', fontSize: 2.0, opacity: 0.60 },
  { text: 'Three.js',   color: '#ffffff', fontSize: 1.6, opacity: 0.70 },
  { text: 'Tailwind',   color: '#66ffaa', fontSize: 1.6, opacity: 0.65 },
  { text: 'Next.js',    color: '#ffffff', fontSize: 1.8, opacity: 0.75 },
  { text: 'Creative',   color: '#ffcc44', fontSize: 1.8, opacity: 0.70 },
  { text: 'UI / UX',    color: '#ff6688', fontSize: 1.8, opacity: 0.70 },
  { text: 'Portfolio',  color: '#ffffff', fontSize: 1.6, opacity: 0.65 },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Accept credentials via query params (only used once for setup)
  const supabaseUrl = searchParams.get('url') || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = searchParams.get('key') || process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseKey = serviceKey || anonKey

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({
      success: false,
      error: 'Missing credentials. Pass ?url=YOUR_SUPABASE_URL&key=YOUR_SERVICE_ROLE_KEY',
    }, { status: 400 })
  }

  const db = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  const results: Record<string, string> = {}

  // Create each table one by one
  for (const sql of TABLES_SQL) {
    // Extract table name for logging
    const match = sql.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/)
    const tableName = match?.[1] ?? 'unknown'

    try {
      // Try Supabase's pg REST endpoint (requires service role)
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query: sql }),
      })

      if (res.ok) {
        results[tableName] = 'created'
        continue
      }

      // Fall back: try inserting a dummy row to see if table exists
      const { error } = await db.from(tableName).select('id').limit(1)
      if (!error) {
        results[tableName] = 'exists'
      } else {
        results[tableName] = `needs_manual_creation: ${error.message}`
      }
    } catch (e: any) {
      results[tableName] = `error: ${e.message}`
    }
  }

  // Seed scene3d_words if empty
  const { data: existingWords } = await db.from('scene3d_words').select('id').limit(1)
  let wordsSeed = 'skipped'
  if (!existingWords || existingWords.length === 0) {
    const { error: seedErr } = await db.from('scene3d_words').insert(DEFAULT_WORDS)
    wordsSeed = seedErr ? `error: ${seedErr.message}` : 'seeded'
  } else {
    wordsSeed = 'already has data'
  }

  // Check which tables actually exist now
  const tableChecks: Record<string, boolean> = {}
  for (const sql of TABLES_SQL) {
    const match = sql.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/)
    const tableName = match?.[1]
    if (tableName) {
      const { error } = await db.from(tableName).select('id').limit(1)
      tableChecks[tableName] = !error
    }
  }

  const allGood = Object.values(tableChecks).every(Boolean)

  return Response.json({
    success: allGood,
    tables: tableChecks,
    actions: results,
    scene3d_words: wordsSeed,
    message: allGood
      ? '✅ All tables ready. You can now import GitHub projects.'
      : '⚠️ Some tables could not be auto-created. See manual_sql below.',
    manual_sql: allGood ? null : TABLES_SQL.join(';\n\n') + ';',
  })
}
