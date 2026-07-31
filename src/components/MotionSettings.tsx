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

  return null
}
