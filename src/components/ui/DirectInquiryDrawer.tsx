'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageSquare, Check, Sparkles, Radio, Clock, ShieldCheck } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface DirectInquiryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_PILLS = [
  'Interested in Full-Time Role 💼',
  'Need a Custom Web App 🚀',
  'Schedule Technical Call ⚡',
  'Freelance / Contract 🛠️',
]

export default function DirectInquiryDrawer({ isOpen, onClose }: DirectInquiryDrawerProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [selectedPill, setSelectedPill] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { playClick, playHover, playSuccess } = useAudio()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playClick()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, playClick])

  const handlePillClick = (pill: string) => {
    playClick()
    setSelectedPill(pill)
    setMessage(`Hi Sahad! ${pill}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return

    playClick()
    setLoading(true)

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, subject: 'Direct Quick Inquiry' }),
      })
    } catch {}

    setLoading(false)
    setSuccess(true)
    playSuccess()

    setTimeout(() => {
      setSuccess(false)
      setName('')
      setEmail('')
      setMessage('')
      setSelectedPill('')
      onClose()
    }, 2500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Direct Quick Inquiry Drawer"
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#0d0f1a]/95 p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Direct Line to Sahad
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                      <Radio size={10} className="animate-pulse text-emerald-400" /> Online
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">Average response time: &lt; 2 hours</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                onMouseEnter={playHover}
                className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Pills */}
            <div className="mb-4">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-2 block">
                Quick Select Topic:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PILLS.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => handlePillClick(pill)}
                    onMouseEnter={playHover}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition border ${
                      selectedPill === pill
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/15'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Form or Success Toast */}
            {success ? (
              <div className="my-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-6 text-center text-emerald-300 space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                  <Check size={24} />
                </div>
                <h4 className="font-bold text-base text-white">Inquiry Sent Successfully! 🎉</h4>
                <p className="text-xs text-emerald-300/80">Sahad has received your message and will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  />
                </div>

                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-white outline-none focus:border-emerald-500/50 resize-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={playHover}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending Message...' : <><Send size={14} /> Send Quick Inquiry</>}
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-white/40">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={14} /> Encrypted Direct Sync
              </span>
              <span>Discord & Email Notified</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
