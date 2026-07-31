'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3, BookOpen, Download, History, Inbox, Loader2, MessageSquareQuote,
  RefreshCcw, Save, Settings2, Trash2,
} from 'lucide-react'
import Sidebar from '@/app/admin/Sidebar'
import type { BlogPost, ContactInboxMessage, ContentRevision, Testimonial } from '@/lib/growthTypes'

type Tab = 'overview' | 'testimonials' | 'posts' | 'inbox' | 'revisions' | 'settings'

const emptyTestimonial = {
  name: '', role: '', company: '', quote: '', avatar_url: '', source_url: '',
  rating: 5, approved: true, display_order: 100,
}
const emptyPost = {
  title: '', slug: '', excerpt: '', content: '', cover_url: '', tags: '',
  published: false,
}

const fieldClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-white/30'

export default function GrowthAdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [testimonialForm, setTestimonialForm] = useState<any>(emptyTestimonial)
  const [postForm, setPostForm] = useState<any>(emptyPost)
  const [settings, setSettings] = useState<any>({})

  const load = useCallback(async () => {
    setLoading(true)
    const response = await fetch('/api/admin/growth')
    if (response.status === 401 || response.status === 403) {
      router.replace('/admin/login')
      return
    }
    const payload = await response.json()
    setData(payload)
    setSettings({
      maintenance_mode: payload.settings?.maintenance_mode === true,
      maintenance_message: payload.settings?.maintenance_message || '',
      booking_url: payload.settings?.booking_url || '',
      show_testimonials: payload.settings?.show_testimonials !== false,
      assistant_enabled: payload.settings?.assistant_enabled !== false,
      performance_mode: payload.settings?.performance_mode || 'auto',
    })
    setLoading(false)
  }, [router])

  useEffect(() => { void load() }, [load])

  const action = async (payload: Record<string, unknown>) => {
    setSaving(true)
    setMessage('')
    const response = await fetch('/api/admin/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    setSaving(false)
    if (!response.ok) {
      setMessage(result.error || 'The change could not be saved.')
      return false
    }
    setMessage('Saved successfully.')
    await load()
    return true
  }

  const saveTestimonial = async (event: FormEvent) => {
    event.preventDefault()
    if (await action({ action: 'save_testimonial', item: testimonialForm })) setTestimonialForm(emptyTestimonial)
  }
  const savePost = async (event: FormEvent) => {
    event.preventDefault()
    if (await action({ action: 'save_post', item: postForm })) setPostForm(emptyPost)
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof BarChart3 }> = [
    { id: 'overview', label: 'Analytics', icon: BarChart3 },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'posts', label: 'Developer Notes', icon: BookOpen },
    { id: 'inbox', label: 'Contact Inbox', icon: Inbox },
    { id: 'revisions', label: 'Revision History', icon: History },
    { id: 'settings', label: 'Operations', icon: Settings2 },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="min-h-screen px-4 pb-10 pt-[90px] sm:px-6 lg:ml-[250px] lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-[1200px] py-6">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-white/35">Admin</p>
              <h1 className="mt-2 text-3xl font-bold">Growth & Content</h1>
              <p className="mt-2 text-sm text-white/40">Publishing, social proof, analytics, inbox, backups, and site controls.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
                <RefreshCcw size={14} /> Refresh
              </button>
              <a href="/api/admin/growth?export=1" className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black">
                <Download size={14} /> Export backup
              </a>
            </div>
          </header>

          <nav className="mb-7 flex gap-2 overflow-x-auto rounded-2xl border border-white/15 bg-white/[0.05] p-2 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" aria-label="Growth admin sections">
            {tabs.map((item) => {
              const Icon = item.icon
              const isActive = tab === item.id
              return (
                <button key={item.id} type="button" onClick={() => setTab(item.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/35 backdrop-blur-2xl shadow-[0_4px_20px_rgba(255,255,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.4)] font-semibold'
                      : 'text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}>
                  <Icon size={14} /> {item.label}
                </button>
              )
            })}
          </nav>

          {message ? <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65">{message}</div> : null}
          {loading || !data ? (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-white/35"><Loader2 size={16} className="animate-spin" /> Loading workspace…</div>
          ) : (
            <>
              {tab === 'overview' ? <AnalyticsPanel data={data.analytics} /> : null}
              {tab === 'testimonials' ? (
                <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                  <form onSubmit={saveTestimonial} className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <h2 className="font-semibold">{testimonialForm.id ? 'Edit testimonial' : 'Add testimonial'}</h2>
                    <div className="mt-4 grid gap-3">
                      <input className={fieldClass} placeholder="Name" value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} />
                      <input className={fieldClass} placeholder="Role" value={testimonialForm.role} onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })} />
                      <input className={fieldClass} placeholder="Company" value={testimonialForm.company} onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })} />
                      <textarea className={`${fieldClass} resize-none`} rows={5} placeholder="Recommendation" value={testimonialForm.quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })} />
                      <input className={fieldClass} placeholder="Source URL (optional)" value={testimonialForm.source_url} onChange={(e) => setTestimonialForm({ ...testimonialForm, source_url: e.target.value })} />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" min={1} max={5} className={fieldClass} value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })} />
                        <input type="number" className={fieldClass} value={testimonialForm.display_order} onChange={(e) => setTestimonialForm({ ...testimonialForm, display_order: Number(e.target.value) })} />
                      </div>
                      <label className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60">
                        <input type="checkbox" checked={testimonialForm.approved} onChange={(e) => setTestimonialForm({ ...testimonialForm, approved: e.target.checked })} /> Approved for public display
                      </label>
                      <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black disabled:opacity-50">
                        <Save size={14} /> Save testimonial
                      </button>
                    </div>
                  </form>
                  <div className="grid gap-3">
                    {data.testimonials.map((item: Testimonial) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-xs text-white/35">{[item.role, item.company].filter(Boolean).join(' · ')}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[10px] ${item.approved ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>{item.approved ? 'Public' : 'Draft'}</span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-white/55">“{item.quote}”</p>
                        <div className="mt-4 flex gap-2">
                          <button type="button" onClick={() => setTestimonialForm({ ...item })} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">Edit</button>
                          <button type="button" onClick={() => void action({ action: 'delete', entity: 'testimonial', id: item.id })} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {tab === 'posts' ? (
                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                  <form onSubmit={savePost} className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <h2 className="font-semibold">{postForm.id ? 'Edit developer note' : 'New developer note'}</h2>
                    <div className="mt-4 grid gap-3">
                      <input className={fieldClass} placeholder="Title" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
                      <input className={fieldClass} placeholder="Slug (generated from title if empty)" value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} />
                      <textarea className={`${fieldClass} resize-none`} rows={3} placeholder="Short excerpt" value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} />
                      <textarea className={`${fieldClass} resize-y`} rows={12} placeholder="Article content" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} />
                      <input className={fieldClass} placeholder="Tags separated by commas" value={Array.isArray(postForm.tags) ? postForm.tags.join(', ') : postForm.tags} onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })} />
                      <label className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60">
                        <input type="checkbox" checked={postForm.published} onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })} /> Publish immediately
                      </label>
                      <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black disabled:opacity-50"><Save size={14} /> Save note</button>
                    </div>
                  </form>
                  <div className="grid gap-3">
                    {data.posts.map((post: BlogPost) => (
                      <div key={post.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div><p className="font-semibold">{post.title}</p><p className="mt-1 text-xs text-white/30">/{post.slug}</p></div>
                          <span className={`rounded-full px-2 py-1 text-[10px] ${post.published ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-white/35'}`}>{post.published ? 'Published' : 'Draft'}</span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-white/45">{post.excerpt}</p>
                        <div className="mt-4 flex gap-2">
                          <button type="button" onClick={() => setPostForm({ ...post, tags: post.tags || [] })} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">Edit</button>
                          <button type="button" onClick={() => void action({ action: 'delete', entity: 'post', id: post.id })} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {tab === 'inbox' ? <InboxPanel messages={data.messages} onStatus={(id, status) => action({ action: 'message_status', id, status })} /> : null}
              {tab === 'revisions' ? <RevisionsPanel revisions={data.revisions} onRestore={(id) => action({ action: 'restore_revision', id })} /> : null}
              {tab === 'settings' ? (
                <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <h2 className="font-semibold">Operational controls</h2>
                  <div className="mt-5 grid gap-4">
                    <Toggle label="Maintenance mode" checked={settings.maintenance_mode} onChange={(value) => setSettings({ ...settings, maintenance_mode: value })} />
                    <textarea className={`${fieldClass} resize-none`} rows={3} value={settings.maintenance_message} onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })} placeholder="Maintenance message" />
                    <input className={fieldClass} value={settings.booking_url} onChange={(e) => setSettings({ ...settings, booking_url: e.target.value })} placeholder="Booking URL" />
                    <Toggle label="Show testimonials" checked={settings.show_testimonials} onChange={(value) => setSettings({ ...settings, show_testimonials: value })} />
                    <Toggle label="Enable portfolio assistant" checked={settings.assistant_enabled} onChange={(value) => setSettings({ ...settings, assistant_enabled: value })} />
                    <label><span className="mb-2 block text-xs text-white/40">Default visual-performance mode</span>
                      <select className={fieldClass} value={settings.performance_mode} onChange={(e) => setSettings({ ...settings, performance_mode: e.target.value })}>
                        <option value="auto">Automatic</option><option value="full">Full effects</option><option value="reduced">Reduced effects</option>
                      </select>
                    </label>
                    <button type="button" disabled={saving} onClick={() => void action({ action: 'save_settings', settings })}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black disabled:opacity-50"><Save size={14} /> Save operations</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function AnalyticsPanel({ data }: { data: any }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric label="Tracked interactions" value={data.total} />
        <Metric label="Last seven days" value={data.lastSevenDays} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><h2 className="font-semibold">Events</h2>
          <div className="mt-4 grid gap-3">{data.byType.map((row: any) => <div key={row.event_type} className="flex justify-between rounded-xl border border-white/5 px-4 py-3 text-sm"><span className="text-white/50">{row.event_type.replaceAll('_', ' ')}</span><strong>{row.count}</strong></div>)}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><h2 className="font-semibold">Popular projects</h2>
          <div className="mt-4 grid gap-3">{data.popularProjects.map((row: any) => <div key={row.entity_id} className="flex justify-between rounded-xl border border-white/5 px-4 py-3 text-sm"><span className="truncate text-white/50">{row.entity_id}</span><strong>{row.count}</strong></div>)}</div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><p className="text-3xl font-bold">{value}</p><p className="mt-2 text-sm text-white/35">{label}</p></div>
}

function InboxPanel({ messages, onStatus }: { messages: ContactInboxMessage[]; onStatus: (id: string, status: string) => Promise<boolean> }) {
  return <div className="grid gap-3">{messages.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">{item.name}</p><a href={`mailto:${item.email}`} className="text-xs text-white/35 hover:text-white">{item.email}</a></div>
      <select value={item.status} onChange={(e) => void onStatus(item.id, e.target.value)} className="rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-xs"><option value="unread">Unread</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select></div>
    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/55">{item.message}</p><time className="mt-4 block text-[11px] text-white/25">{new Date(item.created_at).toLocaleString()}</time>
  </article>)}</div>
}

function RevisionsPanel({ revisions, onRestore }: { revisions: ContentRevision[]; onRestore: (id: number) => Promise<boolean> }) {
  return <div className="grid gap-3">{revisions.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
    <div><p className="text-sm font-medium capitalize">{item.entity_type} · {item.action}</p><p className="mt-1 text-xs text-white/30">{item.entity_id} · {new Date(item.created_at).toLocaleString()}</p></div>
    {['post', 'testimonial'].includes(item.entity_type) ? <button type="button" onClick={() => void onRestore(item.id)} className="rounded-xl border border-white/10 px-4 py-2 text-xs hover:bg-white/5">Restore snapshot</button> : null}
  </div>)}</div>
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /></label>
}
