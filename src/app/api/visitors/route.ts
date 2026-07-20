import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// ── In-memory stores (reset on cold start — fine for Vercel) ─────────
const viewers  = new Map<string, { ts: number; page: string; ua: string; country: string; city: string }>()
const spamGuard = new Map<string, number>() // ip → last notified timestamp

const IDLE_MS        = 3  * 60 * 1000  // 3 min without heartbeat = gone
const SPAM_BLOCK_MS  = 6  * 60 * 60 * 1000  // same IP only notified once per 6 hours
const BOT_PATTERNS   = /bot|crawler|spider|headless|lighthouse|pingdom|uptimerobot|gtmetrix|facebook|twitter|slack|discord|whatsapp|telegram|preview|prefetch|curl|wget|python|java|ruby|go-http|okhttp|axios|node-fetch/i

function purgeIdle() {
  const cutoff = Date.now() - IDLE_MS
  for (const [id, v] of viewers) if (v.ts < cutoff) viewers.delete(id)
}

// ── Free geo lookup ──────────────────────────────────────────────────
async function getGeo(ip: string) {
  const blank = { country: '—', countryCode: '', city: '—', region: '—', org: '—', lat: 0, lon: 0, timezone: '—', isp: '—' }
  if (!ip || ip === 'Unknown' || ip.startsWith('127') || ip.startsWith('::1') || ip === '::ffff:127.0.0.1') {
    return { ...blank, country: 'Local/Dev', city: 'Localhost' }
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp,org,timezone`,
      { signal: AbortSignal.timeout(3000) }
    )
    const d = await res.json()
    if (d.status === 'success') {
      return {
        country: d.country || '—', countryCode: d.countryCode || '',
        city: d.city || '—', region: d.regionName || '—',
        org: d.org || d.isp || '—', isp: d.isp || '—',
        lat: d.lat || 0, lon: d.lon || 0, timezone: d.timezone || '—',
      }
    }
  } catch {}
  return blank
}

// ── Parse user agent → browser, OS, device, search engine ───────────
function parseUA(ua: string) {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: '🖥️ Desktop', engine: null, isBot: false }

  const isBot = BOT_PATTERNS.test(ua)

  const mobile  = /mobile|android|iphone/i.test(ua) && !/ipad/i.test(ua)
  const tablet  = /ipad|tablet/i.test(ua)

  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /OPR\//.test(ua) ? 'Opera' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /SamsungBrowser/.test(ua) ? 'Samsung Browser' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Safari\//.test(ua) ? 'Safari' : 'Unknown'

  const os =
    /Windows NT 10/.test(ua) ? 'Windows 10/11' :
    /Windows NT 6/.test(ua)  ? 'Windows 7/8' :
    /Windows/.test(ua)       ? 'Windows' :
    /Mac OS X/.test(ua)      ? 'macOS' :
    /Android/.test(ua)       ? 'Android' :
    /iPhone|iPad/.test(ua)   ? 'iOS' :
    /Linux/.test(ua)         ? 'Linux' : 'Unknown'

  const device = tablet ? '📟 Tablet' : mobile ? '📱 Mobile' : '🖥️ Desktop'

  return { browser, os, device, engine: null, isBot }
}

// ── Detect referrer search engine / social ───────────────────────────
function parseReferrer(ref: string) {
  if (!ref || ref === 'Direct') return { source: 'Direct / None', searchQuery: null, emoji: '🔗' }
  try {
    const url = new URL(ref)
    const host = url.hostname.toLowerCase()
    const q = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('p') || null

    if (host.includes('google'))     return { source: `Google`, searchQuery: q, emoji: '🔍' }
    if (host.includes('bing'))       return { source: `Bing`, searchQuery: q, emoji: '🔍' }
    if (host.includes('yahoo'))      return { source: `Yahoo`, searchQuery: q, emoji: '🔍' }
    if (host.includes('duckduckgo')) return { source: `DuckDuckGo`, searchQuery: q, emoji: '🦆' }
    if (host.includes('linkedin'))   return { source: `LinkedIn`, searchQuery: null, emoji: '💼' }
    if (host.includes('github'))     return { source: `GitHub`, searchQuery: null, emoji: '🐙' }
    if (host.includes('twitter') || host.includes('t.co')) return { source: `Twitter/X`, searchQuery: null, emoji: '🐦' }
    if (host.includes('instagram'))  return { source: `Instagram`, searchQuery: null, emoji: '📸' }
    if (host.includes('facebook'))   return { source: `Facebook`, searchQuery: null, emoji: '👥' }
    if (host.includes('reddit'))     return { source: `Reddit`, searchQuery: null, emoji: '🤖' }
    if (host.includes('youtube'))    return { source: `YouTube`, searchQuery: null, emoji: '▶️' }
    if (host.includes('whatsapp'))   return { source: `WhatsApp`, searchQuery: null, emoji: '💬' }
    if (host.includes('telegram'))   return { source: `Telegram`, searchQuery: null, emoji: '✈️' }

    return { source: url.hostname, searchQuery: null, emoji: '🌐' }
  } catch {
    return { source: ref.slice(0, 60), searchQuery: null, emoji: '🔗' }
  }
}

// ── Get webhook settings from Supabase ──────────────────────────────
async function getWebhookSettings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  try {
    const db = createClient(url, key, { auth: { persistSession: false } })
    const { data } = await db.from('webhook_settings').select('*').eq('id', 1).single()
    return data
  } catch { return null }
}

// ── Send to Discord ──────────────────────────────────────────────────
async function sendDiscord(webhookUrl: string, payload: object) {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch { return false }
}

// ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { type, sessionId, page, referrer, timezone, screenWidth, screenHeight, language, visitorName } = body

    // ── HEARTBEAT ──────────────────────────────────────────────────
    if (type === 'heartbeat' && sessionId) {
      const existing = viewers.get(sessionId)
      viewers.set(sessionId, {
        ts: Date.now(),
        page: page || '/',
        ua: existing?.ua || '',
        country: existing?.country || '—',
        city: existing?.city || '—',
      })
      purgeIdle()
      return NextResponse.json({ viewers: viewers.size })
    }

    // ── LEAVE ──────────────────────────────────────────────────────
    if (type === 'leave' && sessionId) {
      viewers.delete(sessionId)
      return NextResponse.json({ ok: true })
    }

    // ── VISIT ──────────────────────────────────────────────────────
    if (type === 'visit') {
      const ip =
        req.headers.get('x-real-ip') ||
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'Unknown'

      const ua = req.headers.get('user-agent') || ''
      const { browser, os, device, isBot } = parseUA(ua)

      // ── Anti-spam: skip bots ───────────────────────────────────
      if (isBot) return NextResponse.json({ ok: true, skipped: 'bot' })

      // ── Anti-spam: rate limit same IP ─────────────────────────
      const lastSeen = spamGuard.get(ip) || 0
      const isSpam   = Date.now() - lastSeen < SPAM_BLOCK_MS
      if (isSpam) {
        // Still track heartbeat but don't notify Discord
        viewers.set(sessionId || ip, { ts: Date.now(), page: page || '/', ua, country: '—', city: '—' })
        return NextResponse.json({ ok: true, skipped: 'rate_limited' })
      }
      spamGuard.set(ip, Date.now())

      // ── Geo lookup ────────────────────────────────────────────
      const geo = await getGeo(ip)

      // ── Track viewer ─────────────────────────────────────────
      if (sessionId) {
        viewers.set(sessionId, { ts: Date.now(), page: page || '/', ua, country: geo.country, city: geo.city })
        purgeIdle()
      }

      const ref = parseReferrer(referrer)
      const settings = await getWebhookSettings()
      const webhookUrl = settings?.webhook_url || process.env.DISCORD_WEBHOOK_URL

      // Skip if notifications are disabled
      if (settings?.notifications_enabled === false) {
        return NextResponse.json({ ok: true, skipped: 'notifications_disabled' })
      }

      const mapLink = geo.lat && geo.lon
        ? `[📍 Open Map](https://www.google.com/maps?q=${geo.lat},${geo.lon})`
        : null

      const now = new Date()
      const timeStr = now.toLocaleString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        day: '2-digit', month: 'short', year: 'numeric',
        timeZone: 'Asia/Dubai',
      }) + ' (Dubai)'

      const currentViewers = viewers.size

      const embed: any = {
        author: {
          name: '👁️  New Portfolio Visitor',
          url: 'https://portfolio-v1-eta-nine.vercel.app',
        },
        color: 0x00e5ff,
        fields: [],
        footer: { text: `portfolio-v1  ·  ${ip}  ·  ${timeStr}` },
        timestamp: new Date().toISOString(),
      }

      // ── Visitor identity ─────────────────────────────────────
      embed.fields.push(
        { name: '👤 Visitor Name', value: visitorName ? `**${visitorName}**` : '*(anonymous)*', inline: true },
        { name: '🌐 Browser', value: `${browser} on ${os}`, inline: true },
        { name: device === '📱 Mobile' ? '📱 Device' : '🖥️ Device', value: device, inline: true },
      )

      // ── Location ─────────────────────────────────────────────
      const locationVal = [geo.city, geo.region, geo.country].filter(s => s && s !== '—').join(', ') || '—'
      embed.fields.push(
        { name: '📍 Location', value: locationVal, inline: true },
        { name: '🏢 ISP / Org', value: geo.org || '—', inline: true },
        { name: '🕐 Time', value: timeStr, inline: true },
      )

      // ── Map link ─────────────────────────────────────────────
      if (mapLink) embed.fields.push({ name: '🗺️ Map', value: mapLink, inline: true })

      // ── Referrer / source ─────────────────────────────────────
      embed.fields.push(
        { name: `${ref.emoji} Source`, value: ref.source, inline: true },
        { name: '📄 Page', value: page || '/', inline: true },
      )

      // ── Search query if came from search engine ───────────────
      if (ref.searchQuery) {
        embed.fields.push({ name: '🔍 Search Query', value: `"${ref.searchQuery}"`, inline: false })
      }

      // ── Screen & language ─────────────────────────────────────
      if (screenWidth && screenHeight) {
        embed.fields.push({ name: '📺 Screen', value: `${screenWidth}×${screenHeight}`, inline: true })
      }
      if (language) embed.fields.push({ name: '🗣️ Language', value: language, inline: true })
      if (timezone) embed.fields.push({ name: '🌏 Timezone', value: timezone, inline: true })

      // ── Live viewers ──────────────────────────────────────────
      embed.fields.push({
        name: '👥 Live Now',
        value: `**${currentViewers}** viewer${currentViewers !== 1 ? 's' : ''} on your portfolio`,
        inline: false,
      })

      if (webhookUrl) {
        await sendDiscord(webhookUrl, { embeds: [embed] })
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ── GET — live dashboard data ────────────────────────────────────────
export async function GET() {
  purgeIdle()
  return NextResponse.json({
    viewers: viewers.size,
    sessions: Array.from(viewers.entries()).map(([id, v]) => ({
      id:      id.slice(0, 8),
      page:    v.page,
      since:   v.ts,
      country: v.country,
      city:    v.city,
    })),
  })
}
