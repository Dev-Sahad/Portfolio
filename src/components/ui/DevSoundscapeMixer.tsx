'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sliders, Volume2, VolumeX, Sparkles, Play, Pause } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export default function DevSoundscapeMixer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [rainVol, setRainVol] = useState(50)
  const [keysVol, setKeysVol] = useState(30)
  const [droneVol, setDroneVol] = useState(60)
  const { playClick, playHover } = useAudio()

  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const toggleMaster = () => {
    playClick()

    if (isPlaying) {
      if (oscRef.current) {
        try {
          oscRef.current.stop()
        } catch {}
      }
      setIsPlaying(false)
      return
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(55, ctx.currentTime) // Low A drone

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(220, ctx.currentTime)

      gain.gain.setValueAtTime((droneVol / 100) * 0.15, ctx.currentTime)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      oscRef.current = osc
      gainRef.current = gain
      setIsPlaying(true)
      import('@/components/AchievementSystem').then((m) => m.unlockAchievement('audiophile'))
    } catch {
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime((droneVol / 100) * 0.15, audioCtxRef.current.currentTime)
    }
  }, [droneVol])

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop()
        } catch {}
      }
    }
  }, [])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-purple-400" />
          <h4 className="font-semibold text-xs text-white">Cyberpunk Coding Soundscape Synthesizer</h4>
        </div>

        <button
          type="button"
          onClick={toggleMaster}
          onMouseEnter={playHover}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            isPlaying
              ? 'bg-purple-500/30 text-purple-200 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'
          }`}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />} {isPlaying ? 'Mute Soundscape' : 'Start Audio Drone'}
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs text-white/70">
        <div>
          <div className="flex justify-between mb-1">
            <span>🌧️ Ambient Rain & Noise</span>
            <span className="text-purple-300">{rainVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={rainVol}
            onChange={(e) => setRainVol(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer h-1.5 rounded-lg bg-white/10"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>⌨️ Mechanical Keyboard Clicks</span>
            <span className="text-purple-300">{keysVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={keysVol}
            onChange={(e) => setKeysVol(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer h-1.5 rounded-lg bg-white/10"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>🌌 Low-Pass Synthwave Drone</span>
            <span className="text-purple-300">{droneVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={droneVol}
            onChange={(e) => setDroneVol(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer h-1.5 rounded-lg bg-white/10"
          />
        </div>
      </div>
    </div>
  )
}
