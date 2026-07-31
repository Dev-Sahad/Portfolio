'use client'

import { useEffect, useState } from 'react'
import { Gauge, Sparkles } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export default function PerformanceModeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isReduced, setIsReduced] = useState(false)
  const { playClick, playHover } = useAudio()

  useEffect(() => {
    setMounted(true)
    const currentMode = localStorage.getItem('portfolio-motion-mode')
    const datasetMotion = document.documentElement.dataset.motion
    if (currentMode === 'reduced' || datasetMotion === 'reduced') {
      setIsReduced(true)
    }

    const handleSync = () => {
      const mode = localStorage.getItem('portfolio-motion-mode')
      setIsReduced(mode === 'reduced')
    }

    window.addEventListener('portfolio-motion-change', handleSync)
    return () => window.removeEventListener('portfolio-motion-change', handleSync)
  }, [])

  const toggleMode = () => {
    playClick()
    const nextReduced = !isReduced
    const nextMode = nextReduced ? 'reduced' : 'full'
    setIsReduced(nextReduced)
    document.documentElement.dataset.motion = nextReduced ? 'reduced' : 'full'
    localStorage.setItem('portfolio-motion-mode', nextMode)
    window.dispatchEvent(new Event('portfolio-motion-change'))
    import('@/components/AchievementSystem').then((m) => m.unlockAchievement('eco_engineer'))
  }

  if (!mounted) return <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />

  return (
    <button
      type="button"
      onClick={toggleMode}
      onMouseEnter={playHover}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition hover:scale-105 ${
        isReduced
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
      title={isReduced ? 'Performance Mode: Reduced FX (Click for High FX)' : 'Performance Mode: High FX (Click for Eco Mode)'}
      aria-label="Toggle performance mode"
    >
      {isReduced ? <Gauge className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
    </button>
  )
}
