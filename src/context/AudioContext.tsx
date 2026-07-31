'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { audioManager } from '@/lib/audioManager'

interface AudioContextType {
  isMuted: boolean
  isAmbientPlaying: boolean
  playClick: () => void
  playHover: () => void
  playSuccess: () => void
  toggleMute: () => void
  toggleAmbient: () => void
}

const AudioContext = createContext<AudioContextType>({
  isMuted: false,
  isAmbientPlaying: false,
  playClick: () => {},
  playHover: () => {},
  playSuccess: () => {},
  toggleMute: () => {},
  toggleAmbient: () => {},
})

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false)

  useEffect(() => {
    const manager = audioManager
    if (!manager) return

    setIsMuted(manager.getMuted())
    setIsAmbientPlaying(manager.getAmbientPlaying())

    const unsubscribe = manager.subscribe(() => {
      setIsMuted(manager.getMuted())
      setIsAmbientPlaying(manager.getAmbientPlaying())
    })

    return () => unsubscribe()
  }, [])


  const playClick = () => audioManager?.playClick()
  const playHover = () => audioManager?.playHover()
  const playSuccess = () => audioManager?.playSuccess()
  const toggleMute = () => audioManager?.toggleMute()
  const toggleAmbient = () => audioManager?.toggleAmbient()

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        isAmbientPlaying,
        playClick,
        playHover,
        playSuccess,
        toggleMute,
        toggleAmbient,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => useContext(AudioContext)
