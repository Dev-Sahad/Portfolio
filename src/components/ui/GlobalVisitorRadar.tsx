'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, X, Activity, ShieldCheck, Radio, Sparkles, MapPin } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface VisitorPing {
  id: string
  country: string
  flag: string
  city: string
  latency: string
  timeAgo: string
}

const SAMPLE_PINGS: VisitorPing[] = [
  { id: '1', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Dubai', latency: '14ms', timeAgo: 'Just now' },
  { id: '2', country: 'United States', flag: '🇺🇸', city: 'San Francisco', latency: '82ms', timeAgo: '2m ago' },
  { id: '3', country: 'United Kingdom', flag: '🇬🇧', city: 'London', latency: '45ms', timeAgo: '5m ago' },
  { id: '4', country: 'Germany', flag: '🇩🇪', city: 'Frankfurt', latency: '38ms', timeAgo: '8m ago' },
  { id: '5', country: 'Singapore', flag: '🇸🇬', city: 'Singapore', latency: '62ms', timeAgo: '12m ago' },
  { id: '6', country: 'India', flag: '🇮🇳', city: 'Bengaluru', latency: '28ms', timeAgo: '15m ago' },
]

interface GlobalVisitorRadarProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalVisitorRadar({ isOpen, onClose }: GlobalVisitorRadarProps) {
  const [activeCount, setActiveCount] = useState(14)
  const { playClick, playHover } = useAudio()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playClick()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    const interval = setInterval(() => {
      setActiveCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1))
    }, 4000)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearInterval(interval)
    }
  }, [isOpen, onClose, playClick])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Global Visitor Radar"
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-[#0c0d16]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Globe className="h-5 w-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Global Visitor Radar
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                      <Radio size={10} className="animate-pulse" /> Live
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">Real-time edge activity map & response metrics</p>
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

            {/* Radar Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase">Active Now</p>
                <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase">Avg Latency</p>
                <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">18ms</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase">CDN Status</p>
                <p className="text-lg font-bold text-purple-400 font-mono mt-0.5">100%</p>
              </div>
            </div>

            {/* Live Visitor Feed */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-2">
                Recent International Pings:
              </div>
              {SAMPLE_PINGS.map((ping) => (
                <div
                  key={ping.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{ping.flag}</span>
                    <div>
                      <h4 className="font-bold text-white leading-tight">{ping.city}, {ping.country}</h4>
                      <p className="text-[10px] font-mono text-white/40">{ping.timeAgo}</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                    {ping.latency}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/40 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} /> Vercel Edge Network Protected
              </span>
              <span>Supabase Realtime</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
