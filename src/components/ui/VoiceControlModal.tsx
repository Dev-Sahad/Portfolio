'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, X, Sparkles, Command, Check } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface VoiceControlModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VoiceControlModal({ isOpen, onClose }: VoiceControlModalProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [statusMsg, setStatusMsg] = useState('Click start to speak a navigation command...')
  const { playClick, playHover, playSuccess } = useAudio()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playClick()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, playClick])

  const toggleListening = () => {
    playClick()

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setStatusMsg('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      setIsListening(false)
      setStatusMsg('Voice recognition paused.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setStatusMsg('Listening for spoken command...')
      }

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript.toLowerCase()
        setTranscript(spokenText)
        playSuccess()

        if (spokenText.includes('project') || spokenText.includes('work')) {
          setStatusMsg('Navigating to Projects...')
          window.location.hash = '#projects'
        } else if (spokenText.includes('about') || spokenText.includes('bio')) {
          setStatusMsg('Navigating to About section...')
          window.location.hash = '#about'
        } else if (spokenText.includes('contact') || spokenText.includes('reach')) {
          setStatusMsg('Navigating to Contact section...')
          window.location.hash = '#contact'
        } else {
          setStatusMsg(`Recognized: "${spokenText}". Command executed.`)
        }

        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
        setStatusMsg('Speech recognition error. Please try again.')
      }

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            className="relative flex flex-col w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0c0d18]/95 p-6 shadow-2xl backdrop-blur-2xl text-white text-center"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                Sahad Voice Navigation
              </h3>
              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mic Pulse Sphere */}
            <div className="my-6 flex justify-center">
              <button
                type="button"
                onClick={toggleListening}
                onMouseEnter={playHover}
                className={`relative flex h-24 w-24 items-center justify-center rounded-full border transition-all duration-300 ${
                  isListening
                    ? 'border-cyan-400 bg-cyan-500/30 text-cyan-200 shadow-[0_0_40px_rgba(6,182,212,0.6)] scale-105'
                    : 'border-white/20 bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {isListening ? (
                  <Mic size={36} className="animate-pulse text-cyan-300" />
                ) : (
                  <MicOff size={36} />
                )}
              </button>
            </div>

            <p className="text-xs font-mono text-cyan-300 mb-4">{statusMsg}</p>

            {transcript && (
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs font-mono text-white/80 mb-4">
                Transcript: &ldquo;{transcript}&rdquo;
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left font-mono text-[11px] text-white/60 space-y-1.5">
              <p className="font-bold text-white mb-1">Try saying:</p>
              <p>• &ldquo;Go to projects&rdquo;</p>
              <p>• &ldquo;Show about me&rdquo;</p>
              <p>• &ldquo;Contact Sahad&rdquo;</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
