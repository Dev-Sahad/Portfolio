import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedAdminDatabase, recordRevision } from '@/lib/supabaseAdmin'

const allowedSettings = new Set([
  'owner_name',
  'availability_text',
  'hero_title_primary',
  'hero_title_secondary',
  'hero_role',
  'hero_description',
  'about_eyebrow',
  'about_title',
  'about_description',
  'about_quote',
  'cv_url',
  'github_url',
  'linkedin_url',
  'instagram_url',
  'youtube_url',
  'tiktok_url',
  'contact_heading',
  'contact_subheading',
  'maintenance_mode',
  'maintenance_message',
  'booking_url',
  'show_testimonials',
  'assistant_enabled',
  'performance_mode',
])

const clean = (value: unknown, limit = 5000) =>
  typeof value === 'string' ? value.trim().slice(0, limit) : ''

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100)

export async function GET(request: NextRequest) {
  const database = await getAuthenticatedAdminDatabase()
  if (!database) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const exportMode = new URL(request.url).searchParams.get('export') === '1'
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [testimonials, posts, messages, revisions, settings, events, recentEvents] = await Promise.all([
    database.from('testimonials').select('*').order('display_order').order('created_at', { ascending: false }),
    database.from('posts').select('*').order('created_at', { ascending: false }),
    database.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(exportMode ? 1000 : 100),
    database.from('content_revisions').select('*').order('created_at', { ascending: false }).limit(exportMode ? 1000 : 100),
    database.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    database.from('analytics_events').select('event_type,entity_id,created_at').order('created_at', { ascending: false }).limit(exportMode ? 5000 : 1500),
    database.from('analytics_events').select('id', { count: 'exact', head: true }).gte('created_at', since),
  ])

  const eventRows = events.data || []
  const byType = new Map<string, number>()
  const popularProjects = new Map<string, number>()
  for (const event of eventRows) {
    byType.set(event.event_type, (byType.get(event.event_type) || 0) + 1)
    if (event.entity_id && event.event_type.startsWith('project_')) {
      popularProjects.set(event.entity_id, (popularProjects.get(event.entity_id) || 0) + 1)
    }
  }

  const payload = {
    testimonials: testimonials.data || [],
    posts: posts.data || [],
    messages: messages.data || [],
    revisions: revisions.data || [],
    settings: settings.data || {},
    analytics: {
      total: eventRows.length,
      lastSevenDays: recentEvents.count || 0,
      byType: [...byType].map(([event_type, count]) => ({ event_type, count })).sort((a, b) => b.count - a.count),
      popularProjects: [...popularProjects].map(([entity_id, count]) => ({ entity_id, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    },
  }

  return NextResponse.json(payload, exportMode ? {
    headers: { 'Content-Disposition': `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.json"` },
  } : undefined)
}

export async function POST(request: NextRequest) {
  const database = await getAuthenticatedAdminDatabase()
  if (!database) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const body = await request.json().catch(() => ({})) as Record<string, any>
  const action = clean(body.action, 60)

  if (action === 'save_testimonial') {
    const input = body.item || {}
    const payload = {
      name: clean(input.name, 120),
      role: clean(input.role, 160) || null,
      company: clean(input.company, 160) || null,
      quote: clean(input.quote, 1800),
      avatar_url: clean(input.avatar_url, 1000) || null,
      source_url: clean(input.source_url, 1000) || null,
      rating: Math.min(5, Math.max(1, Number(input.rating) || 5)),
      approved: input.approved === true,
      display_order: Number(input.display_order) || 100,
      updated_at: new Date().toISOString(),
    }
    if (!payload.name || !payload.quote) return NextResponse.json({ error: 'Name and quote are required.' }, { status: 400 })

    if (input.id) {
      const { data: before } = await database.from('testimonials').select('*').eq('id', input.id).single()
      if (before) await recordRevision(database, 'testimonial', String(input.id), 'update', before)
      const { data, error } = await database.from('testimonials').update(payload).eq('id', input.id).select().single()
      return NextResponse.json(error ? { error: error.message } : { item: data }, { status: error ? 500 : 200 })
    }
    const { data, error } = await database.from('testimonials').insert(payload).select().single()
    if (data) await recordRevision(database, 'testimonial', String(data.id), 'create', data)
    return NextResponse.json(error ? { error: error.message } : { item: data }, { status: error ? 500 : 200 })
  }

  if (action === 'save_post') {
    const input = body.item || {}
    const title = clean(input.title, 180)
    const payload = {
      slug: slugify(clean(input.slug, 120) || title),
      title,
      excerpt: clean(input.excerpt, 400) || null,
      content: clean(input.content, 30000),
      cover_url: clean(input.cover_url, 1000) || null,
      tags: Array.isArray(input.tags)
        ? input.tags.map((tag: unknown) => clean(tag, 40)).filter(Boolean).slice(0, 12)
        : clean(input.tags, 500).split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12),
      published: input.published === true,
      published_at: input.published === true ? input.published_at || new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }
    if (!payload.title || !payload.slug || !payload.content) {
      return NextResponse.json({ error: 'Title, slug, and content are required.' }, { status: 400 })
    }

    if (input.id) {
      const { data: before } = await database.from('posts').select('*').eq('id', input.id).single()
      if (before) await recordRevision(database, 'post', String(input.id), 'update', before)
      const { data, error } = await database.from('posts').update(payload).eq('id', input.id).select().single()
      return NextResponse.json(error ? { error: error.message } : { item: data }, { status: error ? 500 : 200 })
    }
    const { data, error } = await database.from('posts').insert(payload).select().single()
    if (data) await recordRevision(database, 'post', String(data.id), 'create', data)
    return NextResponse.json(error ? { error: error.message } : { item: data }, { status: error ? 500 : 200 })
  }

  if (action === 'save_project') {
    const input = body.item || {}
    const metrics = Array.isArray(input.metrics)
      ? input.metrics
        .map((metric: any) => ({
          label: clean(metric?.label, 80),
          value: clean(metric?.value, 120),
        }))
        .filter((metric: { label: string; value: string }) => metric.label && metric.value)
        .slice(0, 12)
      : []
    const payload = {
      title: clean(input.title, 180),
      description: clean(input.description, 5000),
      live_url: clean(input.live_url, 1000) || null,
      github_url: clean(input.github_url, 1000) || null,
      technologies: clean(input.technologies, 1200),
      key_features: clean(input.key_features, 2400),
      problem: clean(input.problem, 5000) || null,
      project_role: clean(input.project_role, 2500) || null,
      solution: clean(input.solution, 5000) || null,
      challenges: clean(input.challenges, 5000) || null,
      results: clean(input.results, 5000) || null,
      metrics,
      featured_order: Math.max(0, Number(input.featured_order) || 100),
      is_featured: input.is_featured === true,
      updated_at: new Date().toISOString(),
    }
    if (!body.id || !payload.title) {
      return NextResponse.json({ error: 'Project ID and title are required.' }, { status: 400 })
    }
    const { data: before } = await database.from('projects').select('*').eq('id', body.id).single()
    if (before) await recordRevision(database, 'project', String(body.id), 'update', before)
    const { data, error } = await database.from('projects').update(payload).eq('id', body.id).select().single()
    return NextResponse.json(error ? { error: error.message } : { item: data }, { status: error ? 500 : 200 })
  }

  if (action === 'delete') {
    const table = body.entity === 'post'
      ? 'posts'
      : body.entity === 'testimonial'
        ? 'testimonials'
        : body.entity === 'project'
          ? 'projects'
          : null
    if (!table) return NextResponse.json({ error: 'Unsupported entity.' }, { status: 400 })
    const { data: before } = await database.from(table).select('*').eq('id', body.id).single()
    if (before) await recordRevision(database, body.entity, String(body.id), 'delete', before)
    const { error } = await database.from(table).delete().eq('id', body.id)
    return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 200 })
  }

  if (action === 'save_settings' || action === 'save_site_settings') {
    const incoming = body.settings || {}
    const payload: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() }
    for (const [key, value] of Object.entries(incoming)) {
      if (allowedSettings.has(key)) payload[key] = value
    }
    const { data: before } = await database.from('site_settings').select('*').eq('id', 1).maybeSingle()
    if (before) await recordRevision(database, 'site_settings', '1', 'update', before)
    const { error } = await database.from('site_settings').upsert(payload)
    return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 200 })
  }

  if (action === 'message_status') {
    const allowed = new Set(['unread', 'read', 'replied', 'archived'])
    if (!allowed.has(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    const { error } = await database.from('contact_messages').update({
      status: body.status,
      updated_at: new Date().toISOString(),
    }).eq('id', body.id)
    return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 200 })
  }

  if (action === 'restore_revision') {
    const { data: revision } = await database.from('content_revisions').select('*').eq('id', body.id).single()
    if (!revision) return NextResponse.json({ error: 'Revision not found.' }, { status: 404 })
    const table = revision.entity_type === 'post'
      ? 'posts'
      : revision.entity_type === 'testimonial'
        ? 'testimonials'
        : revision.entity_type === 'project'
          ? 'projects'
          : revision.entity_type === 'site_settings'
            ? 'site_settings'
            : null
    if (!table) return NextResponse.json({ error: 'This revision type cannot be restored here.' }, { status: 400 })
    const snapshot = { ...revision.snapshot }
    delete snapshot.created_at
    if (revision.entity_type === 'site_settings') snapshot.id = 1
    const { error } = await database.from(table).upsert(snapshot)
    if (!error) await recordRevision(database, revision.entity_type, revision.entity_id, 'restore', revision.snapshot)
    return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 200 })
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 })
}
