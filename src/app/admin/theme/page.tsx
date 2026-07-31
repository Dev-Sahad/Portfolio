'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Sparkles, Save, Sliders, Eye, RefreshCw } from 'lucide-react'

export default function AdminThemePage() {
  const [accentColor, setAccentColor] = useState('#ec4899')
  const [glassBlur, setGlassBlur] = useState('24px')
  const [matrixRain, setMatrixRain] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setTimeout(() => {
      setSaving(false)
      setMessage('✅ Theme & design tokens saved successfully!')
    }, 500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white p-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <Palette className="text-pink-400" size={28} /> Theme & Design System Tokens Studio
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-1">
            Customize portfolio primary accent colors, glassmorphism blur levels, dark mode contrast, and matrix effects.
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-xs font-mono text-pink-300">
          {message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-pink-300 font-sans">
            <Sliders size={18} /> Color Tokens & Glassmorphism
          </h2>

          <div className="space-y-2">
            <label className="text-white/70">Primary Neon Accent Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-20 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white uppercase focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-white/70">Glassmorphism Backdrop Blur Level</label>
            <select
              value={glassBlur}
              onChange={(e) => setGlassBlur(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="12px">Subtle Blur (12px)</option>
              <option value="24px">Standard Glassmorphism (24px)</option>
              <option value="40px">Deep Cyber Frosted (40px)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <span className="font-bold text-white">Enable Digital Rain / Matrix Effect</span>
              <p className="text-[11px] text-white/50">Toggles background matrix particle rain effect in hero canvas.</p>
            </div>
            <input
              type="checkbox"
              checked={matrixRain}
              onChange={(e) => setMatrixRain(e.target.checked)}
              className="h-5 w-5 rounded cursor-pointer accent-pink-500"
            />
          </div>
        </motion.div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 text-xs font-extrabold text-white shadow-xl hover:brightness-110 transition w-full sm:w-auto font-sans"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Apply Theme Tokens'}
        </button>
      </form>
    </div>
  )
}
