import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedAdminDatabase } from '@/lib/supabaseAdmin'

const clean = (value: unknown, limit = 5000) => typeof value === 'string' ? value.trim().slice(0, limit) : ''

export async function GET() {
  const database = await getAuthenticatedAdminDatabase()
  if (!database) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const [inquiries, updates, translations, seo] = await Promise.all([
    database.from('hiring_inquiries').select('*').order('created_at', { ascending: false }).limit(200),
    database.from('portfolio_updates').select('*').order('created_at', { ascending: false }),
    database.from('portfolio_translations').select('*').order('locale'),
    database.from('seo_settings').select('*').eq('id', 1).maybeSingle(),
  ])
  return NextResponse.json({ inquiries: inquiries.data || [], updates: updates.data || [], translations: translations.data || [], seo: seo.data || {} })
}

export async function POST(request: NextRequest) {
  const database = await getAuthenticatedAdminDatabase()
  if (!database) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const body = await request.json().catch(() => ({})) as Record<string, any>

  if (body.action === 'save_update') {
    const item = body.item || {}
    const payload = { title: clean(item.title, 180), summary: clean(item.summary, 3000), category: clean(item.category, 50) || 'build', link_url: clean(item.link_url, 1000) || null, published: item.published === true, published_at: item.published ? (item.published_at || new Date().toISOString()) : null, updated_at: new Date().toISOString() }
    if (!payload.title || !payload.summary) return NextResponse.json({ error: 'Title and summary are required.' }, { status: 400 })
    const query = item.id ? database.from('portfolio_updates').update(payload).eq('id', item.id) : database.from('portfolio_updates').insert(payload)
    const { error } = await query
    return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 200 })
  }
  if (body.action === 'save_translation') {
    const item = body.item || {}
    const locale = clean(item.locale, 30)
    if (!/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(locale)) return NextResponse.json({ error: 'Use a valid BCP-47 language code, such as ar, hi, or pt-BR.' }, { status: 400 })
    let translations: Record<string, unknown>
    try { translations = typeof item.translations === 'string' ? JSON.parse(item.translations) : item.translations } catch { return NextResponse.json({ error: 'Translations must be valid JSON.' }, { status: 400 }) }
    const { error } = await database.from('portfolio_translations').upsert({ locale, namespace: clean(item.namespace, 60) || 'common', native_name: clean(item.native_name, 100) || locale, direction: item.direction === 'rtl' ? 'rtl' : 'ltr', enabled: item.enabled !== false, translations, updated_at: new Date().toISOString() }, { onConflict: 'locale,namespace' })
    return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 200 })
  }
  if (body.action === 'save_seo') {
    const item = body.item || {}
    const { error } = await database.from('seo_settings').upsert({ id: 1, site_title: clean(item.site_title, 180), description: clean(item.description, 500), keywords: clean(item.keywords, 1000).split(',').map((x) => x.trim()).filter(Boolean).slice(0, 30), og_image_url: clean(item.og_image_url, 1000) || null, social_title: clean(item.social_title, 180) || null, social_description: clean(item.social_description, 500) || null, allow_indexing: item.allow_indexing !== false, updated_at: new Date().toISOString() })
    return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 200 })
  }
  if (body.action === 'inquiry_status') {
    const allowed = new Set(['new','reviewing','contacted','closed'])
    if (!allowed.has(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    const { error } = await database.from('hiring_inquiries').update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', body.id)
    return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 200 })
  }
  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 })
}
