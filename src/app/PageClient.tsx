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
import CommandPalette from '@/components/CommandPalette'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import BlogPreviewSection from '@/components/sections/BlogPreviewSection'
import MotionSettings from '@/components/MotionSettings'
import AnalyticsBeacon from '@/components/AnalyticsBeacon'
import { useVisitor } from '@/hooks/useVisitor'
import { mergeSiteSettings, SiteSettings } from '@/lib/siteSettings'
import type { BlogPost, Testimonial } from '@/lib/growthTypes'
import { hasPlayedIntro, setIntroPlayed } from '@/lib/introState'

import ScrollProgressBar from '@/components/ui/ScrollProgressBar'
import GraphicScrollBanner from '@/components/ui/GraphicScrollBanner'
import OutroExitModal from '@/components/ui/OutroExitModal'
import AchievementSystem from '@/components/AchievementSystem'
import TestimonialWall from '@/components/sections/TestimonialWall'

interface PageClientProps {
  projects: any[]
  technologies: any[]
  settings?: Partial<SiteSettings> | null
  testimonials?: Testimonial[]
  posts?: BlogPost[]
  isAdminPreview?: boolean
}

export default function PageClient({
  projects,
  technologies,
  settings: settingsInput,
  testimonials = [],
  posts = [],
  isAdminPreview = false,
}: PageClientProps) {
  const settings = mergeSiteSettings(settingsInput)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showExit, setShowExit] = useState(false)
  const [showApp, setShowApp] = useState(false)

  useVisitor()

  useEffect(() => {
    const currentHash = window.location.hash
    const pathname = window.location.pathname

    if (currentHash && currentHash !== '') {
      setShowApp(true)
      return
    }

    const navEntries = performance.getEntriesByType('navigation')
    const navigationType = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming).type : null
    const isReload = navigationType === 'reload'

    if (isReload && pathname === '/') {
      sessionStorage.removeItem('introPlayed')
      sessionStorage.removeItem('heroPlayed')
      if (window.location.hash) history.replaceState(null, '', '/')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    if (!hasPlayedIntro()) {
      setShowWelcome(true)
      const timer = setTimeout(() => {
        setShowWelcome(false)
        setShowApp(true)
        setIntroPlayed()
      }, 3600)
      return () => clearTimeout(timer)
    }

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
    <main id="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
      <ScrollProgressBar />
      <AnalyticsBeacon />
      <AnimatedBackground />
      <AchievementSystem />

      {isAdminPreview && (
        <div className="sticky top-0 z-[99999] flex items-center justify-center gap-2 bg-amber-500/90 py-2 px-4 text-center font-mono text-xs font-bold text-black backdrop-blur-md shadow-lg">
          <span>🚧 MAINTENANCE MODE ACTIVE</span>
          <span className="opacity-75">— Logged in as Admin Preview</span>
          <a href="/admin/settings" className="underline ml-2 hover:opacity-100">
            Edit Settings
          </a>
        </div>
      )}

      <CommandPalette />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar playlistUrl={settings.spotify_playlist_url} />
        <Hero showApp={showApp} settings={settings} />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <About settings={settings} />
        </motion.div>

        <GraphicScrollBanner />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <PortfolioShowcase projects={projects} technologies={technologies} />
        </motion.div>

        {settings.show_testimonials ? (
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <TestimonialsSection testimonials={testimonials} />
            <TestimonialWall />
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <BlogPreviewSection posts={posts} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <ContactSection settings={settings} />
        </motion.div>
      </div>

      <MotionSettings defaultMode={settings.performance_mode} />

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <IntroScreen mode="loading" ownerName={settings.owner_name} githubUrl={settings.github_url} musicUrl={settings.intro_music_url} />
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
            <IntroScreen mode="exit" ownerName={settings.owner_name} githubUrl={settings.github_url} musicUrl={settings.intro_music_url} />
          </motion.div>
        )}
      </AnimatePresence>

      <VisitorDetailsPrompt enabled={showApp} />
      <OutroExitModal enabled={showApp} />
    </main>
  )
}
