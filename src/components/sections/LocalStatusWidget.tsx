'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Zap, MapPin, Radio, CheckCircle2 } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export default function LocalStatusWidget() {
  const [timeString, setTimeString] = useState('')
  const { playHover } = useAudio()

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      // Display time in UTC+4 (GST / Dubai / Oman timezone)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }
      setTimeString(now.toLocaleTimeString('en-US', options))
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      onMouseEnter={playHover}
      className="rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4 font-mono text-xs text-white max-w-sm"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300">
            <span>Currently Coding</span>
            <Zap size={11} className="fill-emerald-300 text-emerald-300" />
          </div>
          <p className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> Asia/Dubai (UTC+4)
          </p>
        </div>
      </div>

      <div className="text-right border-l border-white/10 pl-3">
        <p className="text-[10px] text-white/40 flex items-center gap-1 justify-end">
          <Clock size={10} /> Local Time
        </p>
        <p className="text-xs font-bold text-cyan-300 mt-0.5">{timeString || '12:00:00 PM'}</p>
      </div>
    </div>
  )
}
