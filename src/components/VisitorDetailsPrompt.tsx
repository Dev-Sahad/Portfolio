'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MapPin, Phone, ShieldCheck, User, X } from 'lucide-react'
import { VISITOR_PROFILE_EVENT, type VisitorProfile } from '@/lib/visitorProfile'

type VisitorDetailsPromptProps = {
  enabled: boolean
}

type PreciseLocation = {
  latitude: number
  longitude: number
  accuracy: number
}

function getPreciseLocation() {
  return new Promise<PreciseLocation>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location sharing is not supported by this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      }),
      () => reject(new Error('Location permission was not granted. Uncheck precise location to continue.')),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    )
  })
}

export default function VisitorDetailsPrompt({ enabled }: VisitorDetailsPromptProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [shareLocation, setShareLocation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled || sessionStorage.getItem('_visitor_details_prompted')) return

    setName(localStorage.getItem('_visitor_name') || '')
    setPhone(localStorage.getItem('_visitor_phone') || '')
    const timer = window.setTimeout(() => setOpen(true), 900)
    return () => window.clearTimeout(timer)
  }, [enabled])

  const finish = (profile: VisitorProfile | null) => {
    sessionStorage.setItem('_visitor_details_prompted', '1')
    window.dispatchEvent(new CustomEvent<VisitorProfile | null>(VISITOR_PROFILE_EVENT, {
      detail: profile,
    }))
    setOpen(false)
  }

  const handleSkip = () => finish(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const visitorName = name.trim()
    const visitorPhone = phone.trim()
    if (!visitorName) return

    setSubmitting(true)
    setError('')

    let preciseLocation: PreciseLocation | null = null
    if (shareLocation) {
      try {
        preciseLocation = await getPreciseLocation()
      } catch (locationError) {
        setError(locationError instanceof Error ? locationError.message : 'Unable to share location.')
        setSubmitting(false)
        return
      }
    }

    localStorage.setItem('_visitor_name', visitorName)
    if (visitorPhone) localStorage.setItem('_visitor_phone', visitorPhone)
    else localStorage.removeItem('_visitor_phone')

    finish({
      visitorName,
      phone: visitorPhone || null,
      locationConsent: Boolean(preciseLocation),
      latitude: preciseLocation?.latitude ?? null,
      longitude: preciseLocation?.longitude ?? null,
      locationAccuracy: preciseLocation?.accuracy ?? null,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="visitor-details-title"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[9000] ml-auto max-w-md rounded-3xl border border-white/15 bg-[#0b0b0b]/95 p-5 text-white shadow-2xl backdrop-blur-xl sm:bottom-6 sm:right-6 sm:left-auto"
        >
          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            aria-label="Skip visitor details"
            className="absolute right-4 top-4 rounded-full p-2 text-white/40 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={16} />
          </button>

          <div className="mb-4 pr-10">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
              <ShieldCheck size={14} /> Optional visitor details
            </div>
            <h2 id="visitor-details-title" className="text-xl font-semibold">Say hello</h2>
            <p className="mt-1 text-sm leading-5 text-white/45">
              Share your name with the portfolio owner. Phone and precise location are optional.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs text-white/45">Name</span>
              <span className="relative block">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  autoComplete="name"
                  required
                  placeholder="Your name"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-3 text-sm outline-none transition focus:border-white/30"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-white/45">Phone (optional)</span>
              <span className="relative block">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  maxLength={32}
                  autoComplete="tel"
                  placeholder="+971 ..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-3 text-sm outline-none transition focus:border-white/30"
                />
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <input
                type="checkbox"
                checked={shareLocation}
                onChange={(event) => setShareLocation(event.target.checked)}
                className="mt-1 accent-white"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin size={14} /> Share precise location
                </span>
                <span className="mt-0.5 block text-xs leading-4 text-white/35">
                  Your browser will request permission. Coordinates, accuracy, and a private map link are sent to the owner.
                </span>
              </span>
            </label>

            {error && <p role="alert" className="text-xs text-red-300">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSkip}
                disabled={submitting}
                className="h-11 flex-1 rounded-xl border border-white/10 text-sm text-white/55 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Sharing...' : 'Share details'}
              </button>
            </div>
          </form>

          <p className="mt-3 text-[11px] leading-4 text-white/25">
            Details are sent privately through the portfolio notification webhook and are never requested without your action.
          </p>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
