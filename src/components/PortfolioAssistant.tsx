'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Bot, Loader2, Send, X } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

type AssistantReply = {
  answer: string
  links: Array<{ label: string; href: string }>
}

export default function PortfolioAssistant() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<AssistantReply | null>(null)

  const ask = async (event: FormEvent) => {
    event.preventDefault()
    if (!question.trim() || loading) return
    setLoading(true)
    trackEvent('assistant_question')
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    const data = await response.json()
    setReply(response.ok ? data : { answer: data.error || 'Unable to answer right now.', links: [] })
    setLoading(false)
  }

  return (
    <>
      {open && (
        <section
          aria-label="Portfolio assistant"
          className="fixed bottom-20 right-4 z-[100] w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-white/15 bg-[#0c0c0c]/95 p-5 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <div>
                <h2 className="text-sm font-semibold">Ask about Sahad</h2>
                <p className="text-[11px] text-white/40">Projects, skills, availability, and CV</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {reply && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm leading-6 text-white/75">{reply.answer}</p>
              {reply.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {reply.links.map((link) => (
                    <Link key={`${link.href}-${link.label}`} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white hover:text-black">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={ask} className="flex gap-2">
            <label className="sr-only" htmlFor="portfolio-assistant-question">Ask a question</label>
            <input
              id="portfolio-assistant-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Which React projects has Sahad built?"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/30"
            />
            <button type="submit" disabled={loading} aria-label="Send question"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open portfolio assistant"
        className="fixed bottom-5 right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white text-black shadow-2xl transition hover:scale-105"
      >
        <Bot size={20} />
      </button>
    </>
  )
}
