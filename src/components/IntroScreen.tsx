'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Globe, LogOut, Code2, Zap, Volume2, VolumeX, ArrowRight, Github } from 'lucide-react'
import { usePointerParallax } from '@/hooks/usePointerParallax'

const MARQUEE_WORDS_UP = [
  'SAHAD SHA',
  'DEVELOPER',
  'WEBGL 3D',
  'REACT 19',
  'NEXT.JS 15',
  'FULL STACK',
  'PORTFOLIO',
  'SAHAD SHA',
  'DEVELOPER',
  'WEBGL 3D',
]

const MARQUEE_WORDS_DOWN = [
  'INTERACTIVE',
  'CREATIVE',
  'FAST PERFORMANCE',
  'ANIMATION',
  'HIGH SPEED',
  'CLEAN CODE',
  'UI/UX DESIGN',
  'INTERACTIVE',
  'CREATIVE',
  'FAST PERFORMANCE',
]

const DEFAULT_GITHUB_URL = 'https://github.com/Dev-Sahad'

interface IntroScreenProps {
  mode?: 'loading' | 'exit'
  ownerName?: string
  githubUrl?: string
  musicUrl?: string
  onEnter?: () => void
}

export default function IntroScreen({
  mode = 'loading',
  ownerName = 'Muhammad Sahad',
  githubUrl = DEFAULT_GITHUB_URL,
  musicUrl,
  onEnter,
}: IntroScreenProps) {
  const isExit = mode === 'exit'
  const icons = isExit ? [Sparkles, Globe, LogOut] : [Code2, Zap, Globe]
  const words = isExit ? ['Thanks', 'for visiting'] : ['Welcome', 'to my']
  const introRef = usePointerParallax<HTMLDivElement>({ smoothing: 0.08 })

  const [volume, setVolume] = useState(60)
  const [isIntroMuted, setIsIntroMuted] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ytRef = useRef<HTMLIFrameElement | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const volumeRef = useRef(60)
  const mutedRef = useRef(false)

  const clearFade = useCallback(() => {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
  }, [])

  const sendYouTubeCommand = useCallback((func: string, args: unknown[] = []) => {
    ytRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*',
    )
  }, [])

  const fadeDirectAudio = useCallback((audio: HTMLAudioElement, target: number, duration: number) => {
    clearFade()
    const start = audio.volume
    const startedAt = performance.now()
    fadeTimerRef.current = setInterval(() => {
      const progress = Math.min((performance.now() - startedAt) / duration, 1)
      const eased = progress * progress * (3 - 2 * progress)
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * eased))
      if (progress >= 1) clearFade()
    }, 40)
  }, [clearFade])

  const fadeYouTube = useCallback((target: number, duration: number, startOverride?: number) => {
    clearFade()
    const start = startOverride ?? (mutedRef.current ? 0 : volumeRef.current)
    const startedAt = performance.now()
    fadeTimerRef.current = setInterval(() => {
      const progress = Math.min((performance.now() - startedAt) / duration, 1)
      const eased = progress * progress * (3 - 2 * progress)
      sendYouTubeCommand('setVolume', [Math.round(start + (target - start) * eased)])
      if (progress >= 1) clearFade()
    }, 50)
  }, [clearFade, sendYouTubeCommand])

  const fadeOutIntro = useCallback(async () => {
    const duration = 650
    const audio = audioRef.current
    if (audio) fadeDirectAudio(audio, 0, duration)
    if (ytRef.current) fadeYouTube(0, duration)
    await new Promise((resolve) => setTimeout(resolve, duration))
    if (audio) audio.pause()
    sendYouTubeCommand('stopVideo')
  }, [fadeDirectAudio, fadeYouTube, sendYouTubeCommand])

  const handleEnterPortfolio = async () => {
    if (isLeaving) return
    setIsLeaving(true)
    await fadeOutIntro()
    if (onEnter) onEnter()
  }

  const handleYouTubeReady = () => {
    sendYouTubeCommand('setVolume', [0])
    sendYouTubeCommand('mute')
    sendYouTubeCommand('playVideo')
    window.setTimeout(() => {
      if (!mutedRef.current && volumeRef.current > 0) {
        sendYouTubeCommand('unMute')
        fadeYouTube(volumeRef.current, 1600, 0)
      }
    }, 180)
  }

  useEffect(() => {
    volumeRef.current = volume
    mutedRef.current = isIntroMuted
  }, [volume, isIntroMuted])

  useEffect(() => () => {
    clearFade()
  }, [clearFade])

  const handleVolumeChange = (newVol: number) => {
    const previousVolume = mutedRef.current ? 0 : volumeRef.current
    volumeRef.current = newVol
    mutedRef.current = newVol === 0
    setVolume(newVol)
    setIsIntroMuted(newVol === 0)

    if (audioRef.current) {
      audioRef.current.muted = false
      fadeDirectAudio(audioRef.current, newVol / 100, 280)
    }

    if (newVol === 0) {
      sendYouTubeCommand('setVolume', [0])
      sendYouTubeCommand('mute')
    } else {
      sendYouTubeCommand('unMute')
      fadeYouTube(newVol, 280, previousVolume)
    }
  }

  const toggleIntroMute = () => {
    if (isIntroMuted) {
      handleVolumeChange(60)
    } else {
      handleVolumeChange(0)
    }
  }

  function getYouTubeId(url?: string): string | null {
    const localUrl = typeof window !== 'undefined' ? localStorage.getItem('portfolio_intro_music_url') : null
    const targetUrl = localUrl || url
    if (!targetUrl) return null
    const match = targetUrl.trim().match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([\w-]{11})/)
    return match ? match[1] : null
  }

  const effectiveMusicUrl = (typeof window !== 'undefined' && localStorage.getItem('portfolio_intro_music_url')) || musicUrl
  const youtubeId = getYouTubeId(effectiveMusicUrl)

  // Direct audio starts silently and eases to the chosen level.
  useEffect(() => {
    if (!effectiveMusicUrl || isExit || youtubeId) return
    let audio: HTMLAudioElement | null = null

    try {
      audio = new Audio(effectiveMusicUrl)
      audio.loop = true
      audio.preload = 'auto'
      audio.volume = 0
      audioRef.current = audio

      const playAudio = () => {
        if (!audio) return
        audio.play().then(() => {
          if (!mutedRef.current) fadeDirectAudio(audio!, volumeRef.current / 100, 1600)
        }).catch(() => { })
      }

      playAudio()

      // User Touch / Click unlock listener for browser autoplay policies
      const handleUnlock = () => {
        playAudio()
        window.removeEventListener('touchstart', handleUnlock)
        window.removeEventListener('click', handleUnlock)
      }
      window.addEventListener('touchstart', handleUnlock, { once: true })
      window.addEventListener('click', handleUnlock, { once: true })
    } catch { }

    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      if (audioRef.current === audio) {
        audioRef.current = null
      }
    }
  }, [effectiveMusicUrl, fadeDirectAudio, isExit, youtubeId])

  return (
    <div
      ref={introRef}
      className="pointer-parallax-root fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#05060a] px-5 text-white"
    >
      {youtubeId && !isExit && (
        <iframe
          ref={ytRef}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&enablejsapi=1&controls=0`}
          onLoad={handleYouTubeReady}
          allow="autoplay"
          title="Intro Screen Music"
          aria-hidden="true"
          className="absolute -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none"
        />
      )}

      {/* Intro Screen Sound & Volume Control */}
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
        <motion.div
          className="flex flex-col gap-8 font-mono text-4xl sm:text-6xl font-black tracking-widest text-cyan-200"
          animate={{ y: [0, -600] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          {MARQUEE_WORDS_UP.map((w, idx) => (
            <span key={idx} className="whitespace-nowrap">{w}</span>
          ))}
        </motion.div>

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

      {/* MAIN FROSTED GLASS CARD WITH CLICKABLE BUTTONS */}
      <div className="intro-panel-parallax relative z-10 w-full max-w-[440px]">
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
                    delay: 0.3 + index * 0.2,
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
              transition={{ delay: 0.5, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="m-0 text-[clamp(22px,5vw,36px)] font-extrabold leading-tight tracking-tight text-white"
            >
              {isExit ? ownerName : 'Portfolio Website'}
            </motion.h1>
          </div>

          {/* CLICKABLE NAVIGATION BUTTONS */}
          {!isExit && (
            <div className="w-full space-y-3 pt-2">
              <button
                type="button"
                onClick={handleEnterPortfolio}
                disabled={isLeaving}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 py-3.5 px-6 font-mono text-xs font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
              >
                <span>{isLeaving ? 'ENTERING…' : 'ENTER PORTFOLIO'}</span>
                <ArrowRight size={16} />
              </button>

            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
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
