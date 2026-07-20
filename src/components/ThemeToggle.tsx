'use client'

import { useTheme } from 'next-themes' // or your own custom hooks state manager
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9 rounded-full bg-neutral-200/50 animate-pulse" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 text-neutral-800 dark:text-neutral-200 hover:bg-white/20 transition-all duration-200"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
