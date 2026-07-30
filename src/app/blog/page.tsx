import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Developer Notes',
  description: 'Technical notes, project decisions, and frontend development updates from Muhammad Sahad.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  const database = await createClient()
  const { data: posts } = await database
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <main id="main-content" className="min-h-screen bg-[#080808] px-5 py-10 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Link href="/#notes" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white">
          <ArrowLeft size={15} /> Back to portfolio
        </Link>
        <header className="py-16">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/35">Developer Notes</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-6xl">Writing, experiments, and build notes.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/50">A practical record of decisions, lessons, and techniques from real projects.</p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {(posts || []).map((post: any) => (
            <Link key={post.id} href={`/blog/${post.slug}`}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-white/25">
              <div className="flex items-center justify-between">
                <BookOpen size={20} className="text-white/30" />
                <ArrowUpRight size={17} className="text-white/25 transition group-hover:text-white" />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {(post.tags || []).map((tag: string) => (
                  <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/40">{tag}</span>
                ))}
              </div>
              <h2 className="mt-5 text-2xl font-semibold">{post.title}</h2>
              <p className="mt-4 leading-7 text-white/50">{post.excerpt}</p>
              <time className="mt-6 block text-xs text-white/25">
                {new Date(post.published_at || post.created_at).toLocaleDateString('en', { dateStyle: 'long' })}
              </time>
            </Link>
          ))}
          {!posts?.length && (
            <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-16 text-center text-white/35">
              The first developer note is being prepared.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
