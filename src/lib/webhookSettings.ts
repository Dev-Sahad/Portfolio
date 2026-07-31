import 'server-only'

import { getServiceDatabase } from '@/lib/supabaseAdmin'

type DeliveryKind = 'contact' | 'comments'

type DeliverySettings = {
  contact_webhook_url?: string | null
  comments_webhook_url?: string | null
  contact_custom_message?: string | null
  comments_custom_message?: string | null
}

const clean = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 1800) : ''

export async function getWebhookDelivery(kind: DeliveryKind) {
  const fallbackUrl = kind === 'contact'
    ? (process.env.CONTACT_DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL)
    : (process.env.COMMENTS_DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL)

  const database = getServiceDatabase()
  if (!database) return { url: clean(fallbackUrl), message: '' }

  try {
    const { data, error } = await database
      .from('webhook_settings')
      .select('contact_webhook_url, comments_webhook_url, contact_custom_message, comments_custom_message')
      .eq('id', 1)
      .single<DeliverySettings>()

    if (error) throw error

    return kind === 'contact'
      ? { url: clean(data?.contact_webhook_url) || clean(fallbackUrl), message: clean(data?.contact_custom_message) }
      : { url: clean(data?.comments_webhook_url) || clean(fallbackUrl), message: clean(data?.comments_custom_message) }
  } catch {
    // The environment variables keep delivery working until the migration is applied.
    return { url: clean(fallbackUrl), message: '' }
  }
}

export function renderWebhookMessage(template: string, values: Record<string, string>, fallback: string) {
  const source = template || fallback
  return source.replace(/\{\{(name|email|message|comment)\}\}/g, (_, key: string) => values[key] || '')
}

export function isDiscordWebhookUrl(value: string) {
  try {
    const url = new URL(value)
    const allowedHosts = new Set([
      'discord.com',
      'discordapp.com',
      'canary.discord.com',
      'ptb.discord.com',
    ])

    return url.protocol === 'https:'
      && allowedHosts.has(url.hostname)
      && /^\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
  } catch {
    return false
  }
}

export async function sendDiscordWebhook(url: string, payload: Record<string, unknown>) {
  if (!url) throw new Error('Discord webhook is not configured.')
  if (!isDiscordWebhookUrl(url)) throw new Error('Discord webhook URL is invalid.')

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new Error(`Discord webhook delivery failed with status ${response.status}.`)
  }
}
