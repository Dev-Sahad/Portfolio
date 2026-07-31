'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, X, ShieldCheck, Zap, Database, Server, Globe, ArrowRight, Code, Activity } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface ArchitectureNode {
  id: string
  title: string
  subtitle: string
  category: string
  icon: React.ReactNode
  latency: string
  security: string
  details: string[]
}

const ARCH_NODES: ArchitectureNode[] = [
  {
    id: 'frontend',
    title: 'Next.js 15 App Router',
    subtitle: 'Client & Server Components',
    category: 'Presentation Layer',
    icon: <Globe className="h-5 w-5 text-cyan-400" />,
    latency: '< 12ms Edge SSR',
    security: 'Content Security Policy & Strict Headers',
    details: [
      'React 19 Server Components with streaming hydration',
      'Glassmorphic UI layout with dynamic CSS variable accent engine',
      'Three.js WebGL 3D Skill Galaxy & Web Audio synthesizer engine',
    ],
  },
  {
    id: 'database',
    title: 'Supabase Postgres DB',
    subtitle: 'Realtime Data & Auth Engine',
    category: 'Database & Auth Layer',
    icon: <Database className="h-5 w-5 text-emerald-400" />,
    latency: '~ 18ms Query Latency',
    security: 'Row Level Security (RLS) & JWT Auth',
    details: [
      'PostgreSQL schema with atomic foreign key constraints',
      'Row Level Security policies guarding admin & visitor operations',
      'Supabase Storage buckets for guestbook doodles & certificate assets',
    ],
  },
  {
    id: 'edge',
    title: 'Vercel Edge & Webhooks',
    subtitle: 'Serverless Functions & Discord Sync',
    category: 'Infrastructure & Integration Layer',
    icon: <Server className="h-5 w-5 text-purple-400" />,
    latency: '~ 25ms Webhook Sync',
    security: 'HMAC Webhook Signing & Rate Limiting',
    details: [
      'Instant Discord Webhook notifications for visitor contact & guestbook notes',
      'Edge Middleware managing admin session security & route protection',
      'Vercel Analytics & Web Vitals real-time metric collection',
    ],
  },
]

interface SystemArchitectureModalProps {
  isOpen: boolean
  onClose: () => void
  projectTitle?: string
}

export default function SystemArchitectureModal({
  isOpen,
  onClose,
  projectTitle = 'Portfolio Architecture',
}: SystemArchitectureModalProps) {
  const [selectedNodeId, setSelectedNodeId] = useState('frontend')
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

  const selectedNode = ARCH_NODES.find((n) => n.id === selectedNodeId) || ARCH_NODES[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="System Architecture Inspector"
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-[#0c0d16]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    System Architecture Inspector
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] text-cyan-300 font-mono">
                      {projectTitle}
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">Interactive node-graph mapping end-to-end data pipeline</p>
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

            {/* Architecture Node Pipeline Graph */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {ARCH_NODES.map((node) => {
                const isSelected = selectedNodeId === node.id
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      playClick()
                      setSelectedNodeId(node.id)
                    }}
                    onMouseEnter={playHover}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-3 border transition text-center ${
                      isSelected
                        ? 'border-cyan-400/50 bg-cyan-500/15 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-black/40">{node.icon}</div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{node.title}</h4>
                      <p className="text-[10px] font-mono text-white/40">{node.category}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected Node Details Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-white/10 bg-black/50 p-5 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    {selectedNode.icon}
                    <div>
                      <h4 className="font-bold text-sm text-white">{selectedNode.title}</h4>
                      <p className="text-xs text-white/50">{selectedNode.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] font-mono">
                    <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-emerald-300 flex items-center gap-1">
                      <Activity size={12} /> {selectedNode.latency}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <h5 className="text-[11px] font-mono text-white/40 uppercase">Core Architectural Specs:</h5>
                  {selectedNode.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-white/80 leading-relaxed">
                      <Zap size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs text-white/70 font-mono">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Security & Policy: {selectedNode.security}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
