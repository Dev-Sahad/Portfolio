import { Quote, Star } from 'lucide-react'
import type { Testimonial } from '@/lib/growthTypes'

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null

  return (
    <section id="testimonials" className="mx-auto w-full max-w-[1450px] px-4 py-24 text-white sm:px-6 md:px-12 lg:px-20">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/35">Recommendations</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">What people say</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((item) => (
          <article key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between">
              <Quote size={22} className="text-white/25" />
              <div className="flex gap-0.5 text-amber-300" aria-label={`${item.rating} out of 5 stars`}>
                {Array.from({ length: item.rating }).map((_, index) => <Star key={index} size={12} fill="currentColor" />)}
              </div>
            </div>
            <blockquote className="mt-5 text-sm leading-7 text-white/70">“{item.quote}”</blockquote>
            <footer className="mt-6 border-t border-white/10 pt-4">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-xs text-white/40">{[item.role, item.company].filter(Boolean).join(' · ')}</p>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
