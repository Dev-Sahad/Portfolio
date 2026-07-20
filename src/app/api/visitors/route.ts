import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/adminAccess'

export const dynamic = 'force-dynamic'

type ViewerSession = {
  ts: number
  since: number
  page: string
  ua: string
  country: string
  city: string
  name: string | null
  phone: string | null
  latitude: number | null
  longitude: number | null
  accuracy: number | null
}

type PreciseLocation = {
  latitude: number
  longitude: number
  accuracy: number | null
}

type WebhookSettings = {
  webhook_url?: string | null
  notifications_enabled?: boolean | null
  notify_on_visit?: boolean | null
  show_location?: boolean | null
  show_map_link?: boolean | null
  show_isp?: boolean | null
  show_device?: boolean | null
  show_browser?: boolean | null
  show_referrer?: boolean | null
  show_search_query?: boolean | null
  show_screen?: boolean | null
  show_language?: boolean | null
  show_timezone?: boolean | null
  show_visitor_name?: boolean | null
  show_live_count?: boolean | null
  spam_block_hours?: number | null
  custom_footer?: string | null
  custom_title?: string | null
}

const viewers = new Map<string, ViewerSession>()
const spamGuard = new Map<string, number>()

const IDLE_MS = 3 * 60 * 1000
const DEFAULT_SPAM_BLOCK_HOURS = 6
const BOT_PATTERNS = /bot|crawler|spider|headless|lighthouse|pingdom|uptimerobot|gtmetrix|facebook|twitter|slack|discord|whatsapp|telegram|preview|prefetch|curl|wget|python|java|ruby|go-http|okhttp|axios|node-fetch/i

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function discordText(value: string) {
  return value
    .replace(/@/g, '@\u200b')
    .replace(/([\\`*_{}\[\]()#+.!|>~-])/g, '\\$1')
}

function purgeIdle() {
  const cutoff = Date.now() - IDLE_MS
  for (const [id, viewer] of viewers) {
    if (viewer.ts < cutoff) viewers.delete(id)
  }
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'Unknown'
  )
}

function getPreciseLocation(body: Record<string, unknown>): PreciseLocation | null {
  if (body.locationConsent !== true) return null

  const latitude = Number(body.latitude)
  const longitude = Number(body.longitude)
  const accuracyValue = Number(body.locationAccuracy)
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) return null

  return {
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracyValue) && accuracyValue >= 0
      ? Math.min(accuracyValue, 100_000)
      : null,
  }
}

async function getGeo(ip: string) {
  const blank = {
    country: '—', countryCode: '', city: '—', region: '—', org: '—',
    lat: 0, lon: 0, timezone: '—', isp: '—',
  }
  if (
    !ip ||
    ip === 'Unknown' ||
    ip.startsWith('127') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('::1') ||
    ip === '::ffff:127.0.0.1'
  ) {
    return { ...blank, country: 'Local/Dev', city: 'Localhost' }
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,lat,lon,isp,org,timezone`,
      { signal: AbortSignal.timeout(3000) },
    )
    const data = await response.json()
    if (data.status === 'success') {
      return {
        country: cleanText(data.country, 80) || '—',
        countryCode: cleanText(data.countryCode, 4),
        city: cleanText(data.city, 80) || '—',
        region: cleanText(data.regionName, 80) || '—',
        org: cleanText(data.org || data.isp, 120) || '—',
        isp: cleanText(data.isp, 120) || '—',
        lat: Number(data.lat) || 0,
        lon: Number(data.lon) || 0,
        timezone: cleanText(data.timezone, 80) || '—',
      }
    }
  } catch {}

  return blank
}

function parseUserAgent(userAgent: string) {
  if (!userAgent) {
    return { browser: 'Unknown', os: 'Unknown', device: 'Desktop', isBot: false }
  }

  const isBot = BOT_PATTERNS.test(userAgent)
  const mobile = /mobile|android|iphone/i.test(userAgent) && !/ipad/i.test(userAgent)
  const tablet = /ipad|tablet/i.test(userAgent)

  const browser =
    /Edg\//.test(userAgent) ? 'Edge' :
    /OPR\//.test(userAgent) ? 'Opera' :
    /Firefox\//.test(userAgent) ? 'Firefox' :
    /SamsungBrowser/.test(userAgent) ? 'Samsung Browser' :
    /Chrome\//.test(userAgent) ? 'Chrome' :
    /Safari\//.test(userAgent) ? 'Safari' : 'Unknown'

  const os =
    /Windows NT 10/.test(userAgent) ? 'Windows 10/11' :
    /Windows NT 6/.test(userAgent) ? 'Windows 7/8' :
    /Windows/.test(userAgent) ? 'Windows' :
    /Mac OS X/.test(userAgent) ? 'macOS' :
    /Android/.test(userAgent) ? 'Android' :
    /iPhone|iPad/.test(userAgent) ? 'iOS' :
    /Linux/.test(userAgent) ? 'Linux' : 'Unknown'

  return {
    browser,
    os,
    device: tablet ? 'Tablet' : mobile ? 'Mobile' : 'Desktop',
    isBot,
  }
}

function parseReferrer(referrer: string) {
  if (!referrer || referrer === 'Direct') {
    return { source: 'Direct / None', searchQuery: null as string | null }
  }

  try {
    const url = new URL(referrer)
    const host = url.hostname.toLowerCase()
    const query = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('p')

    if (host.includes('google')) return { source: 'Google', searchQuery: query }
    if (host.includes('bing')) return { source: 'Bing', searchQuery: query }
    if (host.includes('yahoo')) return { source: 'Yahoo', searchQuery: query }
    if (host.includes('duckduckgo')) return { source: 'DuckDuckGo', searchQuery: query }
    if (host.includes('linkedin')) return { source: 'LinkedIn', searchQuery: null }
    if (host.includes('github')) return { source: 'GitHub', searchQuery: null }
    if (host.includes('twitter') || host.includes('t.co')) return { source: 'Twitter/X', searchQuery: null }
    if (host.includes('instagram')) return { source: 'Instagram', searchQuery: null }
    if (host.includes('facebook')) return { source: 'Facebook', searchQuery: null }
    if (host.includes('reddit')) return { source: 'Reddit', searchQuery: null }
    if (host.includes('youtube')) return { source: 'YouTube', searchQuery: null }
    if (host.includes('whatsapp')) return { source: 'WhatsApp', searchQuery: null }
    if (host.includes('telegram')) return { source: 'Telegram', searchQuery: null }
    return { source: url.hostname, searchQuery: null }
  } catch {
    return { source: cleanText(referrer, 80) || 'Direct / None', searchQuery: null }
  }
}

async function getWebhookSettings(): Promise<WebhookSettings | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  try {
    const database = createServiceClient(url, key, { auth: { persistSession: false } })
    const { data } = await database.from('webhook_settings').select('*').eq('id', 1).single()
    return data
  } catch {
    return null
  }
}

