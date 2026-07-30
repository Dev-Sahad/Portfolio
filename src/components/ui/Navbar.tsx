'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mounted, setMounted] = useState(false)

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
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 30px',
          width: '100%',
          borderRadius: 999,
          backgroundColor: scrolled
            ? 'rgba(13,13,13,0.85)'
            : 'rgba(13,13,13,0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: 'var(--text-secondary)',
              letterSpacing: '0.1em',
            }}
          >
            Dev-Sahad
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && (
            <div className="mr-3 flex items-center gap-5 xl:gap-8">
              {navItems.map((item) => {
                const isActive = activeSection === item.id

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(event) => smoothScrollTo(event, `#${item.id}`)}
                    style={{
                      position: 'relative',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13,
                      color: isActive
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      textDecoration: 'none',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      paddingBottom: 4,
                      transition: '0.25s ease',
                    }}
                  >
                    {item.label}

                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: 1,
                        background: 'white',
                        transform: isActive
                          ? 'scaleX(1)'
                          : 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 0.25s ease',
                      }}
                    />
                  </a>
                )
              })}
            </div>
          )}

          <ThemeToggle />
          <Link
            href="/admin"
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
