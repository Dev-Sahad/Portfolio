'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/app/admin/Sidebar'
import { supabase } from '@/lib/supabase'
import {
  Save, Bell, BellOff, Eye, MapPin, Search, Monitor,
  Users, Link2, MessageSquare, TestTube, Check, X,
  Radio, Globe, Loader2, RefreshCcw, Clock, Chrome,
} from 'lucide-react'
import Swal from 'sweetalert2'

const DEFAULT_WEBHOOK = 'https://discord.com/api/webhooks/1491857287097094258/qNW1r7kPV2Ke3pleScHVWHaC7Mx_50H6zKsdZ_eKYdoSdi3AlZFO_WwBXe-WT9XIGpB_'

interface Settings {
  webhook_url: string
  notifications_enabled: boolean
  notify_on_visit: boolean
  notify_on_comment: boolean
  show_location: boolean
  show_map_link: boolean
  show_isp: boolean
  show_device: boolean
  show_browser: boolean
  show_referrer: boolean
  show_search_query: boolean
  show_screen: boolean
  show_language: boolean
  show_timezone: boolean
  show_visitor_name: boolean
  show_live_count: boolean
  spam_block_hours: number
  custom_footer: string
  custom_title: string
}

const DEFAULTS: Settings = {
  webhook_url: DEFAULT_WEBHOOK,
  notifications_enabled: true,
  notify_on_visit: true,
  notify_on_comment: true,
  show_location: true,
  show_map_link: true,
  show_isp: true,
  show_device: true,
  show_browser: true,
  show_referrer: true,
  show_search_query: true,
  show_screen: true,
  show_language: true,
  show_timezone: true,
  show_visitor_name: true,
  show_live_count: true,
  spam_block_hours: 6,
  custom_footer: 'sahad.is-a.dev  ·  Visitor Analytics',
  custom_title: '👨🏻‍💻  New Visitor',
}

// Live sessions from /api/visitors
interface Session { id: string; page: string; since: number; country: string; city: string }

