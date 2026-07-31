'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Menu, Share2, X, Volume2, VolumeX, Music } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import ShareModal from '@/components/ui/ShareModal'
import { useAudio } from '@/context/AudioContext'


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mounted, setMounted] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const { isMuted, isAmbientPlaying, toggleMute, toggleAmbient, playClick, playHover } = useAudio()

  // 🔥 navbar appears only once
  const [showNavbar, setShowNavbar] = useState(false)


  useEffect(() => {
    setMounted(true)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 960)
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const sections = ['home', 'about', 'portfolio', 'testimonials', 'notes', 'contact']

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId)
        if (!section) continue

        const rect = section.getBoundingClientRect()

        if (rect.top <= 140 && rect.bottom >= 140) {
          setActiveSection(sectionId)
          break
        }
      }
    }

    handleResize()
    handleScroll()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 🔥 Animated navbar only on refresh
  useEffect(() => {
    const navbarPlayed = sessionStorage.getItem('navbarPlayed')

    if (navbarPlayed) {
      setShowNavbar(true)
      return
    }

    const timer = setTimeout(() => {
      setShowNavbar(true)
      sessionStorage.setItem('navbarPlayed', 'true')
    }, 3800)

    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  const smoothScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    const target = document.querySelector(targetId)
    if (!target) {
      setOpen(false)
      return
    }

    e.preventDefault()

    const navbarOffset = 3
    const targetPosition =
      target.getBoundingClientRect().top + window.scrollY - navbarOffset

    const startPosition = window.scrollY
    const distance = targetPosition - startPosition
    const duration = 1200

    let startTime: number | null = null

    const easeInOutCubic = (t: number) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime

      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)

      const ease = easeInOutCubic(progress)

      window.scrollTo({
        top: startPosition + distance * ease,
      })

      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }

    requestAnimationFrame(animation)
    setOpen(false)
  }

  const navItems = [
    { label: 'Home', id: 'home', href: '#home' },
    { label: 'About', id: 'about', href: '#about' },
    { label: 'Portfolio', id: 'portfolio', href: '#portfolio' },
    { label: 'Notes', id: 'notes', href: '/blog' },
    { label: 'Contact', id: 'contact', href: '#contact' },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -40 }}
      animate={{
        opacity: showNavbar ? 1 : 0,
        y: showNavbar ? 0 : -40,
      }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: 'fixed',
        top: 20,
        left: isMobile ? 20 : 60,
        right: isMobile ? 20 : 60,
        zIndex: 50,
      }}
    >
      <div
        className="glass-tab-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 24px',
          width: '100%',
          borderRadius: 999,
          backgroundColor: scrolled
            ? 'rgba(18, 18, 18, 0.75)'
            : 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: 'var(--text-primary)',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            Dev-Sahad
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && (
            <div className="mr-3 flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              {navItems.map((item) => {
                const isActive = activeSection === item.id

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(event) => smoothScrollTo(event, `#${item.id}`)}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-colors duration-300 ${
                      isActive ? 'text-white font-medium' : 'text-white/60 hover:text-white'
                    }`}
                    style={{ textDecoration: 'none' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbarActiveTab"
                        className="absolute inset-0 rounded-full bg-white/20 border border-white/30 backdrop-blur-xl shadow-[0_2px_16px_rgba(255,255,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </a>
                )
              })}
            </div>
          )}

          {/* Audio controls */}
          <button
            type="button"
            onClick={() => {
              playClick()
              toggleMute()
            }}
            onMouseEnter={playHover}
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition hover:scale-105 ${
              isMuted ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            aria-label="Toggle sound effects"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              playClick()
              toggleAmbient()
            }}
            onMouseEnter={playHover}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition hover:scale-105 ${
              isAmbientPlaying ? 'bg-purple-500/30 text-purple-300 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isAmbientPlaying ? 'Stop Ambient Soundscape' : 'Play Ambient Soundscape'}
            aria-label="Toggle ambient music"
          >
            <Music className={`h-4 w-4 ${isAmbientPlaying ? 'animate-pulse' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              playClick()
              setShareOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Share Portfolio & QR Code"
            aria-label="Share portfolio"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <Link
            href="/admin"
            onClick={playClick}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-neutral-800 backdrop-blur-md transition hover:scale-105 hover:bg-white/20 dark:bg-black/20 dark:text-neutral-200"
            title="Admin Panel"
            aria-label="Open admin panel"
          >
            <Lock className="h-4 w-4" />
          </Link>


          {isMobile ? (
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
      </div>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />

      {isMobile && open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            marginTop: 10,
            borderRadius: 16,
            background: 'rgba(13,13,13,0.9)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(event) => smoothScrollTo(event, `#${item.id}`)}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: isActive
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                }}
              >
                {item.label}
              </a>
            )
          })}
        </motion.div>
      )}
    </motion.nav>
  )
}
