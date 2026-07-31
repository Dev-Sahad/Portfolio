'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Share2, QrCode } from 'lucide-react'
import { FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  url?: string
  title?: string
}

export default function ShareModal({
  isOpen,
  onClose,
  url,
  title = 'Muhammad Sahad — Full Stack Developer & UI/UX Specialist',
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://sahad.is-a.dev')

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
    {
      name: 'X (Twitter)',
      icon: FaTwitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-sky-500/20 hover:text-sky-300 border-sky-500/20',
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-600/20 hover:text-blue-300 border-blue-600/20',
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-emerald-500/20 hover:text-emerald-300 border-emerald-500/20',
    },
  ]

  // Dynamic QR Code SVG renderer using Google Chart API / QR generator image fallback
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}&bgcolor=000000&color=ffffff`

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0f0f12] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-white"
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/15 hover:text-white transition"
              aria-label="Close share modal"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                <Share2 size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Share Portfolio</h3>
                <p className="text-xs text-white/40">Scan QR code or share live link</p>
              </div>
            </div>

            {/* QR CODE SECTION */}
            <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-xl overflow-hidden bg-white p-2 shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="Portfolio QR Code"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-white/50 font-mono">
                <QrCode size={13} />
                <span>Scan with phone camera</span>
              </div>
            </div>

            {/* COPY LINK BAR */}
            <div className="mb-5">
              <label className="text-xs font-mono uppercase tracking-wider text-white/40 block mb-2">Portfolio Link</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 pl-4">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-transparent text-xs text-white/80 font-mono outline-none truncate"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* SOCIAL SHARE BUTTONS */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-white/40 block mb-2">Quick Share</label>
              <div className="grid grid-cols-3 gap-2.5">
                {shareLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs font-medium text-white/70 transition duration-200 ${link.color}`}
                    >
                      <Icon size={18} />
                      <span className="text-[11px]">{link.name}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
