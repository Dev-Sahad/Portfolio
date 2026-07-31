'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, X, Volume2, ExternalLink, Sparkles, Disc } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface SpotifyPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  playlistUrl?: string
}

function formatSpotifyEmbedUrl(url: string): string {
  if (!url) return 'https://open.spotify.com/embed/playlist/0vvRV2Fw8k78yF31oN4L4g?utm_source=generator&theme=0'

  try {
    const cleanUrl = url.trim()
    if (cleanUrl.includes('/embed/')) return cleanUrl

    // Extract type (playlist, track, album) and ID
    const match = cleanUrl.match(/spotify\.com\/(?:intl-[a-z]+\/)?(playlist|track|album)\/([a-zA-Z0-9]+)/)
    if (match) {
      const [, type, id] = match
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
    }

    return cleanUrl.replace('open.spotify.com/', 'open.spotify.com/embed/')
  } catch {
    return 'https://open.spotify.com/embed/playlist/0vvRV2Fw8k78yF31oN4L4g?utm_source=generator&theme=0'
  }
}


export default function SpotifyPlayerModal({
  isOpen,
  onClose,
  playlistUrl = 'https://open.spotify.com/embed/playlist/0vvRV2Fw8k78yF31oN4L4g',
}: SpotifyPlayerModalProps) {
  const [currentUrl, setCurrentUrl] = useState(playlistUrl)
  const [customInput, setCustomInput] = useState('')
  const [mode, setMode] = useState<'spotify' | 'ambient'>('spotify')

  const { isAmbientPlaying, toggleAmbient, playClick, playHover } = useAudio()

  const embedUrl = formatSpotifyEmbedUrl(currentUrl)

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customInput.trim()) return
    playClick()
    setCurrentUrl(customInput.trim())
    setCustomInput('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[#121218]/90 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Disc className="h-5 w-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    Portfolio Music Engine
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-mono">
                      Spotify Connected
                    </span>
                  </h3>
                  <p className="text-xs text-white/40">Listen live while browsing Sahad&apos;s portfolio</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                onMouseEnter={playHover}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => {
                  playClick()
                  setMode('spotify')
                }}
                onMouseEnter={playHover}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition ${
                  mode === 'spotify' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' : 'text-white/50 hover:text-white'
                }`}
              >
                <Music size={14} />
                Spotify Player
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick()
                  setMode('ambient')
                }}
                onMouseEnter={playHover}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition ${
                  mode === 'ambient' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold' : 'text-white/50 hover:text-white'
                }`}
              >
                <Sparkles size={14} />
                Synth Ambient
              </button>
            </div>

            {/* Content Body */}
            {mode === 'spotify' ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify Web Player"
                    className="w-full rounded-2xl"
                  />
                </div>

                {/* Custom Spotify Link Input */}
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                  <input
                    type="url"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Paste Spotify track or playlist URL..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="submit"
                    onMouseEnter={playHover}
                    className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition"
                  >
                    Load
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <Volume2 size={24} className={isAmbientPlaying ? 'animate-bounce' : ''} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Procedural Web Audio Drone</h4>
                  <p className="text-xs text-white/40 mt-1">Synthesized low-pass ambient synth pad for focus</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playClick()
                    toggleAmbient()
                  }}
                  onMouseEnter={playHover}
                  className={`w-full py-3 rounded-xl font-medium text-xs transition border ${
                    isAmbientPlaying
                      ? 'bg-purple-500/30 text-purple-200 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  {isAmbientPlaying ? 'Stop Ambient Drone' : 'Play Ambient Drone'}
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-white/40">
              <span>Connected via Spotify Web Player</span>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:underline"
              >
                Open Spotify <ExternalLink size={11} />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
