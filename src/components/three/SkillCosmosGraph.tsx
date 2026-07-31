'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Layers, Sparkles, Code2, CheckCircle2 } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface SkillNode {
  id: string
  name: string
  category: string
  experience: string
  projectsCount: number
  color: string
}

const SKILL_NODES: SkillNode[] = [
  { id: 'nextjs', name: 'Next.js 15', category: 'Frontend Framework', experience: '2+ Years', projectsCount: 14, color: 'text-white border-white/40 bg-white/10' },
  { id: 'react', name: 'React 19', category: 'UI Library', experience: '2+ Years', projectsCount: 18, color: 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10' },
  { id: 'typescript', name: 'TypeScript', category: 'Language', experience: '2+ Years', projectsCount: 16, color: 'text-blue-300 border-blue-400/40 bg-blue-500/10' },
  { id: 'threejs', name: 'Three.js / WebGL', category: '3D & Motion', experience: '1+ Year', projectsCount: 8, color: 'text-purple-300 border-purple-400/40 bg-purple-500/10' },
  { id: 'supabase', name: 'Supabase Postgres', category: 'Backend & DB', experience: '1.5+ Years', projectsCount: 12, color: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Styling Engine', experience: '2+ Years', projectsCount: 20, color: 'text-teal-300 border-teal-400/40 bg-teal-500/10' },
]

export default function SkillCosmosGraph() {
  const [selectedNode, setSelectedNode] = useState<SkillNode>(SKILL_NODES[0])
  const { playClick, playHover } = useAudio()

  const handleSelect = (node: SkillNode) => {
    playClick()
    setSelectedNode(node)
  }

  return (
    <div className="my-10 rounded-3xl border border-white/15 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Cpu className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              Tech Stack Cosmos Matrix
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] text-purple-300 font-mono">
                Interactive Graph
              </span>
            </h3>
            <p className="text-xs text-white/50">Click nodes to inspect technical mastery & production usage</p>
          </div>
        </div>
      </div>

      {/* Nodes Interactive Cluster */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {SKILL_NODES.map((node) => {
          const isSelected = selectedNode.id === node.id
          return (
            <motion.button
              key={node.id}
              type="button"
              onClick={() => handleSelect(node)}
              onMouseEnter={playHover}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-mono transition border ${
                isSelected
                  ? 'border-purple-400 bg-purple-500/25 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)] font-bold'
                  : node.color
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              {node.name}
            </motion.button>
          )
        })}
      </div>

      {/* Node Detail Card */}
      <div className="rounded-2xl border border-purple-500/30 bg-black/50 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">
            {selectedNode.category}
          </span>
          <h4 className="text-xl font-bold text-white flex items-center gap-2">
            {selectedNode.name}
            <CheckCircle2 size={16} className="text-emerald-400" />
          </h4>
          <p className="text-xs text-white/60 mt-1">
            Proven production experience building responsive interfaces & serverless pipelines.
          </p>
        </div>

        <div className="flex gap-4 shrink-0 font-mono text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-[10px] text-white/40 uppercase block">Experience</span>
            <span className="text-sm font-bold text-cyan-300">{selectedNode.experience}</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-[10px] text-white/40 uppercase block">Projects Built</span>
            <span className="text-sm font-bold text-emerald-300">{selectedNode.projectsCount}+</span>
          </div>
        </div>
      </div>
    </div>
  )
}
