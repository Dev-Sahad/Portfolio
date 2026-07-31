'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Menu, Share2, X, Volume2, VolumeX, Music, Terminal, Globe, Gamepad2, Activity, FileText, MessageSquare, Bot, Mic, Trophy, Code2, Sparkles, Instagram } from 'lucide-react'
import PerformanceModeToggle from '@/components/PerformanceModeToggle'
import CyberPaletteSelector from '@/components/CyberPaletteSelector'
import ShareModal from '@/components/ui/ShareModal'
import SpotifyPlayerModal from '@/components/ui/SpotifyPlayerModal'
import TerminalModal from '@/components/ui/TerminalModal'
import GlobalVisitorRadar from '@/components/ui/GlobalVisitorRadar'
import BugSmasherModal from '@/components/ui/BugSmasherModal'
import PerformanceLabModal from '@/components/ui/PerformanceLabModal'
import TailoredCVModal from '@/components/ui/TailoredCVModal'
import DirectInquiryDrawer from '@/components/ui/DirectInquiryDrawer'
import PortfolioCopilot from '@/components/ui/PortfolioCopilot'
import ShaderPlaygroundModal from '@/components/ui/ShaderPlaygroundModal'
import VoiceControlModal from '@/components/ui/VoiceControlModal'
import DevQuizArenaModal from '@/components/ui/DevQuizArenaModal'
import SnippetVaultModal from '@/components/ui/SnippetVaultModal'
import { useAudio } from '@/context/AudioContext'

interface NavbarProps {
  playlistUrl?: string
}

export default function Navbar({ playlistUrl }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mounted, setMounted] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [spotifyOpen, setSpotifyOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [radarOpen, setRadarOpen] = useState(false)
  const [bugModalOpen, setBugModalOpen] = useState(false)
  const [perfLabOpen, setPerfLabOpen] = useState(false)
  const [tailoredCVOpen, setTailoredCVOpen] = useState(false)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [shaderOpen, setShaderOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [snippetOpen, setSnippetOpen] = useState(false)



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
              setSpotifyOpen(true)
            }}
            onMouseEnter={playHover}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition hover:scale-105 ${
              isAmbientPlaying || spotifyOpen ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Open Spotify & Portfolio Music Player"
            aria-label="Open Spotify Music player"
          >
            <Music className={`h-4 w-4 ${isAmbientPlaying || spotifyOpen ? 'animate-pulse' : ''}`} />
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
          <button
            type="button"
            onClick={() => {
              playClick()
              setTerminalOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-emerald-400 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Open Developer Terminal CLI"
            aria-label="Open developer terminal"
          >
            <Terminal className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setRadarOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-400 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Global Visitor Radar & Live Map"
            aria-label="Open global visitor radar"
          >
            <Globe className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setBugModalOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-amber-400 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Play Bug Smasher Arcade Game"
            aria-label="Play Arcade Game"
          >
            <Gamepad2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setPerfLabOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-emerald-400 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Performance Lab & Web Vitals Telemetry"
            aria-label="Open performance lab"
          >
            <Activity className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setTailoredCVOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-purple-400 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Live Tailored CV Builder"
            aria-label="Open CV Builder"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setInquiryOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-emerald-300 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Direct Line to Sahad"
            aria-label="Direct Quick Inquiry"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setVoiceOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-300 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Voice Navigation"
            aria-label="Open Voice Control"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setQuizOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-amber-300 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Dev Quiz Arena"
            aria-label="Open Dev Quiz"
          >
            <Trophy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setSnippetOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-purple-300 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Snippet Vault"
            aria-label="Open Snippet Vault"
          >
            <Code2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setShaderOpen(true)
            }}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-pink-300 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="3D Shader Canvas Playground"
            aria-label="Open Shader Canvas"
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <a
            href="https://www.instagram.com/sahad_____sha/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            onMouseEnter={playHover}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-pink-400 backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
            title="Instagram Profile @sahad_____sha"
            aria-label="Open Instagram profile"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <PerformanceModeToggle />
          <CyberPaletteSelector />
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
      <SpotifyPlayerModal isOpen={spotifyOpen} onClose={() => setSpotifyOpen(false)} playlistUrl={playlistUrl} />
      <TerminalModal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <GlobalVisitorRadar isOpen={radarOpen} onClose={() => setRadarOpen(false)} />
      <BugSmasherModal isOpen={bugModalOpen} onClose={() => setBugModalOpen(false)} />
      <PerformanceLabModal isOpen={perfLabOpen} onClose={() => setPerfLabOpen(false)} />
      <TailoredCVModal isOpen={tailoredCVOpen} onClose={() => setTailoredCVOpen(false)} />
      <DirectInquiryDrawer isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <PortfolioCopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
      <ShaderPlaygroundModal isOpen={shaderOpen} onClose={() => setShaderOpen(false)} />
      <VoiceControlModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <DevQuizArenaModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />
      <SnippetVaultModal isOpen={snippetOpen} onClose={() => setSnippetOpen(false)} />

      {/* Floating Bottom Left AI Co-Pilot Trigger */}
      <div className="fixed bottom-6 left-6 z-[95]">
        <button
          type="button"
          onClick={() => {
            playClick()
            setCopilotOpen(true)
          }}
          onMouseEnter={playHover}
          className="group relative flex items-center gap-2 rounded-full border border-cyan-400/50 bg-[#0a0c16]/90 px-4 py-3 text-xs font-bold text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-xl hover:scale-105 transition cursor-pointer"
          title="Sahad AI Co-Pilot Assistant"
          aria-label="Open AI Co-Pilot"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
          </span>
          <Bot className="h-4 w-4 text-cyan-300 group-hover:rotate-12 transition" />
          <span className="font-mono">AI Co-Pilot</span>
        </button>
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
