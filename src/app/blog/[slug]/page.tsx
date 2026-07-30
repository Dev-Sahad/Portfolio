import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

type Props = { params: Promise<{ slug: string }> }

async function getPost(slug: string) {
  const database = await createClient()
  const { data } = await database.from('posts').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Article not found' }
  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 155),
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || post.content.slice(0, 155),
      publishedTime: post.published_at || post.created_at,
      tags: post.tags || [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <main id="main-content" className="min-h-screen bg-[#080808] px-5 py-10 text-white sm:px-10">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white">
          <ArrowLeft size={15} /> All notes
        </Link>
        <header className="py-14">
          <div className="flex flex-wrap gap-2">
            {(post.tags || []).map((tag: string) => (
              <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">{tag}</span>
            ))}
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-8 text-white/50">{post.excerpt}</p>
          <time className="mt-6 block text-xs text-white/30">
            {new Date(post.published_at || post.created_at).toLocaleDateString('en', { dateStyle: 'long' })}
          </time>
        </header>
        <div className="whitespace-pre-wrap border-t border-white/10 py-10 text-[15px] leading-8 text-white/70">
          {post.content}
        </div>
      </article>
    </main>
  )
}
