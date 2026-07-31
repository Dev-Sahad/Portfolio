'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Code2, Cpu, Globe, Layers, Zap } from 'lucide-react'

const GRAPHIC_ITEMS = [
  { title: 'Next.js 15 App Architecture', icon: Globe, tag: 'Full-Stack SSR', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
  { title: 'Interactive 3D WebGL / Three.js', icon: Cpu, tag: '3D Graphics', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
  { title: 'Supabase Realtime PostgreSQL', icon: Layers, tag: 'Realtime Backend', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
  { title: 'Web Audio API Sound Engine', icon: Zap, tag: 'Procedural Audio', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
  { title: 'Tailwind CSS Glassmorphism', icon: Code2, tag: 'Modern UI/UX', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30' },
]

export default function GraphicScrollBanner() {
  return (
    <section className="relative my-16 overflow-hidden py-8">
      <div className="mb-6 flex items-center justify-center gap-2 font-mono text-xs text-white/50">
        <Sparkles size={14} className="text-purple-400 animate-spin-slow" />
        <span>VISUAL & TECHNICAL GRAPHIC HIGHLIGHTS</span>
        <Sparkles size={14} className="text-cyan-400 animate-spin-slow" />
      </div>

      <div className="flex select-none gap-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex shrink-0 gap-6"
        >
          {[...GRAPHIC_ITEMS, ...GRAPHIC_ITEMS].map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className={`relative flex w-72 shrink-0 items-center gap-4 rounded-3xl border bg-gradient-to-br ${item.color} ${item.border} p-4.5 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-inner">
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-mono font-bold text-white/80">
                    {item.tag}
                  </span>
                  <h4 className="mt-1 text-xs font-bold text-white leading-tight">{item.title}</h4>
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
