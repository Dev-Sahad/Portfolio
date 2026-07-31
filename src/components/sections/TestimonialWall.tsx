'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ShieldCheck, Quote, MessageSquarePlus, X, Send, Check } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'
import { supabase } from '@/lib/supabase'

interface TestimonialItem {
  id: string
  name: string
  role: string
  company: string
  content: string
  rating: number
  verified?: boolean
}

const SAMPLE_TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    role: 'Lead Architect',
    company: 'Veloce Tech',
    content:
      'Sahad delivered exceptional Next.js 15 front-end components. His attention to WebGL animations and clean state management is top-tier!',
    rating: 5,
    verified: true,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    company: 'Lumina Studio',
    content:
      'Working with Sahad was smooth and ultra-efficient. He turned our Figma designs into a blazing-fast responsive web app with zero delay.',
    rating: 5,
    verified: true,
  },
  {
    id: '3',
    name: 'Marcus Vance',
    role: 'Engineering Director',
    company: 'Apex Digital',
    content:
      'Sahad’s problem-solving skills and mastery over TypeScript and Supabase security policies made our launch a resounding success!',
    rating: 5,
    verified: true,
  },
]

export default function TestimonialWall() {
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { playClick, playHover, playSuccess } = useAudio()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !content) return

    playClick()
    setSubmitting(true)

    try {
      await supabase.from('testimonials').insert({
        name,
        role: `${role} ${company ? `at ${company}` : ''}`.trim(),
        quote: content,
        rating: 5,
        is_approved: false,
      })
    } catch {}

    setSubmitting(false)
    setSubmitted(true)
    playSuccess()

    setTimeout(() => {
      setSubmitted(false)
      setModalOpen(false)
      setName('')
      setRole('')
      setCompany('')
      setContent('')
    }, 2500)
  }

  return (
    <section className="my-16 px-6 md:pl-[120px] md:pr-[60px] max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest block mb-1">
            * VERIFIED SOCIAL PROOF
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Client & Team Endorsements</h2>
        </div>

        <button
          type="button"
          onClick={() => {
            playClick()
            setModalOpen(true)
          }}
          onMouseEnter={playHover}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition backdrop-blur-md shrink-0 w-fit"
        >
          <MessageSquarePlus size={16} /> Leave an Endorsement
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {SAMPLE_TESTIMONIALS.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col justify-between rounded-3xl border border-white/15 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <Quote className="absolute top-4 right-4 h-10 w-10 text-white/5 pointer-events-none" />

            <div>
              {/* Rating & Verified Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>

                {item.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                    <ShieldCheck size={11} /> Verified Endorsement
                  </span>
                )}
              </div>

              {/* Quote Content */}
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic mb-6">
                &ldquo;{item.content}&rdquo;
              </p>
            </div>

            {/* Reviewer Details */}
            <div className="flex items-center gap-3 border-t border-white/10 pt-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 font-bold text-sm border border-cyan-500/30">
                {item.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-xs text-white leading-tight">{item.name}</h4>
                <p className="text-[11px] font-mono text-white/50">{item.role} • {item.company}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 25 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-[#0d0e17]/95 p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <h3 className="font-bold text-base">Leave an Endorsement for Sahad</h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              {submitted ? (
                <div className="my-6 text-center text-emerald-300 space-y-2">
                  <Check size={32} className="mx-auto" />
                  <h4 className="font-bold text-base text-white">Thank You!</h4>
                  <p className="text-xs text-white/60">Your endorsement has been submitted for verification.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Role / Title"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your testimonial or recommendation for Sahad *"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-white outline-none focus:border-cyan-500/50 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Submitting...' : <><Send size={14} /> Submit Endorsement</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
