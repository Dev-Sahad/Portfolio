import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const CERTIFICATES = [
  {
    name: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    date: '2024',
    image_url: 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg',
    description: 'Certification in HTML5, CSS3, Flexbox, CSS Grid and responsive design principles.',
    credential_url: 'https://www.freecodecamp.org/certification/Dev-Sahad/responsive-web-design',
  },
  {
    name: 'JavaScript Algorithms and Data Structures',
    issuer: 'freeCodeCamp',
    date: '2024',
    image_url: 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg',
    description: 'Certification covering ES6+, functional programming, OOP, algorithms and data structures in JavaScript.',
    credential_url: 'https://www.freecodecamp.org/certification/Dev-Sahad/javascript-algorithms-and-data-structures',
  },
  {
    name: 'Front End Development Libraries',
    issuer: 'freeCodeCamp',
    date: '2024',
    image_url: 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg',
    description: 'Certification covering React, Redux, Bootstrap, Sass and jQuery.',
    credential_url: 'https://www.freecodecamp.org/certification/Dev-Sahad/front-end-development-libraries',
  },
  {
    name: 'Web Design for Everybody',
    issuer: 'University of Michigan (Coursera)',
    date: '2024',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Coursera_logo_2020.svg/320px-Coursera_logo_2020.svg.png',
    description: 'Specialization covering HTML5, CSS3, Interactivity and Responsive Design by University of Michigan.',
    credential_url: 'https://www.coursera.org/specializations/web-design',
  },
  {
    name: 'React - The Complete Guide',
    issuer: 'Udemy',
    date: '2024',
    image_url: 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg',
    description: 'Comprehensive React training including Hooks, Context API, Redux, Next.js and TypeScript.',
    credential_url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
  },
  {
    name: 'The Complete JavaScript Course',
    issuer: 'Udemy',
    date: '2024',
    image_url: 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg',
    description: 'In-depth JavaScript from fundamentals to advanced topics including async JS, closures, prototypes, and the DOM.',
    credential_url: 'https://www.udemy.com/course/the-complete-javascript-course/',
  },
  {
    name: 'CSS for JavaScript Developers',
    issuer: 'Josh W Comeau',
    date: '2024',
    image_url: 'https://www.joshwcomeau.com/images/og-default.png',
    description: 'Advanced CSS course covering layouts, animations, responsive design and modern CSS techniques.',
    credential_url: 'https://css-for-js.dev',
  },
  {
    name: 'Next.js & React - The Complete Guide',
    issuer: 'Udemy',
    date: '2025',
    image_url: 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg',
    description: 'Full-stack development with Next.js 13+, App Router, Server Components, and deployment.',
    credential_url: 'https://www.udemy.com/course/nextjs-react-the-complete-guide/',
  },
]

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ success: false, error: 'Missing Supabase env vars' }, { status: 500 })
  }

  const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

  // Create table if it doesn't exist
  const createSQL = `
    CREATE TABLE IF NOT EXISTS public.certificates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text,
      issuer text,
      date text,
      image_url text,
      description text,
      credential_url text,
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificates' AND policyname='public_rw') THEN
        CREATE POLICY "public_rw" ON public.certificates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `

  await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    body: JSON.stringify({ sql: createSQL }),
  }).catch(() => null)

  // Check existing
  const { data: existing } = await db.from('certificates').select('name')
  const existingNames = new Set((existing || []).map((c: any) => c.name))

  const toInsert = CERTIFICATES.filter(c => !existingNames.has(c.name))

  if (toInsert.length === 0) {
    return Response.json({ success: true, message: 'All certificates already seeded', count: 0 })
  }

  const { data, error } = await db.from('certificates').insert(toInsert).select('id')

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  return Response.json({
    success: true,
    message: `Seeded ${data?.length ?? toInsert.length} certificates`,
    count: data?.length ?? toInsert.length,
  })
}
