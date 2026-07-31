'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award, ExternalLink, ShieldCheck, QrCode, CheckCircle2 } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface Certificate {
  id: string | number
  title: string
  issuer?: string
  issue_date?: string
  credential_url?: string
  image_url?: string
  description?: string
}

interface CertificateBadgeModalProps {
  isOpen: boolean
  onClose: () => void
  certificate: Certificate | null
}

export default function CertificateBadgeModal({
  isOpen,
  onClose,
  certificate,
}: CertificateBadgeModalProps) {
  const { playClick, playHover } = useAudio()

  if (!certificate) return null

  const issuerName = certificate.issuer || 'Official Credential'
  const certUrl = certificate.credential_url || 'https://sahad.is-a.dev'
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(certUrl)}`

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[#0e0f17]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    Verified Credential
                    <CheckCircle2 size={15} className="text-emerald-400 fill-emerald-400/20" />
                  </h3>
                  <p className="text-xs text-white/40">{issuerName}</p>
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

            {/* Certificate Image & Details */}
            <div className="space-y-4">
              {certificate.image_url && (
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-black">
                  <img
                    src={certificate.image_url}
                    alt={certificate.title}
                    className="w-full h-44 object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="text-lg font-bold text-white leading-snug">{certificate.title}</h4>
                <p className="text-xs text-amber-300 font-mono mt-1">Issued by: {issuerName}</p>
                {certificate.issue_date && (
                  <p className="text-[11px] text-white/40 font-mono mt-0.5">Date: {certificate.issue_date}</p>
                )}
              </div>

              {certificate.description && (
                <p className="text-xs leading-5 text-white/65 bg-white/5 p-3 rounded-xl border border-white/10">
                  {certificate.description}
                </p>
              )}

              {/* QR Verification Code */}
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                <img
                  src={qrApiUrl}
                  alt="Verification QR Code"
                  className="h-16 w-16 rounded-xl border border-white/20 bg-white p-1"
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode size={13} className="text-emerald-400" /> Live QR Verification
                  </p>
                  <p className="text-[11px] text-white/40">Scan QR code with smartphone to verify digital credential online</p>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <a
                href={certUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                onMouseEnter={playHover}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <ShieldCheck size={16} /> Verify Credential Certificate <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
