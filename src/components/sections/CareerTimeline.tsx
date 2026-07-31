'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Code2, Sparkles, ChevronRight, CheckCircle, Terminal, Layers } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface TimelineNode {
  year: string
  title: string
  role: string
  description: string
  skills: string[]
  achievements: string[]
  codeSnippet?: string
}

const TIMELINE_NODES: TimelineNode[] = [
  {
    year: '2023',
    title: 'Foundations & Web Core',
    role: 'Frontend Engineering Journey Starts',
    description:
      'Mastered Semantic HTML5, CSS3 Glassmorphism, JavaScript ES6+ async fundamentals, DOM manipulation, and responsive cross-browser layouts.',
    skills: ['HTML5 / CSS3', 'JavaScript ES6+', 'DOM API', 'Git & GitHub', 'Flexbox / Grid'],
    achievements: [
      'Built 10+ responsive landing pages and web interface layouts',
      'Established modular CSS architecture and mobile-first responsive design patterns',
    ],
    codeSnippet: `const dev = { name: "Muhammad Sahad", focus: "Frontend" };
console.log(\`Starting developer journey in \${dev.focus}\`);`,
  },
  {
    year: '2024',
    title: 'Modern Stack & Backend Integration',
    role: 'Full-Stack React & Next.js Developer',
    description:
      'Adopted React 18/19, Next.js App Router, TypeScript 5, Supabase database, RLS security policies, and Tailwind CSS design systems.',
    skills: ['Next.js App Router', 'React 19', 'TypeScript', 'Supabase Postgres', 'Tailwind CSS'],
    achievements: [
      'Integrated real-time database, OAuth, and file storage pipelines in Supabase',
      'Built production-ready dashboards and administrative operations centers',
    ],
    codeSnippet: `const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'featured');`,
  },
  {
    year: '2025 - Present',
    title: '3D WebGL, AI & High-Performance Web Apps',
    role: 'Creative Frontend & Interactive Developer',
    description:
      'Architected cinematic portfolio featuring Three.js 3D Skill Galaxy, Web Audio synthesizer, AI Speech Assistant, and custom developer CLI.',
    skills: ['Three.js / WebGL', 'Web Audio API', 'Web Speech API', 'Framer Motion', 'Discord Webhooks'],
    achievements: [
      'Created 3D interactive spinning skill orbit galaxy with raycaster tooltips',
      'Implemented AI voice synthesis assistant & full-screen terminal CLI',
    ],
    codeSnippet: `// 3D Skill Orbit Animation Loop
useFrame((state, delta) => {
  if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
});`,
  },
]

export default function CareerTimeline() {
  const [selectedIdx, setSelectedIdx] = useState(2)
  const { playClick, playHover } = useAudio()

  const currentNode = TIMELINE_NODES[selectedIdx]

  return (
    <div className="my-10 rounded-3xl border border-white/15 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-purple-400 h-5 w-5" /> Interactive Developer Roadmap
          </h3>
          <p className="text-xs text-white/50">Click any milestone node below to inspect achievements & code evolution</p>
        </div>
        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300 font-mono border border-purple-500/30">
          3 Milestone Nodes
        </span>
      </div>

      {/* Timeline Node Buttons */}
      <div className="relative mb-8 flex items-center justify-between">
        <div className="absolute left-6 right-6 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-white/15" />
        {TIMELINE_NODES.map((node, idx) => {
          const isSelected = selectedIdx === idx
          return (
            <button
              key={node.year}
              type="button"
              onClick={() => {
                playClick()
                setSelectedIdx(idx)
              }}
              onMouseEnter={playHover}
              className={`flex flex-col items-center gap-1.5 transition ${
                isSelected ? 'scale-110' : 'hover:scale-105 opacity-70'
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition shadow-xl ${
                  isSelected
                    ? 'border-purple-400 bg-purple-500/30 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] font-bold'
                    : 'border-white/20 bg-[#12131f] text-white/60'
                }`}
              >
                <Calendar size={18} />
              </div>
              <span className={`text-xs font-mono font-semibold ${isSelected ? 'text-purple-300' : 'text-white/60'}`}>
                {node.year}
              </span>
            </button>
          )
        })}
      </div>

      {/* Node Details Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNode.year}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-mono text-purple-400">{currentNode.role}</span>
              <h4 className="text-base font-bold text-white">{currentNode.title}</h4>
            </div>
            <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-white/70">
              {currentNode.year}
            </span>
          </div>

          <p className="text-xs text-white/70 leading-relaxed">{currentNode.description}</p>

          {/* Skills Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentNode.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-mono text-purple-300"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Achievements */}
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-mono text-white/50 uppercase tracking-wider">Key Milestones:</h5>
            {currentNode.achievements.map((ach, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                <span>{ach}</span>
              </div>
            ))}
          </div>

          {/* Code Snippet */}
          {currentNode.codeSnippet && (
            <div className="mt-3 rounded-xl border border-white/10 bg-[#090a10] p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              <div className="flex items-center gap-1.5 text-white/40 text-[10px] mb-1.5 pb-1 border-b border-white/10">
                <Terminal size={12} /> Code Snippet ({currentNode.year})
              </div>
              <pre><code>{currentNode.codeSnippet}</code></pre>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
