'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, FileText, Layout, Award } from 'lucide-react'

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const executeCommand = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  const actions = [
    { label: 'Navigate to Projects', icon: <Layout size={16} />, run: () => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'View Core Certificates', icon: <Award size={16} />, run: () => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Download Curriculum Vitae', icon: <FileText size={16} />, run: () => window.open('https://drive.google.com/file/d/1KqECb-TA5sgncNXY2pajnUX7bwAM6ASM/view?usp=drivesdk', '_blank') }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/75 backdrop-blur-sm px-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.97, y: -10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: -10 }}
            className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Terminal size={16} className="text-white/45" />
              <input type="text" placeholder="Type a shortcut command..." className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none" autoFocus />
            </div>
            <div className="p-2 space-y-1">
              {actions.map((act, index) => (
                <button key={index} onClick={() => executeCommand(act.run)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl text-left transition">
                  {act.icon} {act.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
