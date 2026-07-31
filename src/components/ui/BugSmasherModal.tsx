'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, X, Play, RotateCcw, Trophy, Sparkles, Zap, ShieldAlert } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface BugNode {
  id: number
  x: number
  y: number
  emoji: string
  points: number
  speed: number
}

const BUG_TYPES = [
  { emoji: '🐛', points: 10, name: 'Syntax Bug' },
  { emoji: '🐞', points: 15, name: 'Logic Bug' },
  { emoji: '👾', points: 25, name: 'Memory Leak' },
  { emoji: '🦟', points: 20, name: 'Null Pointer' },
]

interface BugSmasherModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BugSmasherModal({ isOpen, onClose }: BugSmasherModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [bugs, setBugs] = useState<BugNode[]>([])
  const [gameOver, setGameOver] = useState(false)
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

  // Timer loop
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false)
          setGameOver(true)
          playSuccess()
          import('@/components/AchievementSystem').then((m) => m.unlockAchievement('bug_smasher'))
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft, playSuccess])

  // Bug spawner loop
  useEffect(() => {
    if (!isPlaying) return
    const spawnInterval = setInterval(() => {
      if (bugs.length >= 7) return
      const randomBug = BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)]
      const newBug: BugNode = {
        id: Date.now() + Math.random(),
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 70) + 15,
        emoji: randomBug.emoji,
        points: randomBug.points,
        speed: Math.random() * 1.5 + 0.8,
      }
      setBugs((prev) => [...prev, newBug])
    }, 800)

    return () => clearInterval(spawnInterval)
  }, [isPlaying, bugs])

  const startGame = () => {
    playClick()
    setScore(0)
    setTimeLeft(30)
    setBugs([])
    setGameOver(false)
    setIsPlaying(true)
  }

  const smashBug = (bugId: number, points: number) => {
    playClick()
    setScore((prev) => prev + points)
    setBugs((prev) => prev.filter((b) => b.id !== bugId))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Bug Smasher Arcade Mini-Game"
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0d0e17]/95 p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-2xl text-white"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Gamepad2 size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Bug Smasher Arcade
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] text-amber-300 font-mono">
                      30s Challenge
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">Smash as many code bugs as you can before time expires!</p>
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

            {/* Scoreboard Bar */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 mb-4 font-mono">
              <div className="flex items-center gap-2 text-xs">
                <Trophy size={16} className="text-amber-400" />
                <span>Score: <b className="text-amber-300 text-sm">{score}</b></span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Zap size={16} className="text-cyan-400" />
                <span>Time Left: <b className={`text-sm ${timeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-cyan-300'}`}>{timeLeft}s</b></span>
              </div>
            </div>

            {/* Arcade Stage */}
            <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#07080e] p-4 flex items-center justify-center">
              {!isPlaying && !gameOver && (
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Gamepad2 size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Ready to Smash Bugs?</h4>
                    <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                      Click bugs as they appear on screen to earn points and unlock the Arcade Trophy badge!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startGame}
                    onMouseEnter={playHover}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-black px-5 py-2.5 text-xs font-bold hover:bg-amber-400 transition shadow-lg"
                  >
                    <Play size={14} /> Start Game
                  </button>
                </div>
              )}

              {gameOver && (
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Trophy size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Time Expired!</span>
                    <h4 className="font-bold text-xl text-white mt-1">Final Score: {score} PTS</h4>
                    <p className="text-xs text-white/60 mt-1">
                      {score >= 80 ? '🌟 Legendary Bug Smasher!' : score >= 40 ? '⚡ Great Debugging Skills!' : '👍 Good Try! Play Again!'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startGame}
                    onMouseEnter={playHover}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-black px-5 py-2.5 text-xs font-bold hover:bg-amber-400 transition shadow-lg"
                  >
                    <RotateCcw size={14} /> Play Again
                  </button>
                </div>
              )}

              {/* Active Bugs */}
              {isPlaying &&
                bugs.map((bug) => (
                  <motion.button
                    key={bug.id}
                    type="button"
                    onClick={() => smashBug(bug.id, bug.points)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: 'absolute',
                      left: `${bug.x}%`,
                      top: `${bug.y}%`,
                    }}
                    className="text-3xl transition hover:scale-125 focus:outline-none cursor-pointer p-2 select-none"
                    aria-label="Smash Bug"
                  >
                    {bug.emoji}
                  </motion.button>
                ))}
            </div>

            {/* Bottom Legend */}
            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-white/40 border-t border-white/10 pt-3">
              <span>🐛 Syntax (10p) | 🐞 Logic (15p) | 👾 Memory (25p)</span>
              <span className="text-amber-400 font-bold">Arcade Trophy Included</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
