'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Volume2, Save, RefreshCw, Radio, PlayCircle, Sparkles, Youtube, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminAudioPage() {
  const [introMusicUrl, setIntroMusicUrl] = useState('https://youtu.be/JCzJu2ZXSRw?si=82scZffeqbuwFZeO')
  const [spotifyUrl, setSpotifyUrl] = useState('https://open.spotify.com/embed/playlist/0vvRV2Fw8k78yF31oN4L4g')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchSettings = async () => {
    try {
      // Query portfolio_settings first
      const { data: pData } = await supabase.from('portfolio_settings').select('*').eq('id', 1).maybeSingle()
      if (pData) {
        if (pData.intro_music_url) setIntroMusicUrl(pData.intro_music_url)
        if (pData.spotify_playlist_url) setSpotifyUrl(pData.spotify_playlist_url)
        return
      }

      // Fallback query site_settings
      const { data: sData } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      if (sData) {
        if (sData.intro_music_url) setIntroMusicUrl(sData.intro_music_url)
        if (sData.spotify_playlist_url) setSpotifyUrl(sData.spotify_playlist_url)
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
    const cleanSpotify = spotifyUrl.trim()

    try {
      // 1. Update portfolio_settings table
      await supabase.from('portfolio_settings').upsert({
        id: 1,
        intro_music_url: cleanIntro,
        spotify_playlist_url: cleanSpotify,
        updated_at: new Date().toISOString(),
      })

      // 2. Update site_settings table
      await supabase.from('site_settings').upsert({
        id: 1,
        intro_music_url: cleanIntro,
        spotify_playlist_url: cleanSpotify,
        updated_at: new Date().toISOString(),
      })

      // 3. Store locally in localStorage for instantaneous client response
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolio_intro_music_url', cleanIntro)
        localStorage.setItem('portfolio_spotify_url', cleanSpotify)
      }

      setMessage('✅ Audio settings updated successfully across all database tables & live sessions!')
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
