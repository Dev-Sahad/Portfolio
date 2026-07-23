import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/adminAccess'

export const dynamic = 'force-dynamic'

const fields = [
  'webhook_url', 'notifications_enabled', 'notify_on_visit', 'notify_on_comment',
  'show_location', 'show_map_link', 'show_isp', 'show_device', 'show_browser',
  'show_referrer', 'show_search_query', 'show_screen', 'show_language',
  'show_timezone', 'show_visitor_name', 'show_live_count', 'spam_block_hours',
  'custom_footer', 'custom_title', 'contact_webhook_url', 'comments_webhook_url',
  'contact_custom_message', 'comments_custom_message',
] as const

async function getAdminDatabase() {
  const sessionClient = await createServerClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user || !isAdminUser(user)) return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET() {
  const database = await getAdminDatabase()
  if (!database) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { data, error } = await database.from('webhook_settings').select('*').eq('id', 1).single()
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data || null })
}

export async function POST(request: NextRequest) {
  const database = await getAdminDatabase()
  if (!database) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const settings = body.settings as Record<string, unknown> | undefined
  if (!settings) return NextResponse.json({ error: 'Settings are required' }, { status: 400 })

  const payload: Record<string, unknown> = { id: 1 }
  for (const field of fields) {
    if (field in settings) payload[field] = settings[field]
  }
  const { error } = await database.from('webhook_settings').upsert([payload])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
