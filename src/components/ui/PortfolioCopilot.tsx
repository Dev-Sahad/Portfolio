'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, MessageSquare, ArrowRight, UserCheck, Code2, ShieldCheck } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  actionUrl?: string
  actionLabel?: string
}

const PRESET_PROMPTS = [
  'What is Sahad’s primary tech stack? 🛠️',
  'Is Sahad available for full-time hiring? 💼',
  'Show me Three.js & 3D WebGL projects 🌌',
  'How do I schedule a technical call? ⚡',
]

const BOT_KNOWLEDGE: Record<string, { answer: string; actionUrl?: string; actionLabel?: string }> = {
  stack: {
    answer:
      'Muhammad Sahad specializes in Next.js 15, React 19, TypeScript, Three.js, Supabase Postgres with RLS security, and Tailwind CSS.',
    actionUrl: '#about',
    actionLabel: 'View Full Tech Stack',
  },
  hiring: {
    answer:
      'Yes! Sahad is currently open and accepting full-time Front-End Developer roles, remote positions, and high-impact contract projects.',
    actionUrl: '#contact',
    actionLabel: 'Open Direct Inquiry',
  },
  projects: {
    answer:
      'Sahad has built production Next.js 15 applications with 3D WebGL scenes, real-time Supabase integrations, and responsive device inspection tools.',
    actionUrl: '#projects',
    actionLabel: 'Explore Project Showcase',
  },
  contact: {
    answer:
      'You can reach Sahad via the Direct Line quick inquiry drawer, email, or LinkedIn. Response time is usually under 2 hours!',
    actionUrl: '#contact',
    actionLabel: 'Contact Sahad Now',
  },
}

interface PortfolioCopilotProps {
  isOpen: boolean
  onClose: () => void
}

export default function PortfolioCopilot({ isOpen, onClose }: PortfolioCopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hi there! I am Sahad’s AI Co-Pilot. How can I assist your team or hiring process today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { playClick, playHover, playSuccess } = useAudio()

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

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query) return

    playClick()
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: query }
    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsTyping(true)

    setTimeout(() => {
      let botResponse = BOT_KNOWLEDGE.stack
      const lower = query.toLowerCase()

      if (lower.includes('hire') || lower.includes('job') || lower.includes('available') || lower.includes('full-time')) {
        botResponse = BOT_KNOWLEDGE.hiring
      } else if (lower.includes('project') || lower.includes('three.js') || lower.includes('3d') || lower.includes('webgl')) {
        botResponse = BOT_KNOWLEDGE.projects
      } else if (lower.includes('contact') || lower.includes('call') || lower.includes('email') || lower.includes('reach')) {
        botResponse = BOT_KNOWLEDGE.contact
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponse.answer,
          actionUrl: botResponse.actionUrl,
          actionLabel: botResponse.actionLabel,
        },
      ])
      setIsTyping(false)
      playSuccess()
    }, 900)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="AI Portfolio Co-Pilot"
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative flex flex-col w-full max-w-lg h-[540px] overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0c0d16]/95 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-2xl text-white p-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Bot size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Sahad AI Co-Pilot
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                      Smart Assistant
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">Ask about experience, stack, or available roles</p>
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

            {/* Preset Query Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 shrink-0 no-scrollbar">
              {PRESET_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  onMouseEnter={playHover}
                  className="shrink-0 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/70 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500 text-black font-medium rounded-br-none shadow-md'
                        : 'bg-white/10 text-white/90 border border-white/10 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                    {msg.actionUrl && (
                      <a
                        href={msg.actionUrl}
                        onClick={onClose}
                        className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:underline"
                      >
                        {msg.actionLabel || 'Learn More'} <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono p-2">
                  <Bot size={14} className="animate-spin-slow" /> AI Co-Pilot is thinking...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="mt-3 flex gap-2 shrink-0 border-t border-white/10 pt-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI Co-Pilot a question..."
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                onMouseEnter={playHover}
                className="rounded-xl bg-cyan-500 text-black px-4 py-2.5 text-xs font-bold hover:bg-cyan-400 transition shrink-0 flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
