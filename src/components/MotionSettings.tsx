'use client'

import { useEffect, useState } from 'react'
import { Gauge, Sparkles } from 'lucide-react'

type MotionMode = 'auto' | 'full' | 'reduced'

export default function MotionSettings({ defaultMode = 'auto' }: { defaultMode?: MotionMode }) {
  const [mode, setMode] = useState<MotionMode>(() => {
    if (typeof window === 'undefined') return defaultMode
    return (localStorage.getItem('portfolio-motion-mode') as MotionMode | null) || defaultMode
  })

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reduced = mode === 'reduced' || (mode === 'auto' && prefersReduced)
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
    localStorage.setItem('portfolio-motion-mode', mode)
  }, [mode])

  const toggle = () => setMode((current) => current === 'reduced' ? 'full' : 'reduced')

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === 'reduced' ? 'Enable full visual effects' : 'Reduce visual effects'}
      title={mode === 'reduced' ? 'Enable full effects' : 'Performance / reduced motion'}
      className="fixed bottom-5 left-5 z-[80] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/70 shadow-xl backdrop-blur-md transition hover:scale-105 hover:text-white"
    >
      {mode === 'reduced' ? <Gauge size={17} /> : <Sparkles size={17} />}
    </button>
  )
}
