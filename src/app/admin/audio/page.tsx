'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Volume2, Save, RefreshCw, Radio, PlayCircle, Sparkles, Youtube, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminAudioPage() {
  const [introMusicUrl, setIntroMusicUrl] = useState('https://www.youtube.com/watch?v=LNUlNbmsDBk')
  const [spotifyUrl, setSpotifyUrl] = useState('https://open.spotify.com/embed/playlist/0vvRV2Fw8k78yF31oN4L4g')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('portfolio_settings').select('*').eq('id', 1).single()
      if (data) {
        if (data.intro_music_url) setIntroMusicUrl(data.intro_music_url)
        if (data.spotify_playlist_url) setSpotifyUrl(data.spotify_playlist_url)
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

    try {
      const { error } = await supabase.from('portfolio_settings').upsert({
        id: 1,
        intro_music_url: introMusicUrl.trim(),
        spotify_playlist_url: spotifyUrl.trim(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('✅ Audio settings updated successfully!')
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white p-2">
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
          <RefreshCw size={14} /> Reset
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
            <Youtube size={20} /> Intro Screen Background Music (YouTube / Direct MP3)
          </h2>
          <p className="text-xs text-white/60 font-mono">
            Song URL played during the 30-second website intro sequence. YouTube embed postMessage API controls volume & mute.
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
