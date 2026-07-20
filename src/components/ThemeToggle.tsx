'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Dynamically adjust root CSS canvas elements
    if (newTheme === 'light') {
      document.documentElement.style.setProperty('--bg-card', 'rgba(0,0,0,0.03)')
      document.documentElement.style.setProperty('--text-primary', '#171717')
      document.documentElement.style.setProperty('--text-secondary', '#404040')
      document.documentElement.style.setProperty('--border', 'rgba(0,0,0,0.1)')
    } else {
      document.documentElement.style.setProperty('--bg-card', 'rgba(255,255,255,0.04)')
      document.documentElement.style.setProperty('--text-primary', '#ffffff')
      document.documentElement.style.setProperty('--text-secondary', 'rgba(255,255,255,0.55)')
      document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.1)')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white transition hover:scale-105"
      aria-label="Toggle theme configuration"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
