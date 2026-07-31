'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, FileText, Send, Star, Heart } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export default function OutroExitModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const { playClick, playHover, playSuccess } = useAudio()

  useEffect(() => {
    // Only trigger once per session
    if (typeof window === 'undefined') return
    const hasSeenOutro = sessionStorage.getItem('_outro_seen')
    if (hasSeenOutro) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsOpen(true)
        sessionStorage.setItem('_outro_seen', 'true')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  const handleClose = () => {
    playClick()
    setIsOpen(false)
  }

  const handleRate = (r: number) => {
    playSuccess()
    setRating(r)
    setSubmitted(true)
    setTimeout(() => setIsOpen(false), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 320, damping: 25 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-[#0b0c16]/95 p-7 shadow-2xl backdrop-blur-2xl text-white text-center"
          >
            <button
              type="button"
              onClick={handleClose}
              onMouseEnter={playHover}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/15 hover:text-white transition"
            >
              <X size={16} />
            </button>

            {/* Glowing Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              <Sparkles size={28} className="animate-bounce" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Thank You for Visiting! ✨</h3>
            <p className="text-xs leading-6 text-white/60 mb-6 max-w-sm mx-auto">
              Before you go, Sahad is currently available for full-time roles, contracts, and high-impact web projects.
            </p>

            {/* Rating */}
            {submitted ? (
              <div className="mb-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 p-3 text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
                <Heart size={16} className="fill-emerald-300" /> Thank you for your feedback! Have a great day!
              </div>
            ) : (
              <div className="mb-6 space-y-2">
                <p className="text-[11px] font-mono text-white/40">Rate your experience on this portfolio:</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRate(star)}
                      onMouseEnter={playHover}
                      className="p-1 transition hover:scale-125"
                    >
                      <Star
                        size={20}
                        className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href="#contact"
                onClick={handleClose}
                onMouseEnter={playHover}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white text-black py-3 text-xs font-bold hover:bg-white/90 transition shadow-lg"
              >
                <Send size={14} /> Hire Sahad
              </a>
              <button
                type="button"
                onClick={handleClose}
                onMouseEnter={playHover}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-3 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                Continue Browsing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
