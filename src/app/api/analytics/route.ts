import { NextRequest, NextResponse } from 'next/server'
import { getServiceDatabase } from '@/lib/supabaseAdmin'

const allowedEvents = new Set([
  'page_view',
  'project_view',
  'project_live_click',
  'project_github_click',
  'cv_download',
  'contact_submit',
  'booking_click',
  'assistant_question',
])

const clean = (value: unknown, limit = 180) =>
  typeof value === 'string' ? value.trim().slice(0, limit) : ''

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const eventType = clean(body.eventType, 60)
  if (!allowedEvents.has(eventType)) {
    return NextResponse.json({ error: 'Unsupported analytics event' }, { status: 400 })
  }

  const database = getServiceDatabase()
  if (!database) return NextResponse.json({ ok: true, stored: false })

  const serializedMetadata = body.metadata && typeof body.metadata === 'object'
    ? JSON.stringify(body.metadata)
    : '{}'
  const metadata = serializedMetadata.length <= 2000
    ? JSON.parse(serializedMetadata)
    : { truncated: true }

  const { error } = await database.from('analytics_events').insert({
    event_type: eventType,
    path: clean(body.path),
    entity_id: clean(body.entityId),
    metadata,
  })

  return NextResponse.json({ ok: !error, stored: !error })
}
