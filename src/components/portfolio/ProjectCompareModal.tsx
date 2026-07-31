'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, GitBranch, Layers, Code2, ArrowRightLeft } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface Project {
  id: string | number
  title: string
  description: string
  technologies?: string
  key_features?: string
  live_url?: string
  github_url?: string
  image_url?: string
}

function stripHtml(text: string = '') {
  return text.replace(/<[^>]*>?/gm, '').replace(/&[a-z0-9#]+;/gi, ' ').trim()
}

interface ProjectCompareModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
}

export default function ProjectCompareModal({
  isOpen,
  onClose,
  projects,
}: ProjectCompareModalProps) {
  const { playClick, playHover } = useAudio()

  if (projects.length === 0) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#0c0d14]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    Side-by-Side Project Comparison
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs text-cyan-300 font-mono">
                      {projects.length} Projects Selected
                    </span>
                  </h3>
                  <p className="text-xs text-white/40">Comparing architecture, tech stack & feature breakdown</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                onMouseEnter={playHover}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid Columns */}
            <div className={`grid gap-6 ${projects.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
              {projects.map((p) => {
                const techList = (p.technologies || '').split(',').filter(Boolean)
                const featureList = (p.key_features || '').split(',').filter(Boolean)

                return (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4"
                  >
                    <div>
                      {/* Image */}
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-40 object-cover rounded-xl border border-white/10 mb-4"
                        />
                      )}

                      <h4 className="text-base font-bold text-white mb-2">{p.title}</h4>
                      <p className="text-xs leading-5 text-white/60 line-clamp-3 mb-4">{stripHtml(p.description)}</p>

                      {/* Tech Stack */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-white/40 mb-2 flex items-center gap-1">
                          <Code2 size={13} /> Tech Stack ({techList.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {techList.map((t, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-[10px] font-mono text-cyan-300"
                            >
                              {stripHtml(t)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Main Features */}
                      {featureList.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-white/40 mb-2 flex items-center gap-1">
                            <Layers size={13} /> Key Features
                          </p>
                          <ul className="space-y-1 text-xs text-white/70">
                            {featureList.slice(0, 4).map((f, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-cyan-400">•</span>
                                <span className="line-clamp-1">{stripHtml(f)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      {p.live_url && (
                        <a
                          href={p.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 border border-white/15 py-2 text-xs font-medium hover:bg-white hover:text-black transition"
                        >
                          <ExternalLink size={13} /> Live Demo
                        </a>
                      )}
                      {p.github_url && (
                        <a
                          href={p.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 py-2 text-xs text-white/70 hover:bg-white/15 hover:text-white transition"
                        >
                          <GitBranch size={13} /> Code
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
