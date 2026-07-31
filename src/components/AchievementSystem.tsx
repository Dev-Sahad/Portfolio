'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Award, CheckCircle, X, Sparkles, Terminal, Palette, Music, Zap, Heart } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export interface AchievementItem {
  id: string
  title: string
  description: string
  icon: string
  category: string
}

export const ALL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'terminal_ninja',
    title: 'Terminal Ninja',
    description: 'Executed terminal commands in the Developer CLI',
    icon: '🐱‍💻',
    category: 'Exploration',
  },
  {
    id: 'picasso',
    title: 'Picasso Artist',
    description: 'Drew a custom doodle on the Guestbook canvas',
    icon: '🎨',
    category: 'Interactive',
  },
  {
    id: 'audiophile',
    title: 'Audiophile',
    description: 'Streamed Spotify or Synth Ambient music',
    icon: '🎧',
    category: 'Audio Engine',
  },
  {
    id: 'eco_engineer',
    title: 'Eco Engineer',
    description: 'Toggled performance mode settings',
    icon: '⚡',
    category: 'Performance',
  },
  {
    id: 'hired_sahad',
    title: 'Hiring Manager!',
    description: 'Triggered the celebratory hire confetti animation',
    icon: '🎉',
    category: 'Milestone',
  },
]

export function unlockAchievement(id: string) {
  if (typeof window === 'undefined') return
  const item = ALL_ACHIEVEMENTS.find((a) => a.id === id)
  if (!item) return
  window.dispatchEvent(new CustomEvent('portfolio-achievement-unlock', { detail: item }))
}

export default function AchievementSystem() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [toastQueue, setToastQueue] = useState<AchievementItem[]>([])
  const [activeToast, setActiveToast] = useState<AchievementItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { playSuccess, playClick, playHover } = useAudio()

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-unlocked-achievements')
    if (saved) {
      try {
        setUnlockedIds(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const handleUnlockEvent = useCallback(
    (e: Event) => {
      const custom = e as CustomEvent<AchievementItem>
      const achievement = custom.detail
      if (!achievement || !achievement.id) return

      setUnlockedIds((prev) => {
        if (prev.includes(achievement.id)) return prev
        const updated = [...prev, achievement.id]
        localStorage.setItem('portfolio-unlocked-achievements', JSON.stringify(updated))
        
        // Trigger Toast & Sound
        setToastQueue((queue) => [...queue, achievement])
        try {
          playSuccess()
        } catch {}
        return updated
      })
    },
    [playSuccess]
  )

  useEffect(() => {
    window.addEventListener('portfolio-achievement-unlock', handleUnlockEvent)
    return () => window.removeEventListener('portfolio-achievement-unlock', handleUnlockEvent)
  }, [handleUnlockEvent])

  useEffect(() => {
    if (activeToast || toastQueue.length === 0) return
    const next = toastQueue[0]
    setActiveToast(next)
    setToastQueue((prev) => prev.slice(1))

    const timer = setTimeout(() => {
      setActiveToast(null)
    }, 4500)

    return () => clearTimeout(timer)
  }, [toastQueue, activeToast])

  const unlockedCount = unlockedIds.length
  const totalCount = ALL_ACHIEVEMENTS.length

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-24 right-5 z-[99999] flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-[#0d0e17]/95 p-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-2xl text-white max-w-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-2xl border border-amber-500/40">
              {activeToast.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                <Trophy size={12} /> Achievement Unlocked!
              </div>
              <h4 className="font-bold text-sm text-white">{activeToast.title}</h4>
              <p className="text-xs text-white/60 leading-tight">{activeToast.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-white/40 hover:text-white transition"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trophy Drawer Toggle Button */}
      <button
        type="button"
        onClick={() => {
          playClick()
          setDrawerOpen((prev) => !prev)
        }}
        onMouseEnter={playHover}
        aria-label="View unlocked achievements"
        title="Visitor Trophy & Achievements System"
        className="fixed bottom-5 right-5 z-[80] flex h-10 items-center gap-2 rounded-full border border-amber-500/40 bg-black/80 px-3.5 text-xs font-semibold text-amber-300 shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-black"
      >
        <Trophy size={16} className="text-amber-400" />
        <span>
          {unlockedCount}/{totalCount}
        </span>
      </button>

      {/* Trophy Drawer Modal */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Visitor Achievements"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[#0e0f19]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      Visitor Trophies
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
                        {unlockedCount}/{totalCount} Unlocked
                      </span>
                    </h3>
                    <p className="text-xs text-white/50">Explore Sahad&apos;s portfolio to collect them all!</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full bg-white/5 p-2 text-white/50 hover:bg-white/15 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {ALL_ACHIEVEMENTS.map((item) => {
                  const isUnlocked = unlockedIds.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3.5 rounded-2xl p-3.5 border transition ${
                        isUnlocked
                          ? 'border-amber-500/30 bg-amber-500/10 text-white'
                          : 'border-white/5 bg-white/[0.02] opacity-45'
                      }`}
                    >
                      <div className="text-2xl shrink-0">{isUnlocked ? item.icon : '🔒'}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs">{item.title}</h4>
                          <span className="text-[9px] font-mono uppercase text-white/40">{item.category}</span>
                        </div>
                        <p className="text-[11px] text-white/60">{item.description}</p>
                      </div>
                      {isUnlocked && <CheckCircle size={16} className="text-amber-400 shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
