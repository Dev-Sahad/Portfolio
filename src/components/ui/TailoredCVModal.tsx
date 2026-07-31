'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, X, Check, Printer, Download, Sparkles, Sliders, ExternalLink } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface SkillOption {
  id: string
  label: string
  category: string
  highlight: string
}

const SKILL_OPTIONS: SkillOption[] = [
  { id: 'nextjs', label: 'Next.js 15 & Server Components', category: 'Frontend', highlight: 'App Router, Suspense Streaming & SSR' },
  { id: 'typescript', label: 'TypeScript 5 & Strict Typing', category: 'Language', highlight: 'Strict interfaces & type-safe schemas' },
  { id: 'threejs', label: 'Three.js & 3D WebGL Graphics', category: '3D & Motion', highlight: '3D orbit scenes & R3F canvas' },
  { id: 'supabase', label: 'Supabase Postgres & RLS', category: 'Backend', highlight: 'Realtime DB, Auth & Security policies' },
  { id: 'tailwind', label: 'Tailwind CSS & Glassmorphism UI', category: 'Styling', highlight: 'Modern design system & dark modes' },
  { id: 'webapi', label: 'AI Speech & Web Audio APIs', category: 'Browser APIs', highlight: 'Voice synthesis & procedural sound' },
]

interface TailoredCVModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TailoredCVModal({ isOpen, onClose }: TailoredCVModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'nextjs',
    'typescript',
    'threejs',
    'supabase',
    'tailwind',
  ])
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

  const toggleSkill = (id: string) => {
    playClick()
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handlePrint = () => {
    playClick()
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Tailored Resume CV Builder"
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 bg-[#0d0e17]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Live Tailored CV Builder
                    <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] text-purple-300 font-mono">
                      Custom Resume Export
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">Select skills below to generate a tailored CV view for your hiring needs</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  onMouseEnter={playHover}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  <Printer size={14} /> Print / Export PDF
                </button>
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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Skill Checkbox Selectors */}
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <Sliders size={12} /> Target Requirements Filter:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SKILL_OPTIONS.map((opt) => {
                    const isChecked = selectedSkills.includes(opt.id)
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleSkill(opt.id)}
                        onMouseEnter={playHover}
                        className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-xs transition border ${
                          isChecked
                            ? 'border-purple-400/50 bg-purple-500/15 text-white font-medium'
                            : 'border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            isChecked ? 'border-purple-400 bg-purple-500 text-white' : 'border-white/30'
                          }`}
                        >
                          {isChecked && <Check size={10} />}
                        </div>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tailored CV Live Preview Sheet */}
              <div id="tailored-cv-print" className="rounded-2xl border border-white/10 bg-black/60 p-6 space-y-4 font-sans text-white/90 shadow-xl">
                {/* CV Header */}
                <div className="flex justify-between items-start border-b border-white/10 pb-4 flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-white">MUHAMMAD SAHAD</h2>
                    <p className="text-xs font-mono text-purple-400 mt-0.5">Frontend Developer & UI Engineer</p>
                    <p className="text-[11px] text-white/50 mt-1">UAE / Global Remote | sahad.is-a.dev</p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-white/40">
                    <p>Status: Available for Hire</p>
                    <p>Verified Portfolio Candidate</p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div>
                  <h4 className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">Tailored Executive Summary</h4>
                  <p className="text-xs leading-relaxed text-white/80">
                    Frontend Developer specializing in building high-performance, visually engaging web applications. Experienced in architecting production-ready applications with modern web stacks, interactive 3D WebGL graphics, and robust serverless backends.
                  </p>
                </div>

                {/* Selected Targeted Skills */}
                <div>
                  <h4 className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2">Targeted Core Competencies</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SKILL_OPTIONS.filter((s) => selectedSkills.includes(s.id)).map((item) => (
                      <div key={item.id} className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2.5">
                        <h5 className="font-bold text-xs text-white">{item.label}</h5>
                        <p className="text-[11px] font-mono text-purple-300 mt-0.5">{item.highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portfolio Showcase Accomplishments */}
                <div>
                  <h4 className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-1.5">Key Technical Accomplishments</h4>
                  <ul className="list-disc list-inside text-xs space-y-1 text-white/80">
                    <li>Designed & built full-stack developer portfolio with Next.js 15, React 19, Supabase, & Three.js</li>
                    <li>Implemented Row Level Security (RLS) policies guarding PostgreSQL database schema</li>
                    <li>Architected Web Speech AI Assistant & developer terminal CLI modal with celebratory actions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
              <span className="text-white/40 font-mono text-[11px]">
                {selectedSkills.length} of {SKILL_OPTIONS.length} Skills Selected
              </span>
              <a
                href="https://drive.google.com/file/d/1KqECb-TA5sgncNXY2pajnUX7bwAM6ASM/view?usp=drivesdk"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="flex items-center gap-1.5 text-purple-300 font-bold hover:underline"
              >
                Download Official PDF Resume <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
