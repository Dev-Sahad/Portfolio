'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, X, CornerDownLeft, Sparkles } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface TerminalModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CommandLog {
  command: string
  output: React.ReactNode
}

export default function TerminalModal({ isOpen, onClose }: TerminalModalProps) {
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      command: 'welcome',
      output: (
        <div className="text-emerald-400 font-mono text-xs space-y-1">
          <p>⚡ Portfolio Terminal CLI v2.0.26</p>
          <p className="text-white/60">Type <span className="text-cyan-300 font-bold">help</span> to view available system commands.</p>
        </div>
      ),
    },
  ])
  const [showConfetti, setShowConfetti] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { playClick, playHover, playSuccess } = useAudio()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const executeCommand = (cmdStr: string) => {
    const raw = cmdStr.trim()
    const cmd = raw.toLowerCase()

    if (!raw) return

    import('@/components/AchievementSystem').then((m) => m.unlockAchievement('terminal_ninja'))

    let output: React.ReactNode = null

    switch (cmd) {
      case 'help':
        output = (
          <div className="space-y-1 text-xs text-white/70 font-mono">
            <p className="text-emerald-400 font-bold mb-1">Available System Commands:</p>
            <p><span className="text-cyan-300 w-32 inline-block">whoami</span> — Display developer bio & role</p>
            <p><span className="text-cyan-300 w-32 inline-block">cat resume.txt</span> — Read developer experience & qualifications</p>
            <p><span className="text-cyan-300 w-32 inline-block">ls projects</span> — List featured portfolio projects</p>
            <p><span className="text-cyan-300 w-32 inline-block">skills</span> — Display tech stack proficiency</p>
            <p><span className="text-cyan-300 w-32 inline-block">sudo hire-sahad</span> — Hire Muhammad Sahad 🎉</p>
            <p><span className="text-cyan-300 w-32 inline-block">clear</span> — Clear terminal output</p>
            <p><span className="text-cyan-300 w-32 inline-block">exit</span> — Close terminal mode</p>
          </div>
        )
        break

      case 'whoami':
        output = (
          <div className="text-xs text-white/80 font-mono space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="text-cyan-300 font-bold">Muhammad Sahad — Front-End Developer & UI Specialist</p>
            <p className="text-white/60">Location: UAE / Global Remote</p>
            <p className="text-white/60">Stack: Next.js 15, React 19, TypeScript, Three.js, Supabase, Tailwind</p>
            <p className="text-white/60">Status: Available for full-time & high-impact projects 🚀</p>
          </div>
        )
        break

      case 'cat resume.txt':
        output = (
          <div className="text-xs text-white/70 font-mono space-y-2 bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="text-emerald-400 font-bold">📄 RESUME — MUHAMMAD SAHAD</p>
            <p>• 2+ Years Experience building responsive React/Next.js web applications</p>
            <p>• 3D Interactive Graphics with Three.js, React Three Fiber & GSAP</p>
            <p>• Real-time Backend integration with Supabase, PostgreSQL & Webhooks</p>
            <p className="text-cyan-300">Download Full PDF: sahad.is-a.dev</p>
          </div>
        )
        break

      case 'ls projects':
        output = (
          <div className="text-xs text-white/70 font-mono space-y-1">
            <p className="text-emerald-400 font-bold">📂 Featured Portfolio Projects:</p>
            <p className="flex items-center gap-2"><span>1.</span> <span className="text-cyan-300 font-bold">PortoV1</span> — Cinematic 3D Developer Portfolio</p>
            <p className="flex items-center gap-2"><span>2.</span> <span className="text-cyan-300 font-bold">Supabase Realtime Hub</span> — Full-stack Auth & Analytics dashboard</p>
            <p className="flex items-center gap-2"><span>3.</span> <span className="text-cyan-300 font-bold">3D Word Cloud Engine</span> — Interactive R3F word sphere</p>
          </div>
        )
        break

      case 'skills':
        output = (
          <div className="text-xs text-white/70 font-mono space-y-1">
            <p className="text-purple-300 font-bold mb-1">🛠 Technical Stack:</p>
            <p>• Frontend:  <span className="text-emerald-300">Next.js 15, React 19, TypeScript, Tailwind CSS</span></p>
            <p>• 3D Graphics: <span className="text-emerald-300">Three.js, React Three Fiber, Drei, GSAP</span></p>
            <p>• Backend:  <span className="text-emerald-300">Supabase Postgres, Node.js, Webhooks, RLS</span></p>
          </div>
        )
        break

      case 'sudo hire-sahad':
        playSuccess()
        setShowConfetti(true)
        import('@/components/AchievementSystem').then((m) => m.unlockAchievement('hired_sahad'))
        setTimeout(() => setShowConfetti(false), 3000)
        output = (
          <div className="text-xs text-emerald-300 font-mono space-y-2 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
            <p className="font-bold text-sm">🎉 PERMISSION GRANTED! Excellent Decision!</p>
            <p className="text-white/80">Sahad is ready to build exceptional software with your team.</p>
            <a href="#contact" onClick={onClose} className="inline-block mt-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition">
              🚀 Open Contact Form Now
            </a>
          </div>
        )
        break

      case 'clear':
        setLogs([])
        return

      case 'exit':
        onClose()
        return

      default:
        output = (
          <p className="text-xs text-red-400 font-mono">
            zsh: command not found: <span className="font-bold">{raw}</span>. Type <span className="text-cyan-300">help</span> for available commands.
          </p>
        )
    }

    playClick()
    setLogs((prev) => [...prev, { command: raw, output }])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeCommand(input)
    setInput('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-[#090a0f]/95 shadow-2xl backdrop-blur-2xl text-white font-mono"
          >
            {/* Confetti Overlay */}
            {showConfetti && (
              <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm animate-pulse">
                <div className="text-center space-y-2">
                  <Sparkles size={48} className="mx-auto text-emerald-300 animate-bounce" />
                  <p className="text-xl font-bold text-emerald-300">🎉 Welcome to the Team!</p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#12131a] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <span className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                  <Terminal size={14} className="text-emerald-400" />
                  sahad@portfolio:~ (zsh)
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                onMouseEnter={playHover}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/15 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Output Screen */}
            <div className="h-[360px] overflow-y-auto p-5 space-y-4 text-xs leading-6">
              {logs.map((log, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <span className="text-emerald-400">sahad@portfolio:~$</span>
                    <span>{log.command}</span>
                  </div>
                  <div>{log.output}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 bg-[#12131a] px-5 py-3">
              <span className="text-emerald-400 font-bold text-xs">sahad@portfolio:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type command ('help', 'whoami', 'sudo hire-sahad')..."
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/20 font-mono"
              />
              <button
                type="submit"
                onMouseEnter={playHover}
                className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
              >
                <span>Run</span>
                <CornerDownLeft size={12} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
