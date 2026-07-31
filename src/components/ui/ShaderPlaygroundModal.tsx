'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Sliders, Play, RotateCcw, Palette } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface ShaderPlaygroundModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShaderPlaygroundModal({ isOpen, onClose }: ShaderPlaygroundModalProps) {
  const [particleCount, setParticleCount] = useState(120)
  const [speed, setSpeed] = useState(2)
  const [colorScheme, setColorScheme] = useState<'cyan' | 'purple' | 'amber' | 'emerald'>('cyan')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { playClick, playHover } = useAudio()

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let animationFrameId: number
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 3 + 1,
      })
    }

    const getColor = () => {
      switch (colorScheme) {
        case 'purple':
          return 'rgba(168, 85, 247,'
        case 'amber':
          return 'rgba(245, 158, 11,'
        case 'emerald':
          return 'rgba(16, 185, 129,'
        default:
          return 'rgba(6, 182, 212,'
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const baseColor = getColor()

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.fillStyle = `${baseColor} 0.8)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 80) {
            ctx.strokeStyle = `${baseColor} ${1 - dist / 80})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animationFrameId)
  }, [isOpen, particleCount, speed, colorScheme])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            className="relative flex flex-col w-full max-w-2xl h-[520px] overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0a0c16]/95 p-5 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Sparkles size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    3D WebGL Particle Canvas Playground
                  </h3>
                  <p className="text-xs text-white/50">Manipulate particle speed, count, & color themes</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Canvas Screen */}
            <div className="relative flex-1 rounded-2xl border border-white/10 bg-black/60 overflow-hidden mb-4">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Controls Bar */}
            <div className="grid grid-cols-3 gap-3 font-mono text-xs border-t border-white/10 pt-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Particle Count</span>
                  <span className="text-cyan-300">{particleCount}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={particleCount}
                  onChange={(e) => setParticleCount(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-white/10"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Velocity Speed</span>
                  <span className="text-cyan-300">{speed}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-white/10"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Color Theme</span>
                  <span className="text-cyan-300 uppercase">{colorScheme}</span>
                </div>
                <div className="flex gap-1.5">
                  {(['cyan', 'purple', 'amber', 'emerald'] as const).map((scheme) => (
                    <button
                      key={scheme}
                      type="button"
                      onClick={() => {
                        playClick()
                        setColorScheme(scheme)
                      }}
                      className={`flex-1 py-1 rounded-md text-[10px] uppercase font-bold border transition ${
                        colorScheme === scheme
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                          : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {scheme.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