async function sendDiscord(webhookUrl: string, payload: object) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return response.ok
  } catch {
    return false
  }
}

function isEnabled(value: boolean | null | undefined) {
  return value !== false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const type = cleanText(body.type, 20)
    const sessionId = cleanText(body.sessionId, 128)
    const page = cleanText(body.page, 200) || '/'

    if (type === 'heartbeat' && sessionId) {
      const existing = viewers.get(sessionId)
      const now = Date.now()
      viewers.set(sessionId, {
        ts: now,
        since: existing?.since || now,
        page,
        ua: existing?.ua || '',
        country: existing?.country || '—',
        city: existing?.city || '—',
        name: existing?.name || null,
        phone: existing?.phone || null,
        latitude: existing?.latitude || null,
        longitude: existing?.longitude || null,
        accuracy: existing?.accuracy || null,
      })
      purgeIdle()
      return NextResponse.json({ viewers: viewers.size })
    }

    if (type === 'leave' && sessionId) {
      viewers.delete(sessionId)
      return NextResponse.json({ ok: true })
    }

    if (type !== 'visit' && type !== 'identify') {
      return NextResponse.json({ error: 'Unsupported visitor event' }, { status: 400 })
    }

    const visitorName = cleanText(body.visitorName, 80)
    const phone = cleanText(body.phone, 32)
    const preciseLocation = getPreciseLocation(body)
    if (type === 'identify' && !visitorName && !phone && !preciseLocation) {
      return NextResponse.json({ error: 'No visitor details supplied' }, { status: 400 })
    }

    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || ''
    const { browser, os, device, isBot } = parseUserAgent(userAgent)
    if (isBot) return NextResponse.json({ ok: true, skipped: 'bot' })

    const settings = await getWebhookSettings()
    const spamBlockHours = Math.min(
      24,
      Math.max(1, Number(settings?.spam_block_hours) || DEFAULT_SPAM_BLOCK_HOURS),
    )

    if (type === 'visit') {
      const lastSeen = spamGuard.get(ip) || 0
      if (Date.now() - lastSeen < spamBlockHours * 60 * 60 * 1000) {
        const now = Date.now()
        const existing = viewers.get(sessionId || ip)
        viewers.set(sessionId || ip, {
          ts: now,
          since: existing?.since || now,
          page,
          ua: userAgent,
          country: existing?.country || '—',
          city: existing?.city || '—',
          name: visitorName || existing?.name || null,
          phone: phone || existing?.phone || null,
          latitude: preciseLocation?.latitude ?? existing?.latitude ?? null,
          longitude: preciseLocation?.longitude ?? existing?.longitude ?? null,
          accuracy: preciseLocation?.accuracy ?? existing?.accuracy ?? null,
        })
        return NextResponse.json({ ok: true, skipped: 'rate_limited' })
      }
      spamGuard.set(ip, Date.now())
    }

    const geo = await getGeo(ip)
    const now = Date.now()
    const viewerKey = sessionId || ip
    const existing = viewers.get(viewerKey)
    viewers.set(viewerKey, {
      ts: now,
      since: existing?.since || now,
      page,
      ua: userAgent,
      country: geo.country,
      city: geo.city,
      name: visitorName || existing?.name || null,
      phone: phone || existing?.phone || null,
      latitude: preciseLocation?.latitude ?? existing?.latitude ?? null,
      longitude: preciseLocation?.longitude ?? existing?.longitude ?? null,
      accuracy: preciseLocation?.accuracy ?? existing?.accuracy ?? null,
    })
    purgeIdle()

    const webhookUrl = settings?.webhook_url || process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl || settings?.notifications_enabled === false) {
      return NextResponse.json({ ok: true, skipped: 'notifications_disabled' })
    }
    if (type === 'visit' && settings?.notify_on_visit === false) {
      return NextResponse.json({ ok: true, skipped: 'visit_notifications_disabled' })
    }

    const referrer = parseReferrer(cleanText(body.referrer, 500))
    const timezone = cleanText(body.timezone, 80)
    const language = cleanText(body.language, 40)
    const screenWidth = Number(body.screenWidth)
    const screenHeight = Number(body.screenHeight)
    const approximateLocation = [geo.city, geo.region, geo.country]
      .filter((part) => part && part !== '—')
      .join(', ') || 'Unknown'
    const preciseCoordinates = preciseLocation
      ? `${preciseLocation.latitude.toFixed(6)}, ${preciseLocation.longitude.toFixed(6)}`
      : null
    const mapLatitude = preciseLocation?.latitude || geo.lat
    const mapLongitude = preciseLocation?.longitude || geo.lon
    const mapLink = mapLatitude && mapLongitude
      ? `https://www.google.com/maps?q=${mapLatitude},${mapLongitude}`
      : null
    const time = new Date().toLocaleString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Asia/Dubai',
    }) + ' (Dubai)'

    const fields: Array<{ name: string; value: string; inline: boolean }> = []
    if (isEnabled(settings?.show_visitor_name)) {
      fields.push({
        name: '👤 Visitor Name',
        value: visitorName ? `**${discordText(visitorName)}**` : 'Anonymous / not shared',
        inline: true,
      })
    }
    fields.push({
      name: '📞 Phone (optional)',
      value: phone ? discordText(phone) : 'Not provided',
      inline: true,
    })
    if (isEnabled(settings?.show_browser)) {
      fields.push({ name: '🌐 Browser & OS', value: `${browser} on ${os}`, inline: true })
    }
    if (isEnabled(settings?.show_device)) {
      fields.push({ name: '📱 Device', value: device, inline: true })
    }
    fields.push({ name: '🔐 IP Address', value: discordText(ip), inline: true })
    if (isEnabled(settings?.show_location)) {
      fields.push(
        { name: '📍 Approx. Location', value: discordText(approximateLocation), inline: true },
        {
          name: '🎯 Precise Coordinates',
          value: preciseCoordinates || 'Not shared by visitor',
          inline: false,
        },
      )
      if (preciseLocation?.accuracy !== null && preciseLocation?.accuracy !== undefined) {
        fields.push({
          name: '📏 Location Accuracy',
          value: `Within approximately ${Math.round(preciseLocation.accuracy)} metres`,
          inline: true,
        })
      }
    }
    if (isEnabled(settings?.show_map_link) && mapLink) {
      fields.push({
        name: preciseLocation ? '🗺️ Precise Map' : '🗺️ Approximate Map',
        value: `[Open in Google Maps](${mapLink})`,
        inline: true,
      })
    }
    if (isEnabled(settings?.show_isp)) {
      fields.push({ name: '🏢 ISP / Organization', value: discordText(geo.org || 'Unknown'), inline: true })
    }
    fields.push({ name: '🕐 Time', value: time, inline: true })
    if (isEnabled(settings?.show_referrer)) {
      fields.push(
        { name: '🔗 Source', value: discordText(referrer.source), inline: true },
        { name: '📄 Page', value: discordText(page), inline: true },
      )
    }
    if (isEnabled(settings?.show_search_query) && referrer.searchQuery) {
      fields.push({ name: '🔍 Search Query', value: discordText(referrer.searchQuery), inline: false })
    }
    if (
      isEnabled(settings?.show_screen) &&
      Number.isFinite(screenWidth) &&
      Number.isFinite(screenHeight) &&
      screenWidth > 0 &&
      screenHeight > 0
    ) {
      fields.push({ name: '📺 Screen', value: `${screenWidth}×${screenHeight}`, inline: true })
    }
    if (isEnabled(settings?.show_language) && language) {
      fields.push({ name: '🗣️ Language', value: discordText(language), inline: true })
    }
    if (isEnabled(settings?.show_timezone) && timezone) {
      fields.push({ name: '🌏 Timezone', value: discordText(timezone), inline: true })
    }
    if (isEnabled(settings?.show_live_count)) {
      fields.push({
        name: '👥 Live Now',
        value: `**${viewers.size}** viewer${viewers.size !== 1 ? 's' : ''} on the portfolio`,
        inline: false,
      })
    }

    const title = type === 'identify'
      ? '👤 Visitor Shared Details'
      : cleanText(settings?.custom_title, 200) || '👁️ New Portfolio Visitor'
    const footer = cleanText(settings?.custom_footer, 200) || 'sahad.is-a.dev · Visitor Analytics'
    await sendDiscord(webhookUrl, {
      embeds: [{
        author: { name: title, url: 'https://sahad.is-a.dev/' },
        color: type === 'identify' ? 0x7c3aed : 0x00e5ff,
        fields,
        footer: { text: footer },
        timestamp: new Date().toISOString(),
      }],
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected visitor event error' },
      { status: 500 },
    )
  }
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (!isAdminUser(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  purgeIdle()
  return NextResponse.json({
    viewers: viewers.size,
    sessions: Array.from(viewers.entries()).map(([id, viewer]) => ({
      id: id.slice(0, 8),
      page: viewer.page,
      since: viewer.since,
      country: viewer.country,
      city: viewer.city,
      name: viewer.name,
      phone: viewer.phone,
      latitude: viewer.latitude,
      longitude: viewer.longitude,
      accuracy: viewer.accuracy,
    })),
  })
}
