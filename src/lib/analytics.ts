export function trackEvent(
  eventType: string,
  options: { entityId?: string; metadata?: Record<string, unknown>; path?: string } = {},
) {
  if (typeof window === 'undefined') return
  const payload = JSON.stringify({
    eventType,
    entityId: options.entityId,
    metadata: options.metadata,
    path: options.path || `${window.location.pathname}${window.location.hash}`,
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }))
    return
  }
  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  })
}
