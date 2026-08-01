'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Volume2, Save, RefreshCw, Radio, PlayCircle, Sparkles, Youtube, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { DEFAULT_SPOTIFY_URL, normalizeSpotifyEmbedUrl } from '@/lib/spotify'

export default function AdminAudioPage() {
  const [introMusicUrl, setIntroMusicUrl] = useState('https://youtu.be/JCzJu2ZXSRw?si=82scZffeqbuwFZeO')
  const [spotifyUrl, setSpotifyUrl] = useState(DEFAULT_SPOTIFY_URL)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchSettings = async () => {
    try {
      const { data: sData, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      if (error) throw error
      if (sData) {
        if (sData.intro_music_url) setIntroMusicUrl(sData.intro_music_url)
        setSpotifyUrl(normalizeSpotifyEmbedUrl(sData.spotify_playlist_url) || DEFAULT_SPOTIFY_URL)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const cleanIntro = introMusicUrl.trim()
    const cleanSpotify = normalizeSpotifyEmbedUrl(spotifyUrl)

    if (!cleanSpotify) {
      setSaving(false)
      setMessage('Error: enter a valid open.spotify.com track, album, episode, or playlist URL.')
      return
    }

    try {
      const response = await fetch('/api/admin/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_site_settings',
          settings: { intro_music_url: cleanIntro, spotify_playlist_url: cleanSpotify },
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to save audio settings.')
      setSpotifyUrl(cleanSpotify)
      setMessage('✅ Audio settings saved. The public portfolio will use this Spotify source.')
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white p-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <Music className="text-emerald-400" size={28} /> Global Music & Audio Engine Control
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-1">
            Configure Intro screen YouTube music links, background Spotify playlist embeds, and global audio settings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition"
        >
          <RefreshCw size={14} /> Refresh Settings
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-mono text-emerald-300">
          {message}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Intro YouTube Song */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-4"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 text-red-400">
            <Youtube size={20} /> Intro Screen Background Music (YouTube / Direct Link)
          </h2>
          <p className="text-xs text-white/60 font-mono">
            YouTube Video or Short link played during the intro sequence. (e.g., https://youtu.be/JCzJu2ZXSRw?si=82scZffeqbuwFZeO)
          </p>

          <input
            type="text"
            required
            value={introMusicUrl}
            onChange={(e) => setIntroMusicUrl(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-mono text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none"
          />
        </motion.div>

        {/* Spotify Playlist Embed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-4"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
            <Radio size={20} /> Continuous Spotify Background Player
          </h2>
          <p className="text-xs text-white/60 font-mono">
            Spotify playlist embed URL rendered permanently at root app level to prevent music from stopping when closing modal tabs.
          </p>

          <input
            type="text"
            required
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-mono text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none"
          />
        </motion.div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3.5 text-xs font-extrabold text-white shadow-xl hover:brightness-110 transition w-full sm:w-auto"
        >
          <Save size={16} /> {saving ? 'Saving Audio Settings...' : 'Save Global Audio Configuration'}
        </button>
      </form>
    </div>
  )
}
