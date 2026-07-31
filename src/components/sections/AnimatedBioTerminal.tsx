'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Copy, Check, Play, RefreshCw, Sparkles, Code2, GitBranch } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

const TERMINAL_LINES = [
  { text: '> initiating sahad_os_kernel v2.5...', color: 'text-white/40' },
  { text: '> fetching profile from github.com/Dev-Sahad/Dev-Sahad...', color: 'text-cyan-400' },
  { text: '[SUCCESS] GitHub identity authenticated: Muhammad Sahad', color: 'text-emerald-400 font-bold' },
  { text: '---------------------------------------------------------', color: 'text-white/20' },
  { text: 'USER        : Muhammad Sahad (Dev-Sahad)', color: 'text-purple-300' },
  { text: 'ROLE        : Frontend Developer & UI Specialist', color: 'text-white' },
  { text: 'LOCATION    : Remote / Open to Global Opportunities', color: 'text-white/80' },
  { text: 'PRIMARY     : Next.js 15, React 19, TypeScript, Three.js', color: 'text-cyan-300' },
  { text: 'BACKEND     : Supabase RLS PostgreSQL, Vercel Edge, APIs', color: 'text-emerald-300' },
  { text: 'PORTFOLIO   : 28+ Production Apps, WebGL 3D Scenes, Telemetry', color: 'text-amber-300' },
  { text: '---------------------------------------------------------', color: 'text-white/20' },
  { text: '> git log --oneline -n 3', color: 'text-cyan-400' },
  { text: '  a1b2c3d feat: add 3D tech cosmos matrix graph', color: 'text-white/60' },
  { text: '  e4f5g6h feat: add AI portfolio co-pilot assistant', color: 'text-white/60' },
  { text: '  i7j8k9l feat: optimize Next.js 15 bundle & edge performance', color: 'text-white/60' },
  { text: '> status: READY_FOR_HIRE (Accepting Full-Time & Contracts)', color: 'text-emerald-400 font-bold' },
]

export default function AnimatedBioTerminal() {
  const [displayedLines, setDisplayedLines] = useState<typeof TERMINAL_LINES>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [customOutputs, setCustomOutputs] = useState<string[]>([])
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const { playClick, playHover } = useAudio()

  useEffect(() => {
    if (currentIndex < TERMINAL_LINES.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, TERMINAL_LINES[currentIndex]])
        setCurrentIndex((prev) => prev + 1)
      }, 140)
      return () => clearTimeout(timer)
    }
  }, [currentIndex])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayedLines, customOutputs])

  const handleRestart = () => {
    playClick()
    setDisplayedLines([])
    setCurrentIndex(0)
    setCustomOutputs([])
  }

  const handleCopy = () => {
    playClick()
    const textToCopy = TERMINAL_LINES.map((l) => l.text).join('\n')
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCustomCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    playClick()
    const cmd = inputVal.trim()
    setInputVal('')

    let response = `Command not recognized: "${cmd}". Type "help", "skills", "contact", or "projects".`
    const lower = cmd.toLowerCase()
    if (lower === 'help') {
      response = 'Available commands: help | skills | projects | contact | clear'
    } else if (lower === 'skills') {
      response = 'Skills: Next.js 15, React 19, TypeScript, Three.js, Supabase, Tailwind CSS'
    } else if (lower === 'projects') {
      response = 'Projects: 28 Production Builds | 3D Interactive WebGL Apps | Live CV Builder'
    } else if (lower === 'contact') {
      response = 'Email / Direct Line: Available via Navbar Direct Inquiry & AI Co-Pilot'
    } else if (lower === 'clear') {
      setCustomOutputs([])
      return
    }

    setCustomOutputs((prev) => [...prev, `> ${cmd}`, response])
  }

  return (
    <div className="my-10 rounded-3xl border border-white/15 bg-[#090a12]/95 p-6 backdrop-blur-2xl shadow-2xl overflow-hidden font-mono text-xs">
      {/* Terminal Window Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
          <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
          <span className="ml-2 font-bold text-white/70 text-xs flex items-center gap-1.5">
            <Terminal size={14} className="text-cyan-400" /> sahad@dev-pc:~ (zsh)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestart}
            onMouseEnter={playHover}
            className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/60 hover:bg-white/15 hover:text-white transition"
            title="Re-run terminal typewriter"
          >
            <RefreshCw size={12} /> Re-run
          </button>
          <button
            type="button"
            onClick={handleCopy}
            onMouseEnter={playHover}
            className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/60 hover:bg-white/15 hover:text-white transition"
            title="Copy terminal bio"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Terminal Code Screen */}
      <div className="h-72 overflow-y-auto space-y-1.5 pr-2 no-scrollbar">
        {displayedLines.map((line, i) => (
          <div key={i} className={`${line.color} leading-relaxed`}>
            {line.text}
          </div>
        ))}

        {customOutputs.map((out, idx) => (
          <div key={idx} className={out.startsWith('>') ? 'text-cyan-300 font-bold' : 'text-emerald-300'}>
            {out}
          </div>
        ))}

        <div ref={terminalEndRef} />
      </div>

      {/* Interactive Command Input */}
      <form onSubmit={handleCustomCommand} className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
        <span className="text-cyan-400 font-bold">&gt;</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type terminal command (try 'skills', 'projects', 'contact', 'help')..."
          className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30 font-mono"
        />
        <span className="h-4 w-2 bg-cyan-400 animate-pulse" />
      </form>
    </div>
  )
}
