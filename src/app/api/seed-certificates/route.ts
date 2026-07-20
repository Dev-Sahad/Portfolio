import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const CERTIFICATES = [
  {
    title: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    date: '2024',
    image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
    description: 'HTML5, CSS3, Flexbox, CSS Grid and responsive design principles.',
    credential_url: 'https://www.freecodecamp.org',
  },
  {
    title: 'JavaScript Algorithms & Data Structures',
    issuer: 'freeCodeCamp',
    date: '2024',
    image_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80',
    description: 'ES6+, functional programming, OOP, algorithms and data structures.',
    credential_url: 'https://www.freecodecamp.org',
  },
  {
    title: 'Front End Development Libraries',
    issuer: 'freeCodeCamp',
    date: '2024',
    image_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&q=80',
    description: 'React, Redux, Bootstrap, Sass and jQuery.',
    credential_url: 'https://www.freecodecamp.org',
  },
  {
    title: 'Web Design for Everybody',
    issuer: 'University of Michigan',
    date: '2024',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    description: 'HTML5, CSS3, Interactivity and Responsive Design specialization.',
    credential_url: 'https://www.coursera.org',
  },
  {
    title: 'React — The Complete Guide',
    issuer: 'Udemy',
    date: '2024',
    image_url: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=600&q=80',
    description: 'Hooks, Context API, Redux, Next.js and TypeScript with React.',
    credential_url: 'https://www.udemy.com',
  },
  {
    title: 'The Complete JavaScript Course',
    issuer: 'Udemy',
    date: '2024',
    image_url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80',
    description: 'Async JS, closures, prototypes, DOM manipulation and modern JS.',
    credential_url: 'https://www.udemy.com',
  },
  {
    title: 'Next.js & React — The Complete Guide',
    issuer: 'Udemy',
    date: '2025',
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    description: 'Next.js 13+ App Router, Server Components, and full-stack deployment.',
    credential_url: 'https://www.udemy.com',
  },
  {
    title: 'UI/UX Design Fundamentals',
    issuer: 'Google',
    date: '2025',
    image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80',
    description: 'User research, wireframing, prototyping and usability testing principles.',
    credential_url: 'https://grow.google',
  },
]

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ success: false, error: 'Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.' }, { status: 500 })
  }

  const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

  // ── Step 1: check if table exists ────────────────────────────────
  const { error: tableCheckErr } = await db.from('certificates').select('id').limit(1)

  if (tableCheckErr) {
    // Table missing — return SQL for them to run
    return Response.json({
      success: false,
      needsSetup: true,
      error: `Table 'certificates' not found: ${tableCheckErr.message}`,
      setup_sql: `-- Run in Supabase → SQL Editor → New query → Run
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  issuer text,
  date text,
  image_url text,
  description text,
  credential_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_rw" ON public.certificates;
CREATE POLICY "public_read" ON public.certificates
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_write" ON public.certificates
  FOR ALL TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');`,
    }, { status: 500 })
  }

  // ── Step 2: skip duplicates ───────────────────────────────────────
  const { data: existing } = await db.from('certificates').select('title')
  const existingTitles = new Set((existing || []).map((c: any) => c.title))
  const toInsert = CERTIFICATES.filter(c => !existingTitles.has(c.title))

  if (toInsert.length === 0) {
    return Response.json({ success: true, message: 'All 8 certificates already in database.', count: 0 })
  }

  // ── Step 3: insert ────────────────────────────────────────────────
  const { data, error } = await db.from('certificates').insert(toInsert).select('id, title')

  if (error) {
    return Response.json({
      success: false,
      error: error.message,
      hint: 'If this is a permission error, your RLS policy may be blocking inserts. Run the setup_sql to fix it.',
      setup_sql: `ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_rw" ON public.certificates;
CREATE POLICY "public_read" ON public.certificates
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_write" ON public.certificates
  FOR ALL TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');`,
    }, { status: 500 })
  }

  return Response.json({
    success: true,
    message: `✅ Seeded ${data?.length ?? toInsert.length} certificates into your portfolio.`,
    inserted: data?.map((r: any) => r.title),
    count: data?.length ?? toInsert.length,
  })
}
