'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Copy, Check, RefreshCw } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface TerminalLine {
  text: string
  color: string
}

const TERMINAL_LINES: TerminalLine[] = [
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
  const [outputStream, setOutputStream] = useState<TerminalLine[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const outputContainerRef = useRef<HTMLDivElement>(null)
  const { playClick, playHover } = useAudio()

  // Typewriter sequence
  useEffect(() => {
    if (currentIndex < TERMINAL_LINES.length) {
      const timer = setTimeout(() => {
        setOutputStream((prev) => [...prev, TERMINAL_LINES[currentIndex]])
        setCurrentIndex((prev) => prev + 1)
      }, 140)
      return () => clearTimeout(timer)
    }
  }, [currentIndex])

  // Container-only auto scroll (Finding 3)
  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight
    }
  }, [outputStream])

  const handleRestart = () => {
    playClick()
    setOutputStream([])
    setCurrentIndex(0)
  }

  // Safe async copy (Finding 6)
  const handleCopy = async () => {
    playClick()
    const textToCopy = outputStream.map((l) => l.text).join('\n')
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  const handleCustomCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    playClick()
    const cmd = inputVal.trim()
    setInputVal('')
    const lower = cmd.toLowerCase()

    // Clear command handling (Finding 7)
    if (lower === 'clear') {
      setOutputStream([])
      setCurrentIndex(TERMINAL_LINES.length) // Halt typewriter animation
      return
    }

    let response = `Command not recognized: "${cmd}". Type "help", "skills", "projects", "contact", or "clear".`
    if (lower === 'help') {
      response = 'Available commands: help | skills | projects | contact | clear'
    } else if (lower === 'skills') {
      response = 'Skills: Next.js 15, React 19, TypeScript, Three.js, Supabase, Tailwind CSS'
    } else if (lower === 'projects') {
      response = 'Projects: 28 Production Builds | 3D Interactive WebGL Apps | Live CV Builder'
    } else if (lower === 'contact') {
      response = 'Email / Direct Line: Available via Navbar Direct Inquiry & AI Co-Pilot'
    }

    // Chronological stream update (Finding 5)
    setOutputStream((prev) => [
      ...prev,
      { text: `> ${cmd}`, color: 'text-cyan-300 font-bold' },
      { text: response, color: 'text-emerald-300' },
    ])
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

      {/* Terminal Code Screen (Finding 4: role="log" aria-live="polite") */}
      <div
        ref={outputContainerRef}
        role="log"
        aria-live="polite"
        className="h-72 overflow-y-auto space-y-1.5 pr-2 no-scrollbar"
      >
        {outputStream.map((line, i) => (
          <div key={i} className={`${line.color} leading-relaxed`}>
            {line.text}
          </div>
        ))}
      </div>

      {/* Interactive Command Input (Finding 4: aria-label & accessible focus) */}
      <form onSubmit={handleCustomCommand} className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
        <span className="text-cyan-400 font-bold">&gt;</span>
        <input
          type="text"
          value={inputVal}
          aria-label="Terminal command input"
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type terminal command (try 'skills', 'projects', 'contact', 'clear')..."
          className="flex-1 bg-transparent text-xs text-white outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded px-1 placeholder:text-white/30 font-mono"
        />
        <span className="h-4 w-2 bg-cyan-400 animate-pulse" />
      </form>
    </div>
  )
}
