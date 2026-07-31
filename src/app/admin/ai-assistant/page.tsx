'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles, Save, MessageSquare, ShieldCheck, Check, Cpu } from 'lucide-react'

export default function AdminAIAssistantPage() {
  const [botName, setBotName] = useState('Sahad AI Assistant')
  const [systemPrompt, setSystemPrompt] = useState(
    "You are Sahad's official AI Portfolio Assistant. Help visitors learn about Sahad Sha's Front-End engineering skills, Next.js 15 projects, UI design expertise, and availability."
  )
  const [greeting, setGreeting] = useState('Hello! I am Sahad\'s AI Assistant. How can I help you explore Sahad\'s portfolio today?')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setTimeout(() => {
      setSaving(false)
      setMessage('✅ AI Assistant prompt & persona saved successfully!')
    }, 500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <Bot className="text-cyan-400" size={28} /> AI Assistant Persona & Prompt Control
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-1">
            Configure system prompt instructions, bot name, welcome greeting, and default persona for the portfolio AI chatbot.
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-xs font-mono text-cyan-300">
          {message}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-cyan-300 font-sans">
            <Sparkles size={18} /> Bot Name & Identity
          </h2>

          <div className="space-y-1">
            <label className="text-white/70">Bot Display Name</label>
            <input
              type="text"
              required
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/70">Welcome Greeting Message</label>
            <input
              type="text"
              required
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-pink-300 font-sans">
            <Cpu size={18} /> System Prompt & Instructions
          </h2>

          <div className="space-y-1">
            <label className="text-white/70">System Instructions (Injected to LLM Context)</label>
            <textarea
              rows={5}
              required
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:border-cyan-500 focus:outline-none leading-relaxed"
            />
          </div>
        </motion.div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-xs font-extrabold text-white shadow-xl hover:brightness-110 transition w-full sm:w-auto font-sans"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save AI Assistant Persona'}
        </button>
      </form>
    </div>
  )
}
