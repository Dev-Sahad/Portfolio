import Link from 'next/link'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import type { BlogPost } from '@/lib/growthTypes'

export default function BlogPreviewSection({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null

  return (
    <section id="notes" className="mx-auto w-full max-w-[1450px] px-4 py-24 text-white sm:px-6 md:px-12 lg:px-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/35">Developer Notes</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Writing & updates</h2>
        </div>
        <Link href="/blog" className="hidden items-center gap-2 text-sm text-white/55 hover:text-white sm:flex">
          View all <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-white/25">
            <BookOpen size={20} className="text-white/30" />
            <div className="mt-5 flex flex-wrap gap-2">
              {(post.tags || []).slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/40">{tag}</span>
              ))}
            </div>
            <h3 className="mt-4 text-lg font-semibold group-hover:text-white">{post.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/50">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
