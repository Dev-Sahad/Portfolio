'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Eraser, RotateCcw, Palette } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface DoodleCanvasProps {
  onCanvasChange: (dataUrl: string | null) => void
}

const COLORS = ['#ffffff', '#10b981', '#a855f7', '#06b6d4', '#eab308', '#ef4444']

export default function DoodleCanvas({ onCanvasChange }: DoodleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#10b981')
  const [brushSize, setBrushSize] = useState(3)
  const [isEmpty, setIsEmpty] = useState(true)
  const { playClick, playHover } = useAudio()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fill with dark background
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    import('@/components/AchievementSystem').then((m) => m.unlockAchievement('picasso'))
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
    setIsEmpty(false)

    onCanvasChange(canvas.toDataURL('image/png'))
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    playClick()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onCanvasChange(null)
  }

  return (
    <div className="my-3 space-y-2.5 rounded-2xl border border-white/10 bg-[#0d0d14] p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-white/70">
          <Palette size={14} className="text-emerald-400" />
          Draw Digital Signature / Doodle
        </span>

        <button
          type="button"
          onClick={clearCanvas}
          onMouseEnter={playHover}
          disabled={isEmpty}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/50 hover:bg-white/10 hover:text-white transition disabled:opacity-30"
        >
          <Eraser size={12} />
          Clear
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10">
        <canvas
          ref={canvasRef}
          width={360}
          height={140}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none bg-[#0a0a0f]"
        />
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-mono text-white/25">
            Draw your signature or doodle here ✍️
          </div>
        )}
      </div>

      {/* Drawing Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                playClick()
                setColor(c)
              }}
              onMouseEnter={playHover}
              style={{ backgroundColor: c }}
              className={`h-5 w-5 rounded-full border transition ${
                color === c ? 'scale-125 border-white ring-2 ring-white/30' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/40">Brush</span>
          <input
            type="range"
            min="1"
            max="8"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-16 accent-emerald-400"
          />
        </div>
      </div>
    </div>
  )
}
