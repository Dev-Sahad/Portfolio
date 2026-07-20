'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import AnimatedBackground from '@/components/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import PortfolioShowcase from '@/components/sections/PortfolioShowcase'
import ContactSection from '@/components/sections/contact/ContactSection'
import IntroScreen from '@/components/IntroScreen'
import VisitorDetailsPrompt from '@/components/VisitorDetailsPrompt'
import { useVisitor } from '@/hooks/useVisitor'
import { mergeSiteSettings, SiteSettings } from '@/lib/siteSettings'
import { hasPlayedIntro, setIntroPlayed } from '@/lib/introState'

interface PageClientProps {
  projects: any[];
  technologies: any[];
  settings?: Partial<SiteSettings> | null;
}

export default function PageClient({ projects, technologies, settings: settingsInput }: PageClientProps) {
  const settings = mergeSiteSettings(settingsInput)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showExit, setShowExit] = useState(false)
  const [showApp, setShowApp] = useState(false)

  useVisitor()

  useEffect(() => {
    const currentHash = window.location.hash
    const pathname = window.location.pathname

    // 1. Instant bypass for hash routes to protect smooth transitions
    if (currentHash && currentHash !== '') {
      setShowApp(true)
      return
    }

    // 2. Clear out session storage frames on actual page reloads
    const navEntries = performance.getEntriesByType('navigation')
    const navigationType = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming).type : null
    const isReload = navigationType === 'reload'

    if (isReload && pathname === '/') {
      sessionStorage.removeItem('introPlayed')
      sessionStorage.removeItem('heroPlayed')
      if (window.location.hash) history.replaceState(null, '', '/')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    // 3. Conditional state application to eliminate flicker
    if (!hasPlayedIntro()) {
      setShowWelcome(true)
      const timer = setTimeout(() => {
        setShowWelcome(false)
        setShowApp(true)
        setIntroPlayed()
      }, 2800)
      return () => clearTimeout(timer)
    }

    // Fast-path layout for returning users
    setShowApp(true)
  }, [])

  useEffect(() => {
    let exitTimer: number

    const handleExternalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const link = target?.closest('a')

      if (!link || !link.href || link.target !== '_blank') return

      setShowExit(true)
      exitTimer = window.setTimeout(() => setShowExit(false), 1400)
    }

    window.addEventListener('click', handleExternalClick)

    return () => {
      window.removeEventListener('click', handleExternalClick)
      if (exitTimer) window.clearTimeout(exitTimer)
    }
  }, [])

  return (
    <main style={{ position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />
        <Hero showApp={showApp} settings={settings} />
        <About settings={settings} />
        <PortfolioShowcase projects={projects} technologies={technologies} />
        <ContactSection settings={settings} />
      </div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <IntroScreen mode="loading" ownerName={settings.owner_name} githubUrl={settings.github_url} />
          </motion.div>
        )}

        {showExit && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
          >
            <IntroScreen mode="exit" ownerName={settings.owner_name} githubUrl={settings.github_url} />
          </motion.div>
        )}
      </AnimatePresence>

      <VisitorDetailsPrompt enabled={showApp} />
    </main>
  )
}
