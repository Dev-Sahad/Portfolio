import { createClient } from '@supabase/supabase-js'

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
    ? process.env.CONTACT_DISCORD_WEBHOOK_URL
    : process.env.COMMENTS_DISCORD_WEBHOOK_URL
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) return { url: fallbackUrl || '', message: '' }

  try {
    const database = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data } = await database
      .from('webhook_settings')
      .select('contact_webhook_url, comments_webhook_url, contact_custom_message, comments_custom_message')
      .eq('id', 1)
      .single<DeliverySettings>()

    return kind === 'contact'
      ? { url: clean(data?.contact_webhook_url) || fallbackUrl || '', message: clean(data?.contact_custom_message) }
      : { url: clean(data?.comments_webhook_url) || fallbackUrl || '', message: clean(data?.comments_custom_message) }
  } catch {
    // The environment variables keep delivery working until the migration is applied.
    return { url: fallbackUrl || '', message: '' }
  }
}

export function renderWebhookMessage(template: string, values: Record<string, string>, fallback: string) {
  const source = template || fallback
  return source.replace(/\{\{(name|email|message|comment)\}\}/g, (_, key: string) => values[key] || '')
}
