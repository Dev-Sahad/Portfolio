'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Cpu, Rocket, FileText, ArrowUpRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export type PitchRole = 'tech_lead' | 'founder' | 'recruiter'

interface RoleContent {
  id: PitchRole
  title: string
  subtitle: string
  icon: React.ReactNode
  badge: string
  highlights: string[]
  quote: string
  actionText: string
  actionHref: string
}

export default function RolePitchSelector() {
  const [activeRole, setActiveRole] = useState<PitchRole>('tech_lead')
  const { playClick, playHover } = useAudio()

  const rolesContent: Record<PitchRole, RoleContent> = {
    tech_lead: {
      id: 'tech_lead',
      title: 'CTO & Tech Leads',
      subtitle: 'Scalable Systems, High Performance & Clean Code',
      icon: <Cpu className="h-4 w-4" />,
      badge: 'Production-Grade Architecture',
      highlights: [
        'Next.js 15 App Router, React 19, Server Components & Suspense Streaming',
        'Strict TypeScript 5 schemas, Supabase Postgres, RLS Policies & Webhooks',
        'Three.js WebGL rendering, Web Audio API synthesis & 100 Lighthouse optimization',
      ],
      quote:
        'I write maintainable, self-documenting code with zero compromises on performance, accessibility, or security.',
      actionText: 'Inspect System Architecture',
      actionHref: '#portfolio',
    },
    founder: {
      id: 'founder',
      title: 'Startup Founders',
      subtitle: 'Rapid MVP Execution, Eye-Catching UX & Speed',
      icon: <Rocket className="h-4 w-4" />,
      badge: 'Speed to Market',
      highlights: [
        'Transforming product ideas into polished, production-ready web apps fast',
        'Glassmorphic UI design system, custom 3D animations & interactive micro-interactions',
        'Turnkey Supabase auth, real-time database, file storage & payment integrations',
      ],
      quote:
        'I help startups launch standout products that wow early adopters and turn visitors into active users.',
      actionText: 'Discuss Your Project',
      actionHref: '#contact',
    },
    recruiter: {
      id: 'recruiter',
      title: 'Recruiters & HR',
      subtitle: 'Verified Background, Full-Time / Contract Ready',
      icon: <Briefcase className="h-4 w-4" />,
      badge: 'Immediate Availability',
      highlights: [
        'Junior Frontend & Full-Stack Web Developer with proven hands-on builds',
        'Strong collaboration skills, quick learner of new tech stacks & framework standards',
        'Verified credential badges, live client projects & clean GitHub history',
      ],
      quote:
        'Available for full-time frontend roles, remote contracts, and engineering team opportunities.',
      actionText: 'Download Verified Resume / CV',
      actionHref: 'https://drive.google.com/file/d/1KqECb-TA5sgncNXY2pajnUX7bwAM6ASM/view?usp=drivesdk',
    },
  }

  const current = rolesContent[activeRole]

  return (
    <div className="my-8 rounded-3xl border border-white/15 bg-white/[0.03] p-6 backdrop-blur-xl shadow-2xl">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider">
          <Zap size={14} className="text-purple-400" />
          <span>Tailored Persona Elevator Pitch</span>
        </div>
        <span className="text-[11px] font-mono text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
          Select Your Role Below
        </span>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 mb-6">
        {(Object.keys(rolesContent) as PitchRole[]).map((roleKey) => {
          const item = rolesContent[roleKey]
          const isActive = activeRole === roleKey
          return (
            <button
              key={roleKey}
              type="button"
              onClick={() => {
                playClick()
                setActiveRole(roleKey)
              }}
              onMouseEnter={playHover}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-white font-bold border border-purple-400/40 shadow-lg'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.title}</span>
              <span className="sm:hidden">{item.title.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>

      {/* Dynamic Content Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {current.title}
              </h3>
              <p className="text-xs text-white/60">{current.subtitle}</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300 font-mono font-medium flex items-center gap-1.5">
              <ShieldCheck size={14} /> {current.badge}
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {current.highlights.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed">
                <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <blockquote className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs italic text-white/70">
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          <div className="pt-2 flex justify-end">
            <a
              href={current.actionHref}
              target={current.actionHref.startsWith('http') ? '_blank' : '_self'}
              rel={current.actionHref.startsWith('http') ? 'noopener noreferrer' : ''}
              onClick={playClick}
              onMouseEnter={playHover}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2.5 text-xs font-bold hover:bg-white/90 transition shadow-lg"
            >
              {current.actionText} <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
