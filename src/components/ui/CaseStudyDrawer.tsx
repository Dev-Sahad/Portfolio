'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, X, Cpu, Database, Zap, ShieldCheck, Layers, ArrowRight } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface CaseStudyDrawerProps {
  isOpen: boolean
  onClose: () => void
  projectTitle?: string
}

export default function CaseStudyDrawer({
  isOpen,
  onClose,
  projectTitle = 'Featured Project Architecture',
}: CaseStudyDrawerProps) {
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
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, playClick])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-end bg-black/80 backdrop-blur-xl">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Engineering Architecture Case Study"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative flex flex-col w-full max-w-2xl h-full overflow-hidden border-l border-white/20 bg-[#0d0e17]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Case Study Breakdown
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] text-cyan-300 font-mono">
                      {projectTitle}
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">Engineering decisions, ERD schema & latency benchmarks</p>
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Performance Impact Metrics */}
              <div>
                <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">
                  ⚡ Performance Optimization Results
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                    <p className="text-[10px] font-mono text-white/40">FCP Speed</p>
                    <p className="text-base font-bold text-emerald-400 font-mono mt-1">2.4s ➔ 0.4s</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                    <p className="text-[10px] font-mono text-white/40">Bundle Weight</p>
                    <p className="text-base font-bold text-cyan-400 font-mono mt-1">-65% Reduction</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                    <p className="text-[10px] font-mono text-white/40">Lighthouse</p>
                    <p className="text-base font-bold text-purple-400 font-mono mt-1">100/100</p>
                  </div>
                </div>
              </div>

              {/* Database ERD Schema */}
              <div>
                <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Database size={14} /> Database ERD & Row-Level Security
                </h4>
                <div className="rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs space-y-2 text-white/80">
                  <p className="text-purple-300 font-bold">TABLE projects (id, title, live_url, created_at);</p>
                  <p className="text-emerald-300 font-bold">CREATE POLICY &ldquo;Public Read Access&rdquo; ON projects FOR SELECT USING (true);</p>
                  <p className="text-amber-300 font-bold">CREATE POLICY &ldquo;Admin Write Access&rdquo; ON projects FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));</p>
                </div>
              </div>

              {/* API Pipeline Architecture */}
              <div>
                <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Layers size={14} /> System Execution Pipeline
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[11px]">1</span>
                    <div>
                      <h5 className="font-bold text-white">Next.js 15 App Router SSR</h5>
                      <p className="text-white/50 text-[11px]">Streaming server components & Edge middleware verification</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[11px]">2</span>
                    <div>
                      <h5 className="font-bold text-white">Supabase Realtime PostgreSQL</h5>
                      <p className="text-white/50 text-[11px]">Postgres database triggers & automatic Webhook dispatch</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[11px]">3</span>
                    <div>
                      <h5 className="font-bold text-white">Vercel Edge Global CDN</h5>
                      <p className="text-white/50 text-[11px]">Sub-20ms latency responses distributed across 300+ edge nodes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/40 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={14} /> Production Certified
              </span>
              <span>Architected by Sahad</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
