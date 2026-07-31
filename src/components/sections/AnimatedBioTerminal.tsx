'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Copy, Check, RefreshCw, Maximize2, Minus, X } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface TerminalLine {
  text: string
  color: string
}

const ASCII_BANNER = `
  ███████╗██████ me  ██╗  ██╗██████╗ 
  ██╔════╝██╔══██╗██║  ██║██╔══██╗
  ███████╗███████║███████║██║  ██║
  ╚════██║██╔══██║██╔══██║██║  ██║
  ███████║██║  ██║██║  ██║██████╔╝
  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
  SAHAD OS v3.0 [zsh x86_64-apple-darwin]
`

const INITIAL_TERMINAL_LINES: TerminalLine[] = [
  { text: ASCII_BANNER, color: 'text-cyan-400 font-mono text-[10px] leading-tight select-none font-bold' },
  { text: 'sahad@macbook-pro ~ % neofetch', color: 'text-purple-300 font-bold' },
  { text: '---------------------------------------------------------', color: 'text-white/20' },
  { text: 'OS           : macOS Sonoma 14.5 (Darwin 23.5.0)', color: 'text-white/90' },
  { text: 'DEVELOPER    : Muhammad Sahad (Dev-Sahad)', color: 'text-cyan-300 font-bold' },
  { text: 'ROLE         : Frontend Developer & UI Specialist', color: 'text-white/90' },
  { text: 'SHELL        : zsh 5.9 (x86_64-apple-darwin)', color: 'text-white/60' },
  { text: 'UPTIME       : 99.99% (Ready for High-Impact Roles)', color: 'text-emerald-400 font-bold' },
  { text: 'PRIMARY      : Next.js 15, React 19, TypeScript, Three.js', color: 'text-cyan-300' },
  { text: 'STYLING      : Tailwind CSS, Vanilla CSS, Framer Motion', color: 'text-teal-300' },
  { text: 'BACKEND      : Supabase RLS PostgreSQL, Edge APIs', color: 'text-emerald-300' },
  { text: 'PROJECTS     : 28+ Production Apps, WebGL 3D Scenes', color: 'text-amber-300' },
  { text: '---------------------------------------------------------', color: 'text-white/20' },
  { text: 'sahad@macbook-pro ~ % cat status.json', color: 'text-purple-300 font-bold' },
  { text: '{ "hiring": "AVAILABLE", "relocation": "REMOTE_OR_GLOBAL" }', color: 'text-emerald-400 font-bold' },
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
    if (currentIndex < INITIAL_TERMINAL_LINES.length) {
      const timer = setTimeout(() => {
        setOutputStream((prev) => [...prev, INITIAL_TERMINAL_LINES[currentIndex]])
        setCurrentIndex((prev) => prev + 1)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentIndex])

  // Container-only auto scroll
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

    if (lower === 'clear') {
      setOutputStream([])
      setCurrentIndex(INITIAL_TERMINAL_LINES.length)
      return
    }

    let response = `zsh: command not found: ${cmd}. Type "help", "whoami", "neofetch", "ls", "skills", "projects", or "clear".`
    if (lower === 'help') {
      response = 'Supported commands: help | whoami | neofetch | ls | skills | projects | contact | clear | sudo hire sahad'
    } else if (lower === 'whoami') {
      response = 'Muhammad Sahad - Frontend Developer & UI Enthusiast'
    } else if (lower === 'neofetch') {
      setOutputStream((prev) => [...prev, { text: `sahad@macbook-pro ~ % ${cmd}`, color: 'text-purple-300 font-bold' }, ...INITIAL_TERMINAL_LINES])
      return
    } else if (lower === 'ls') {
      response = 'bio.md   skills.json   projects/   certificates/   contact.sh'
    } else if (lower === 'skills') {
      response = 'Next.js 15, React 19, TypeScript, Three.js WebGL, Supabase Postgres, Tailwind CSS'
    } else if (lower === 'projects') {
      response = '28 Production Builds | 3D Interactive WebGL Apps | Live CV Builder'
    } else if (lower === 'contact') {
      response = 'Email / Direct Line: Available via Navbar Direct Inquiry & AI Co-Pilot'
    } else if (lower.includes('hire')) {
      response = '[SUCCESS] Offer Accepted! Direct line: Contact Sahad via Navbar Inquiry Drawer.'
    }

    setOutputStream((prev) => [
      ...prev,
      { text: `sahad@macbook-pro ~ % ${cmd}`, color: 'text-purple-300 font-bold' },
      { text: response, color: lower.includes('hire') ? 'text-emerald-400 font-bold' : 'text-emerald-300' },
    ])
  }

  return (
    <div className="my-12 rounded-3xl border border-cyan-500/30 bg-[#080a14]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden font-mono text-xs text-white">
      {/* Hyper-realistic macOS Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0d0f1e] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-sm" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-sm" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-sm" />
          </div>
          {/* Tabs */}
          <div className="ml-4 flex items-center gap-1">
            <span className="rounded-t-lg bg-black/60 border-t border-x border-cyan-500/40 px-3 py-1 text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
              <Terminal size={12} /> zsh — 80×24
            </span>
          </div>
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

      {/* Terminal Screen Area */}
      <div
        ref={outputContainerRef}
        role="log"
        aria-live="polite"
        className="h-80 overflow-y-auto p-5 space-y-1.5 bg-[#080a14] no-scrollbar select-text"
      >
        {outputStream.map((line, i) => (
          <div key={i} className={`${line.color} leading-relaxed whitespace-pre-wrap`}>
            {line.text}
          </div>
        ))}
      </div>

      {/* Zsh Command Line Input */}
      <form onSubmit={handleCustomCommand} className="flex items-center gap-2 border-t border-white/10 bg-[#0d0f1e] px-4 py-3">
        <span className="text-purple-400 font-bold shrink-0">sahad@macbook-pro ~ %</span>
        <input
          type="text"
          value={inputVal}
          aria-label="Terminal command input"
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type command (try 'whoami', 'skills', 'projects', 'ls', 'help')..."
          className="flex-1 bg-transparent text-xs text-white outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded px-1 placeholder:text-white/30 font-mono"
        />
        <span className="h-4 w-2 bg-cyan-400 animate-pulse shrink-0" />
      </form>
    </div>
  )
}
