'use client'

import React, { useState, useEffect } from 'react'

export default function GlobalSpotifyAudioPlayer() {
  const [embedUrl, setEmbedUrl] = useState(
    'https://open.spotify.com/embed/playlist/0vvRV2Fw8k78yF31oN4L4g?utm_source=generator&theme=0'
  )

  useEffect(() => {
    const handleUrlChange = (e: CustomEvent<string>) => {
      if (e.detail) {
        setEmbedUrl(e.detail)
      }
    }
    window.addEventListener('change-spotify-url' as any, handleUrlChange)
    return () => window.removeEventListener('change-spotify-url' as any, handleUrlChange)
  }, [])

  return (
    <div className="fixed bottom-0 right-0 h-1 w-1 opacity-0 pointer-events-none overflow-hidden z-[-9999]">
      <iframe
        src={embedUrl}
        width="100%"
        height="100"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        title="Global Spotify Background Player"
      />
    </div>
  )
}