export default function WebhookPage() {
  const router = useRouter()
  const [s, setS] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok'|'err'|null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [liveCount, setLiveCount] = useState(0)
  const [tab, setTab] = useState<'settings'|'live'>('settings')

  const set = (k: keyof Settings, v: any) => setS(prev => ({ ...prev, [k]: v }))

  // ── Load settings ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }

      const { data } = await supabase.from('webhook_settings').select('*').eq('id', 1).single()
      if (data) setS({ ...DEFAULTS, ...data })
      setLoading(false)
    }
    load()
  }, [router])

  // ── Live viewer polling ──────────────────────────────────────────
  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/visitors')
      const d   = await res.json()
      setLiveCount(d.viewers || 0)
      setSessions(d.sessions || [])
    } catch {}
  }, [])

  useEffect(() => {
    fetchLive()
    const iv = setInterval(fetchLive, 10_000)
    return () => clearInterval(iv)
  }, [fetchLive])

  // ── Save ─────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('webhook_settings').upsert([{ id: 1, ...s }])
    setSaving(false)
    if (!error) {
      Swal.fire({ title: 'Saved!', icon: 'success', timer: 1200, showConfirmButton: false, background: '#0f0f0f', color: '#fff' })
    } else {
      // Table may not exist yet — show SQL
      Swal.fire({
        title: 'Table missing',
        html: `<p style="color:#aaa;font-size:13px">Run this in Supabase SQL Editor first:</p>
<pre style="text-align:left;background:#111;padding:12px;border-radius:8px;font-size:11px;color:#88ff88;overflow:auto">
CREATE TABLE IF NOT EXISTS public.webhook_settings (
  id int PRIMARY KEY DEFAULT 1,
  webhook_url text,
  notifications_enabled boolean DEFAULT true,
  notify_on_visit boolean DEFAULT true,
  notify_on_comment boolean DEFAULT true,
  show_location boolean DEFAULT true,
  show_map_link boolean DEFAULT true,
  show_isp boolean DEFAULT true,
  show_device boolean DEFAULT true,
  show_browser boolean DEFAULT true,
  show_referrer boolean DEFAULT true,
  show_search_query boolean DEFAULT true,
  show_screen boolean DEFAULT true,
  show_language boolean DEFAULT true,
  show_timezone boolean DEFAULT true,
  show_visitor_name boolean DEFAULT true,
  show_live_count boolean DEFAULT true,
  spam_block_hours int DEFAULT 6,
  custom_footer text,
  custom_title text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_rw" ON public.webhook_settings
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
</pre>`,
        icon: 'error',
        background: '#0f0f0f',
        color: '#fff',
        confirmButtonColor: '#333',
      })
    }
  }

  // ── Test webhook ─────────────────────────────────────────────────
  const testWebhook = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(s.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🧪 Webhook Test',
            description: '<@853166408212807701> Your Discord webhook is connected to your portfolio! ✅',
            color: 0x00ff88,
            fields: [
              { name: '⏰ Time', value: new Date().toLocaleString(), inline: true },
              { name: '📍 From', value: 'Admin Panel Test', inline: true },
            ],
            footer: { text: 'portfolio · Webhook Test' },
            timestamp: new Date().toISOString(),
          }],
        }),
      })
      setTestResult(res.ok ? 'ok' : 'err')
    } catch {
      setTestResult('err')
    }
    setTesting(false)
    setTimeout(() => setTestResult(null), 4000)
  }

  // ── Toggle helper ────────────────────────────────────────────────
  const Toggle = ({ label, desc, field, icon: Icon }: { label: string; desc?: string; field: keyof Settings; icon?: any }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3">
        {Icon && <Icon size={15} className="text-white/30 mt-0.5 shrink-0" />}
        <div>
          <p className="text-sm text-white/80">{label}</p>
          {desc && <p className="text-xs text-white/30 mt-0.5">{desc}</p>}
        </div>
      </div>
      <button
        onClick={() => set(field, !s[field])}
        className={`shrink-0 w-11 h-6 rounded-full border transition-all duration-300 relative ${
          s[field] ? 'bg-white border-white' : 'bg-white/5 border-white/15'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-black transition-all duration-300 ${s[field] ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="lg:ml-[250px] pt-[95px] lg:pt-6 min-h-screen px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-[1000px] mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bell size={16} className="text-white/40" />
                <span className="text-xs text-white/40 uppercase tracking-widest">Admin</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Discord Webhook</h1>
              <p className="text-sm text-white/40 mt-1">Control everything sent to your Discord</p>
            </div>
            <button onClick={save} disabled={saving || loading}
              className="h-11 px-5 rounded-2xl bg-white text-black font-medium text-sm flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 w-full sm:w-auto justify-center">
              <Save size={15} />
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
            {(['settings', 'live'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition capitalize ${tab === t ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
                {t === 'live' ? '🔴 Live Viewers' : '⚙️ Settings'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-white/30 text-sm py-12 justify-center">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </div>
          ) : tab === 'live' ? (
            /* ── LIVE DASHBOARD ─────────────────────────────────── */
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  </div>
                  <span className="text-xl font-bold">{liveCount}</span>
                  <span className="text-white/40 text-sm">live viewer{liveCount !== 1 ? 's' : ''} right now</span>
                </div>
                <button onClick={fetchLive} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-xs">
                  <RefreshCcw size={12} /> Refresh
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 h-48 flex flex-col items-center justify-center gap-2 text-white/20">
                  <Eye size={28} />
                  <p className="text-sm">No one browsing right now</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {sessions.map(sv => (
                    <div key={sv.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-white/50">{sv.id}</div>
                        <div>
                          <p className="text-sm font-medium">{sv.city && sv.city !== '—' ? `${sv.city}, ${sv.country}` : sv.country || 'Unknown'}</p>
                          <p className="text-xs text-white/30">{sv.page}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/25">
                        <Clock size={11} />
                        {Math.round((Date.now() - sv.since) / 60000)}m ago
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── SETTINGS ───────────────────────────────────────── */
            <div className="grid gap-5">

              {/* WEBHOOK URL */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Link2 size={15} className="text-white/40" /> Webhook URL
                </h2>
                <input
                  value={s.webhook_url}
                  onChange={e => set('webhook_url', e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-2xl text-sm outline-none focus:border-white/25 transition font-mono text-xs"
                />
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={testWebhook} disabled={testing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-xs">
                    {testing ? <Loader2 size={12} className="animate-spin" /> : <TestTube size={12} />}
                    Send Test
                  </button>
                  {testResult === 'ok'  && <span className="flex items-center gap-1 text-xs text-emerald-400"><Check size={12} /> Webhook works!</span>}
                  {testResult === 'err' && <span className="flex items-center gap-1 text-xs text-red-400"><X size={12} /> Failed — check URL</span>}
                </div>
              </div>

              {/* MASTER SWITCHES */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Bell size={15} className="text-white/40" /> Notifications
                </h2>
                <Toggle label="Enable all notifications" desc="Master switch — disables everything when off" field="notifications_enabled" icon={Bell} />
                <Toggle label="Notify on portfolio visit" desc="Fires when someone opens your portfolio" field="notify_on_visit" icon={Eye} />
                <Toggle label="Notify on new comment" desc="Fires when someone posts in the comments section" field="notify_on_comment" icon={MessageSquare} />
              </div>

              {/* SPAM CONTROL */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BellOff size={15} className="text-white/40" /> Anti-Spam
                </h2>
                <p className="text-xs text-white/30 mb-4">Same IP will only trigger one Discord notification per X hours. Bots and crawlers are always silently skipped.</p>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Block same IP for (hours): <strong className="text-white/70">{s.spam_block_hours}h</strong></label>
                  <input type="range" min={1} max={24} step={1} value={s.spam_block_hours}
                    onChange={e => set('spam_block_hours', parseInt(e.target.value))}
                    className="w-full accent-white" />
                  <div className="flex justify-between text-[10px] text-white/20 mt-1">
                    <span>1h (verbose)</span><span>12h</span><span>24h (quiet)</span>
                  </div>
                </div>
              </div>

              {/* VISITOR DETAILS */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Globe size={15} className="text-white/40" /> Visitor Details in Embed
                </h2>
                <Toggle label="Visitor Name"       desc="Shown if they've commented before" field="show_visitor_name"  icon={Users}       />
                <Toggle label="Location"           desc="City, Region, Country from IP"     field="show_location"     icon={MapPin}      />
                <Toggle label="Map Link"           desc="Clickable Google Maps link"        field="show_map_link"     icon={MapPin}      />
                <Toggle label="ISP / Organization" desc="Their internet provider"           field="show_isp"          icon={Globe}       />
                <Toggle label="Device Type"        desc="Desktop / Mobile / Tablet"         field="show_device"       icon={Monitor}     />
                <Toggle label="Browser & OS"       desc="Chrome on Windows, etc"            field="show_browser"      icon={Chrome}      />
                <Toggle label="Referrer / Source"  desc="Where they came from"              field="show_referrer"     icon={Link2}       />
                <Toggle label="Search Query"       desc="What they Googled to find you"     field="show_search_query" icon={Search}      />
                <Toggle label="Screen Resolution"  desc="Their screen dimensions"           field="show_screen"       icon={Monitor}     />
                <Toggle label="Language"           desc="Browser language setting"          field="show_language"     icon={Globe}       />
                <Toggle label="Timezone"           desc="Their local timezone"              field="show_timezone"     icon={Clock}       />
                <Toggle label="Live Viewer Count"  desc="How many people are on site now"   field="show_live_count"   icon={Radio}       />
              </div>

              {/* CUSTOM TEXT */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare size={15} className="text-white/40" /> Custom Text
                </h2>
                <div className="mb-4">
                  <label className="text-xs text-white/40 mb-1.5 block">Embed Title</label>
                  <input value={s.custom_title} onChange={e => set('custom_title', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-2xl text-sm outline-none focus:border-white/25 transition" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Embed Footer</label>
                  <input value={s.custom_footer} onChange={e => set('custom_footer', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-2xl text-sm outline-none focus:border-white/25 transition" />
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  )
}
