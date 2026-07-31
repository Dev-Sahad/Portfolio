'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Mic, Radio, Volume2, Sparkles, Check } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface VoiceMemo {
  id: string
  title: string
  duration: string
  topic: string
  transcript: string
}

const VOICE_MEMOS: VoiceMemo[] = [
  {
    id: 'memo-1',
    title: 'My Engineering Philosophy',
    duration: '0:18',
    topic: 'Architecture & Clean Code',
    transcript:
      'I believe in building clean, scalable frontend systems with zero compromises on performance or user experience.',
  },
  {
    id: 'memo-2',
    title: 'Why I Love 3D WebGL',
    duration: '0:15',
    topic: 'Creative Frontend & Three.js',
    transcript:
      'Interactive 3D experiences bring web applications to life by giving visitors tactile, immersive visual feedback.',
  },
  {
    id: 'memo-3',
    title: 'High-Performance Next.js 15',
    duration: '0:20',
    topic: 'Full-Stack Execution',
    transcript:
      'Combining Next.js 15 App Router with Supabase Postgres gives total control over security, rendering speed, and scalability.',
  },
]

export default function DeveloperVoiceMemos() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const { playClick, playHover } = useAudio()

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const toggleMemo = (memo: VoiceMemo) => {
    playClick()

    if (playingId === memo.id) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setPlayingId(null)
      return
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(memo.transcript)
      utterance.rate = 1.05
      utterance.pitch = 1.0

      utterance.onend = () => {
        setPlayingId(null)
      }
      utterance.onerror = () => {
        setPlayingId(null)
      }

      setPlayingId(memo.id)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="my-8 rounded-3xl border border-white/15 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Mic className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              Sahad&apos;s Developer Audio Memos
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] text-cyan-300 font-mono">
                Voice Assistant
              </span>
            </h3>
            <p className="text-xs text-white/50">Listen to short audio memos regarding engineering, 3D & performance</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {VOICE_MEMOS.map((memo) => {
          const isPlaying = playingId === memo.id
          return (
            <div
              key={memo.id}
              className={`flex flex-col justify-between rounded-2xl p-4 border transition ${
                isPlaying
                  ? 'border-cyan-400/50 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'border-white/10 bg-black/40 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1">
                  <span>{memo.topic}</span>
                  <span>{memo.duration}</span>
                </div>
                <h4 className="font-bold text-xs text-white mb-2 leading-snug">{memo.title}</h4>
                <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">&ldquo;{memo.transcript}&rdquo;</p>
              </div>

              {/* Equalizer / Play button */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                {isPlaying ? (
                  <div className="flex items-center gap-1">
                    {[30, 80, 50, 90, 40].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-cyan-400 rounded-full animate-pulse"
                        style={{ height: `${h * 0.2}px`, animationDuration: `${0.3 + i * 0.1}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-white/40">Click to listen</span>
                )}

                <button
                  type="button"
                  onClick={() => toggleMemo(memo)}
                  onMouseEnter={playHover}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    isPlaying
                      ? 'bg-cyan-400 text-black border-cyan-300 font-bold'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                  aria-label={isPlaying ? 'Pause voice memo' : 'Play voice memo'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
