'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Code2, Github, Globe, LogOut, Sparkles, User, Zap, Volume2, VolumeX } from 'lucide-react'
import { usePointerParallax } from '@/hooks/usePointerParallax'

const DEFAULT_GITHUB_URL = 'https://github.com/Dev-Sahad'

const MARQUEE_WORDS_UP = [
  'DEVELOPER',
  'FULL STACK',
  'CREATIVE CODE',
  'NEXT.JS 15',
  'REACT 19',
  'THREE.JS',
  'SUPABASE',
  'TAILWIND',
  'TYPESCRIPT',
  'DEVELOPER',
  'FULL STACK',
]

const MARQUEE_WORDS_DOWN = [
  'UI/UX DESIGN',
  '3D MOTION',
  'DISCORD WEBHOOKS',
  'SYSTEM DIAGNOSTICS',
  'DYNAMIC APIS',
  'ANIMATED STACK',
  'INTERACTIVE WEB',
  'PORTFOLIO 2026',
  'UI/UX DESIGN',
  '3D MOTION',
]

type IntroScreenProps = {
  mode?: 'loading' | 'exit'
  ownerName?: string
  githubUrl?: string
  musicUrl?: string
}

export default function IntroScreen({
  mode = 'loading',
  ownerName = 'Muhammad Sahad',
  githubUrl = DEFAULT_GITHUB_URL,
  musicUrl,
}: IntroScreenProps) {
  const isExit = mode === 'exit'
  const icons = isExit ? [Sparkles, Globe, LogOut] : [Code2, Zap, Globe]
  const words = isExit ? ['Thanks', 'for visiting'] : ['Welcome', 'to my']
  const introRef = usePointerParallax<HTMLDivElement>({ smoothing: 0.08 })

  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isIntroMuted, setIsIntroMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ytRef = useRef<HTMLIFrameElement | null>(null)

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol)
    setIsIntroMuted(newVol === 0)

    if (audioRef.current) {
      audioRef.current.volume = newVol / 100
      audioRef.current.muted = newVol === 0
    }

    if (ytRef.current && ytRef.current.contentWindow) {
      try {
        ytRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [newVol] }),
          '*'
        )
        if (newVol === 0) {
          ytRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'mute', args: [] }),
            '*'
          )
        } else {
          ytRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
            '*'
          )
        }
      } catch { }
    }
  }

  const toggleIntroMute = () => {
    if (isIntroMuted) {
      handleVolumeChange(50)
    } else {
      handleVolumeChange(0)
    }
  }

  // State-driven mute synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isIntroMuted
    }
  }, [isIntroMuted])

  useEffect(() => {
    if (isExit) {
      setProgress(100)
      return
    }

    const duration = 30000
    const intervalTime = 30
    const steps = duration / intervalTime
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep += 1
      const progressPercent = Math.min(100, Math.round((currentStep / steps) * 100))
      setProgress(progressPercent)

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isExit])

  function getYouTubeId(url?: string): string | null {
    const localUrl = typeof window !== 'undefined' ? localStorage.getItem('portfolio_intro_music_url') : null
    const targetUrl = localUrl || url
    if (!targetUrl) return null
    const match = targetUrl.trim().match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([\w-]{11})/)
    return match ? match[1] : null
  }

  const effectiveMusicUrl = (typeof window !== 'undefined' && localStorage.getItem('portfolio_intro_music_url')) || musicUrl
  const youtubeId = getYouTubeId(effectiveMusicUrl)

  useEffect(() => {
    if (!musicUrl || isExit || youtubeId) return
    let fadeInInterval: NodeJS.Timeout
    let fadeOutInterval: NodeJS.Timeout
    let fadeOutTimer: NodeJS.Timeout
    let audio: HTMLAudioElement | null = null

    const TARGET_VOL = 0.5
    const FADE_IN_DURATION = 2500
    const INTRO_TOTAL_DURATION = 30000
    const STEP_INTERVAL = 100
    const volumeStep = TARGET_VOL / (FADE_IN_DURATION / STEP_INTERVAL)

    const startTime = Date.now()

    try {
      audio = new Audio(musicUrl)
      audio.muted = isIntroMuted
      audioRef.current = audio
      audio.volume = 0

      const playAudio = () => {
        if (!audio) return
        audio.play().then(() => {
          let currentVol = 0
          fadeInInterval = setInterval(() => {
            if (currentVol < TARGET_VOL) {
              currentVol += volumeStep
              if (audio) audio.volume = Math.min(TARGET_VOL, currentVol)
            } else {
              clearInterval(fadeInInterval)
            }
          }, STEP_INTERVAL)

          const elapsedTime = Date.now() - startTime
          const fadeOutDelay = Math.max(0, INTRO_TOTAL_DURATION - FADE_IN_DURATION - elapsedTime)

          fadeOutTimer = setTimeout(() => {
            fadeOutInterval = setInterval(() => {
              if (audio && audio.volume > volumeStep) {
                audio.volume = Math.max(0, audio.volume - volumeStep)
              } else {
                if (audio) audio.volume = 0
                clearInterval(fadeOutInterval)
              }
            }, STEP_INTERVAL)
          }, fadeOutDelay)
        }).catch(() => { })
      }

      playAudio()

      // Mobile Touch unlock listener for iOS / Android autoplay policies
      const handleMobileUnlock = () => {
        playAudio()
        window.removeEventListener('touchstart', handleMobileUnlock)
        window.removeEventListener('click', handleMobileUnlock)
      }
      window.addEventListener('touchstart', handleMobileUnlock, { once: true })
      window.addEventListener('click', handleMobileUnlock, { once: true })
    } catch { }

    return () => {
      clearInterval(fadeInInterval)
      clearInterval(fadeOutInterval)
      clearTimeout(fadeOutTimer)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      if (audioRef.current === audio) {
        audioRef.current = null
      }
    }
  }, [musicUrl, isExit, youtubeId, isIntroMuted])

  useEffect(() => {
    if (ytRef.current && ytRef.current.contentWindow) {
      try {
        ytRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: isIntroMuted ? 'mute' : 'unMute', args: [] }),
          '*'
        )
      } catch { }
    }
  }, [isIntroMuted])

  return (
    <div
      ref={introRef}
      className="pointer-parallax-root fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#05060a] px-5 text-white"
    >
      {youtubeId && !isExit && (
        <iframe
          ref={ytRef}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&enablejsapi=1&controls=0`}
          allow="autoplay"
          title="Intro Screen Music"
          aria-hidden="true"
          className="absolute -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none"
        />
      )}

      {/* Intro Screen Sound & Volume Slider Control */}
      {!isExit && (
        <div className="absolute top-6 right-6 z-[10000] flex items-center gap-3 rounded-full border border-cyan-400/40 bg-black/80 px-4 py-2 text-xs font-mono text-cyan-300 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.4)]">
          <button
            type="button"
            onClick={toggleIntroMute}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            title={isIntroMuted ? "Unmute Intro Audio" : "Mute Intro Audio"}
          >
            {isIntroMuted || volume === 0 ? (
              <VolumeX size={16} className="text-red-400" />
            ) : (
              <Volume2 size={16} className="text-cyan-400 animate-pulse" />
            )}
            <span className="font-bold hidden sm:inline">{isIntroMuted || volume === 0 ? "MUTED" : `${volume}%`}</span>
          </button>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 sm:w-28 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Adjust Volume: ${volume}%`}
            />
            <span className="text-[11px] font-bold text-cyan-300 w-8">{volume}%</span>
          </div>
        </div>
      )}

      {/* KINETIC SCROLLING BACKGROUND MARQUEE */}
      <div className="absolute inset-0 z-0 flex justify-between px-6 opacity-15 pointer-events-none select-none overflow-hidden">
        {/* LEFT COLUMN - SCROLLING UP */}
        <motion.div
          className="flex flex-col gap-8 font-mono text-4xl sm:text-6xl font-black tracking-widest text-cyan-200"
          animate={{ y: [0, -600] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          {MARQUEE_WORDS_UP.map((w, idx) => (
            <span key={idx} className="whitespace-nowrap">{w}</span>
          ))}
        </motion.div>

        {/* RIGHT COLUMN - SCROLLING DOWN */}
        <motion.div
          className="hidden sm:flex flex-col gap-8 font-mono text-4xl sm:text-6xl font-black tracking-widest text-purple-300"
          animate={{ y: [-600, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {MARQUEE_WORDS_DOWN.map((w, idx) => (
            <span key={idx} className="whitespace-nowrap">{w}</span>
          ))}
        </motion.div>
      </div>

      {/* 3D STAGE & CORE */}
      <div
        aria-hidden="true"
        data-heavy-visual="true"
        className="intro-3d-stage"
      >
        <div className="intro-3d-copy intro-3d-copy--top">DESIGN / CODE / MOTION</div>
        <div className="intro-3d-copy intro-3d-copy--side">DIGITAL SPACE · 2026</div>

        <div className="intro-3d-object">
          <div className="intro-3d-orbit intro-3d-orbit--one"><i /></div>
          <div className="intro-3d-orbit intro-3d-orbit--two"><i /></div>
          <div className="intro-3d-orbit intro-3d-orbit--three"><i /></div>
          <div className="intro-3d-core">
            <span className="intro-3d-face intro-3d-face--front">DS</span>
            <span className="intro-3d-face intro-3d-face--back">3D</span>
            <span className="intro-3d-face intro-3d-face--right" />
            <span className="intro-3d-face intro-3d-face--left" />
            <span className="intro-3d-face intro-3d-face--top" />
            <span className="intro-3d-face intro-3d-face--bottom" />
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,6,10,0.35)_50%,rgba(5,6,10,0.95)_100%)]"
      />

      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute h-[min(72vw,640px)] w-[min(72vw,640px)] rounded-full border border-cyan-200/10 bg-[radial-gradient(circle,rgba(103,232,249,0.08),transparent_62%)] blur-sm"
      />

      {/* MAIN FROSTED GLASS CARD */}
      <div className="intro-panel-parallax relative z-10 w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col items-center gap-6 rounded-[2.2rem] border border-white/15 bg-white/[0.04] px-7 py-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.18 } },
            }}
            className="flex items-center justify-center gap-3"
          >
            {icons.map((Icon, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.25, rotate: -120, y: 50 },
                  visible: { opacity: 1, scale: 1, rotate: 0, y: 0 },
                }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                animate={{ y: [0, -7, 0], rotate: [0, 2, -2, 0] }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_4px_20px_rgba(255,255,255,0.12)] backdrop-blur-xl"
              >
                <Icon size={20} className="text-white" />
              </motion.div>
            ))}
          </motion.div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center gap-x-2">
              {words.map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, x: index === 0 ? 110 : -110 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.5 + index * 0.2,
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-[clamp(20px,5vw,32px)] font-extrabold leading-tight text-white/90"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="m-0 text-[clamp(22px,5vw,36px)] font-extrabold leading-tight tracking-tight text-white"
            >
              {isExit ? ownerName : 'Portfolio Website'}
            </motion.h1>
          </div>

          {/* PROGRESS COUNTER & BAR */}
          {!isExit && (
            <div className="w-full space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono tracking-widest text-white/60">
                <span>SYSTEM INIT</span>
                <span className="font-bold text-cyan-300">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-white shadow-[0_0_12px_rgba(103,232,249,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-mono text-[11px] tracking-[0.12em] text-white/70 backdrop-blur-md"
          >
            <Github size={13} />
            <span className="truncate">
              {(githubUrl || DEFAULT_GITHUB_URL).replace(/^https?:\/\//, '')}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
