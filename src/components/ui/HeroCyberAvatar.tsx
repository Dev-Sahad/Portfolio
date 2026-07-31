'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Eye, Zap, ShieldCheck, RefreshCw, Cpu, Instagram } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface HeroCyberAvatarProps {
  className?: string
  compact?: boolean
}

export default function HeroCyberAvatar({ className = '', compact = false }: HeroCyberAvatarProps) {
  const [activeAvatar, setActiveAvatar] = useState<'cyber' | 'anime'>('cyber')
  const { playClick, playHover } = useAudio()

  const toggleAvatar = () => {
    playClick()
    setActiveAvatar((prev) => (prev === 'cyber' ? 'anime' : 'cyber'))
  }

  const currentImage = activeAvatar === 'cyber' ? '/hero-cyber-portrait.jpg' : '/hero-anime-portrait.jpg'
  const currentTitle = activeAvatar === 'cyber' ? 'CYBER EYE OPERATIVE' : 'ANIME VISOR SPEC'

  return (
    <div className={`relative group select-none ${className}`}>
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-emerald-500/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />

      {/* Main Avatar Card Frame */}
      <motion.div
        whileHover={{ scale: 1.02, rotateY: 3, rotateX: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative overflow-hidden rounded-3xl border border-white/20 bg-[#0d0e17]/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ${
          compact ? 'w-64 h-80' : 'w-72 sm:w-80 h-[380px] sm:h-[440px]'
        }`}
      >
        {/* Animated Scanner Laser Beam */}
        <motion.div
          animate={{ y: ['0%', '440px', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] z-20 pointer-events-none opacity-80"
        />

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-black/60 px-3 py-1 text-[10px] font-mono text-cyan-300 backdrop-blur-md shadow-lg">
            <Cpu size={12} className="animate-spin-slow text-cyan-400" />
            <span>SAHAD // {activeAvatar.toUpperCase()}</span>
          </div>

          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Portrait Image with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeAvatar}
            src={currentImage}
            alt="Muhammad Sahad Cyber Avatar"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover object-center transform transition duration-700 group-hover:scale-105"
          />
        </AnimatePresence>

        {/* Vignette Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a12] via-transparent to-black/30 pointer-events-none z-10" />

        {/* Bottom Interactive Controls */}
        <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between bg-black/70 backdrop-blur-md p-2.5 rounded-2xl border border-white/15">
          <a
            href="https://www.instagram.com/sahad_____sha/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            onMouseEnter={playHover}
            className="flex items-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-500/20 px-2.5 py-1.5 text-[11px] font-mono text-pink-300 hover:bg-pink-500/30 transition backdrop-blur-md"
            title="Connect on Instagram @sahad_____sha"
          >
            <Instagram size={13} className="text-pink-400" />
            <span>@sahad_____sha</span>
          </a>

          <button
            type="button"
            onClick={toggleAvatar}
            onMouseEnter={playHover}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-mono text-cyan-200 hover:bg-cyan-500/30 transition backdrop-blur-md cursor-pointer"
            title="Switch Cyber Persona Avatar"
          >
            <RefreshCw size={13} className="animate-spin-slow" /> Switch
          </button>
        </div>
      </motion.div>
    </div>
  )
}
