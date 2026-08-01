'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import Sidebar from '@/app/admin/Sidebar'
import { supabase } from '@/lib/supabase'
import { defaultSiteSettings, SiteSettings, mergeSiteSettings } from '@/lib/siteSettings'

const fields: Array<{
  key: keyof SiteSettings
  label: string
  type?: 'input' | 'textarea' | 'boolean' | 'select'
  options?: Array<{ label: string; value: string }>
}> = [
  { key: 'owner_name', label: 'Owner Name' },
  { key: 'availability_text', label: 'Availability Text' },
  { key: 'hero_title_primary', label: 'Hero Title First Line' },
  { key: 'hero_title_secondary', label: 'Hero Title Second Line' },
  { key: 'hero_role', label: 'Hero Role' },
  { key: 'hero_description', label: 'Hero Description', type: 'textarea' },
  { key: 'about_eyebrow', label: 'About Eyebrow' },
  { key: 'about_title', label: 'About Title', type: 'textarea' },
  { key: 'about_description', label: 'About Description', type: 'textarea' },
  { key: 'about_quote', label: 'About Quote', type: 'textarea' },
  { key: 'cv_url', label: 'CV URL' },
  { key: 'github_url', label: 'Github URL' },
  { key: 'linkedin_url', label: 'LinkedIn URL' },
  { key: 'instagram_url', label: 'Instagram URL' },
  { key: 'youtube_url', label: 'YouTube URL' },
  { key: 'tiktok_url', label: 'TikTok URL' },
  { key: 'spotify_playlist_url', label: 'Spotify Playlist Embed URL' },
  { key: 'intro_music_url', label: 'Intro Screen Background Music URL' },
  { key: 'contact_heading', label: 'Contact Heading' },
  { key: 'contact_subheading', label: 'Contact Subheading', type: 'textarea' },
  { key: 'booking_url', label: 'Booking URL' },
  { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'boolean' },
  { key: 'maintenance_message', label: 'Maintenance Message', type: 'textarea' },
  { key: 'show_testimonials', label: 'Show Testimonials', type: 'boolean' },
  { key: 'assistant_enabled', label: 'Enable Portfolio Assistant', type: 'boolean' },
  {
    key: 'performance_mode',
    label: 'Animation Performance Mode',
    type: 'select',
    options: [
      { label: 'Automatic', value: 'auto' },
      { label: 'Full effects', value: 'full' },
      { label: 'Reduced effects', value: 'reduced' },
    ],
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/admin/login')
        return
      }

      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      setSettings(mergeSiteSettings(data))
      setLoading(false)
    }

    load()
  }, [router])

  const handleChange = (key: keyof SiteSettings, value: string | boolean) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    const response = await fetch('/api/admin/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_site_settings', settings }),
    })
    const result = await response.json().catch(() => ({}))

    setSaving(false)
    setMessage(response.ok ? 'Settings saved with revision history.' : result.error || 'Failed to save settings.')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="lg:ml-[250px] min-h-screen px-4 sm:px-6 lg:px-8 pt-[90px] lg:pt-6 pb-8">
        <div className="mx-auto max-w-[1100px] py-6 lg:py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Portfolio Settings</h1>
              <p className="mt-1 text-sm text-white/40">Control public content, social links, audio, maintenance, assistant, and animation behavior.</p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02] disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {message && (
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-white/40">Loading settings...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <label
                  key={field.key}
                  className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                >
                  <span className="mb-2 block text-sm text-white/45">{field.label}</span>
                  {field.type === 'boolean' ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(settings[field.key])}
                      onClick={() => handleChange(field.key, !Boolean(settings[field.key]))}
                      className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm transition ${Boolean(settings[field.key]) ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/[0.04] text-white/50'}`}
                    >
                      <span>{Boolean(settings[field.key]) ? 'Enabled' : 'Disabled'}</span>
                      <span className={`h-6 w-11 rounded-full p-1 transition ${Boolean(settings[field.key]) ? 'bg-emerald-400' : 'bg-white/15'}`}>
                        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${Boolean(settings[field.key]) ? 'translate-x-5' : ''}`} />
                      </span>
                    </button>
                  ) : field.type === 'select' ? (
                    <select
                      value={String(settings[field.key] ?? '')}
                      onChange={(event) => handleChange(field.key, event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-[#111] px-4 text-sm outline-none transition focus:border-white/30"
                    >
                      {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={String(settings[field.key] ?? '')}
                      onChange={(event) => handleChange(field.key, event.target.value)}
                      rows={field.key === 'hero_description' || field.key === 'about_description' ? 4 : 3}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition focus:border-white/30"
                    />
                  ) : (
                    <input
                      value={String(settings[field.key] ?? '')}
                      onChange={(event) => handleChange(field.key, event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none transition focus:border-white/30"
                    />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
