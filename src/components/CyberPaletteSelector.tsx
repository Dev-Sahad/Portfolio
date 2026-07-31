'use client'

import { useEffect, useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export type PaletteTheme = 'purple' | 'emerald' | 'amber' | 'cyan' | 'monochrome'

export interface PaletteOption {
  id: PaletteTheme
  name: string
  accent: string
  glow: string
  border: string
  bgDot: string
}

export const PALETTE_OPTIONS: PaletteOption[] = [
  {
    id: 'purple',
    name: 'Cyber Purple',
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    border: 'rgba(168, 85, 247, 0.3)',
    bgDot: 'bg-purple-500',
  },
  {
    id: 'emerald',
    name: 'Matrix Emerald',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'rgba(16, 185, 129, 0.3)',
    bgDot: 'bg-emerald-500',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    border: 'rgba(245, 158, 11, 0.3)',
    bgDot: 'bg-amber-500',
  },
  {
    id: 'cyan',
    name: 'Hyperdrive Cyan',
    accent: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    border: 'rgba(6, 182, 212, 0.3)',
    bgDot: 'bg-cyan-500',
  },
  {
    id: 'monochrome',
    name: 'Obsidian Mono',
    accent: '#e5e5e5',
    glow: 'rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.2)',
    bgDot: 'bg-neutral-300',
  },
]

export default function CyberPaletteSelector() {
  const [activePalette, setActivePalette] = useState<PaletteTheme>('purple')
  const [isOpen, setIsOpen] = useState(false)
  const { playClick, playHover } = useAudio()

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-cyber-palette') as PaletteTheme | null
    if (saved && PALETTE_OPTIONS.some((p) => p.id === saved)) {
      setActivePalette(saved)
      applyPalette(saved)
    } else {
      applyPalette('purple')
    }
  }, [])

  const applyPalette = (themeId: PaletteTheme) => {
    const target = PALETTE_OPTIONS.find((p) => p.id === themeId) || PALETTE_OPTIONS[0]
    document.documentElement.style.setProperty('--accent-color', target.accent)
    document.documentElement.style.setProperty('--accent-glow', target.glow)
    document.documentElement.style.setProperty('--accent-border', target.border)
    localStorage.setItem('portfolio-cyber-palette', themeId)
    window.dispatchEvent(new CustomEvent('cyber-palette-change', { detail: themeId }))
  }

  const handleSelect = (themeId: PaletteTheme) => {
    playClick()
    setActivePalette(themeId)
    applyPalette(themeId)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          playClick()
          setIsOpen((prev) => !prev)
        }}
        onMouseEnter={playHover}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
        title="Cyber Palette Theme Engine"
        aria-label="Toggle cyber palette menu"
      >
        <Palette className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-[999] w-48 rounded-2xl border border-white/20 bg-[#0d0e15]/95 p-3 shadow-2xl backdrop-blur-2xl text-white">
          <div className="mb-2 text-[10px] font-mono text-white/40 px-2 uppercase tracking-wider">
            Accent Theme Engine
          </div>
          <div className="space-y-1">
            {PALETTE_OPTIONS.map((item) => {
              const isSelected = activePalette === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  onMouseEnter={playHover}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition ${
                    isSelected
                      ? 'bg-white/15 text-white font-semibold border border-white/20'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.bgDot} shadow-sm`} />
                    <span>{item.name}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
