'use client'

import { useEffect, useRef, useState } from 'react'
import { VISITOR_PROFILE_EVENT, type VisitorProfile } from '@/lib/visitorProfile'

function getSessionId() {
  let id = sessionStorage.getItem('_sid')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('_sid', id)
  }
  return id
}

export function useVisitor() {
  const [liveViewers, setLiveViewers] = useState(1)
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const sid = getSessionId()
    let visitSent = sessionStorage.getItem('_visited') === '1'

    const visitorContext = () => ({
      sessionId: sid,
      page: window.location.pathname + window.location.hash,
      referrer: document.referrer || 'Direct',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language || navigator.languages?.[0] || '',
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    })

    const notifyVisit = (profile: VisitorProfile | null) => {
      if (visitSent) return
      visitSent = true
      sessionStorage.setItem('_visited', '1')

      void fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'visit', ...visitorContext(), ...(profile || {}) }),
      }).catch(() => {})
    }

    const identifyVisitor = (profile: VisitorProfile) => {
      void fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'identify', ...visitorContext(), ...profile }),
      }).catch(() => {})
    }

    const handleProfile = (event: Event) => {
      const profile = (event as CustomEvent<VisitorProfile | null>).detail
      if (!visitSent) notifyVisit(null)
      if (profile) identifyVisitor(profile)
    }

    window.addEventListener(VISITOR_PROFILE_EVENT, handleProfile)

    const anonymousTimer = visitSent
      ? null
      : window.setTimeout(() => notifyVisit(null), 15_000)

    // Heartbeat every 28s
    const heartbeat = async () => {
      try {
        const res = await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type:      'heartbeat',
            sessionId: sid,
            page:      window.location.pathname,
          }),
        })
        const data = await res.json()
        if (typeof data.viewers === 'number') setLiveViewers(data.viewers)
      } catch {}
    }

    heartbeat()
    const iv = setInterval(heartbeat, 28_000)

    const leave = () =>
      navigator.sendBeacon('/api/visitors', JSON.stringify({ type: 'leave', sessionId: sid }))

    window.addEventListener('beforeunload', leave)
    return () => {
      clearInterval(iv)
      if (anonymousTimer) window.clearTimeout(anonymousTimer)
      window.removeEventListener(VISITOR_PROFILE_EVENT, handleProfile)
      window.removeEventListener('beforeunload', leave)
    }
  }, [])

  return { liveViewers }
}
