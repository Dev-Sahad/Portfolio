'use client'

import { motion } from 'framer-motion'
import { Code2, Github, Globe, LogOut, Sparkles, User } from 'lucide-react'

const DEFAULT_GITHUB_URL = 'https://github.com/Dev-Sahad'

type IntroScreenProps = {
  mode?: 'loading' | 'exit'
  ownerName?: string
  githubUrl?: string
}

export default function IntroScreen({
  mode = 'loading',
  ownerName = 'Muhammad Sahad',
  githubUrl = DEFAULT_GITHUB_URL,
}: IntroScreenProps) {
  const isExit = mode === 'exit'
  const icons = isExit ? [Sparkles, Globe, LogOut] : [Code2, User, Globe]
  const words = isExit ? ['Thanks', 'for visiting'] : ['Welcome', 'to my']

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#05060a] px-5 text-white">
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
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,6,10,0.24)_48%,rgba(5,6,10,0.92)_100%)]"
      />

      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute h-[min(72vw,640px)] w-[min(72vw,640px)] rounded-full border border-cyan-200/10 bg-[radial-gradient(circle,rgba(103,232,249,0.08),transparent_62%)] blur-sm"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-[390px] flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-black/20 px-6 py-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-[3px]"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } },
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-xl"
            >
              <Icon size={18} />
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
                  delay: 0.75 + index * 0.22,
                  duration: 1.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-[clamp(19px,5vw,31px)] font-extrabold leading-tight"
              >
                {word}
              </motion.span>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 58 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="m-0 text-[clamp(21px,5vw,34px)] font-extrabold leading-tight"
          >
            {isExit ? ownerName : 'Portfolio Website'}
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-[11px] tracking-[0.12em] text-white/65"
        >
          <Github size={13} />
            <span className="truncate">
              {(githubUrl || DEFAULT_GITHUB_URL).replace(/^https?:\/\//, '')}
            </span>
        </motion.div>
      </motion.div>
    </div>
  )
}
