'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Laptop, Smartphone, Tablet, X, ExternalLink, RefreshCw, Maximize2, Sparkles } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export type DeviceType = 'desktop' | 'mobile' | 'tablet'

interface DeviceFrameModalProps {
  isOpen: boolean
  onClose: () => void
  projectTitle?: string
  projectUrl?: string
  projectImage?: string
}

export default function DeviceFrameModal({
  isOpen,
  onClose,
  projectTitle = 'Showcase Project',
  projectUrl = 'https://sahad.is-a.dev',
  projectImage,
}: DeviceFrameModalProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [rotate3D, setRotate3D] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const { playClick, playHover } = useAudio()

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

  const reloadIframe = () => {
    playClick()
    setIframeKey((prev) => prev + 1)
  }

  // Device dimensions
  const getDeviceStyle = () => {
    switch (device) {
      case 'mobile':
        return { width: '380px', height: '700px', borderRadius: '44px', border: '10px solid #1a1a24' }
      case 'tablet':
        return { width: '650px', height: '750px', borderRadius: '32px', border: '12px solid #1a1a24' }
      case 'desktop':
      default:
        return { width: '100%', maxWidth: '940px', height: '560px', borderRadius: '20px', border: '8px solid #1a1a24' }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Device Frame Inspection Theater"
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/20 bg-[#0b0c16]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Maximize2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    3D Device Inspection Theater
                    <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] text-purple-300 font-mono">
                      {projectTitle}
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">Preview live responsive render across real device viewports</p>
                </div>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      playClick()
                      setDevice('desktop')
                    }}
                    onMouseEnter={playHover}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      device === 'desktop' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40 font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Laptop size={14} /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClick()
                      setDevice('tablet')
                    }}
                    onMouseEnter={playHover}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      device === 'tablet' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40 font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Tablet size={14} /> Tablet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClick()
                      setDevice('mobile')
                    }}
                    onMouseEnter={playHover}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      device === 'mobile' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40 font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Smartphone size={14} /> Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={reloadIframe}
                  onMouseEnter={playHover}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/15 hover:text-white transition"
                  title="Reload Iframe Preview"
                >
                  <RefreshCw size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick()
                    onClose()
                  }}
                  onMouseEnter={playHover}
                  className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Device Container Stage */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-black/40 rounded-2xl border border-white/5 min-h-[420px]">
              <motion.div
                key={`${device}-${iframeKey}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={getDeviceStyle()}
                className="relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#10111a] flex flex-col transition-all duration-300"
              >
                {/* Device Camera / Speaker Header for mobile */}
                {device === 'mobile' && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 h-4 w-28 rounded-full bg-black flex items-center justify-center gap-2 border border-white/10">
                    <span className="h-2 w-2 rounded-full bg-blue-500/80" />
                    <span className="h-1.5 w-10 rounded-full bg-white/20" />
                  </div>
                )}

                {/* Device Frame Window Header for Desktop */}
                {device === 'desktop' && (
                  <div className="flex items-center justify-between px-3 py-2 bg-[#181926] border-b border-white/10 text-[11px] font-mono text-white/40 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="truncate max-w-[300px] text-white/60">{projectUrl}</span>
                    <span className="text-[10px] text-purple-400">Live Frame</span>
                  </div>
                )}

                {/* Iframe Viewport */}
                {projectUrl ? (
                  <iframe
                    src={projectUrl}
                    title={projectTitle}
                    className="w-full h-full border-0 bg-white"
                    loading="lazy"
                  />
                ) : projectImage ? (
                  <img src={projectImage} alt={projectTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/40 font-mono text-xs">
                    No preview URL configured
                  </div>
                )}
              </motion.div>
            </div>

            {/* Footer Toolbar */}
            <div className="mt-4 flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-3">
              <span className="font-mono">Viewport Mode: {device.toUpperCase()} ({getDeviceStyle().width})</span>
              {projectUrl && (
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="flex items-center gap-1.5 text-purple-300 font-bold hover:underline"
                >
                  Open in Full Window <ExternalLink size={13} />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
