import { NextRequest, NextResponse } from 'next/server'
import { getServiceDatabase } from '@/lib/supabaseAdmin'

const clean = (value: unknown, limit: number) => typeof value === 'string' ? value.trim().slice(0, limit) : ''

export async function POST(request: NextRequest) {
  const database = getServiceDatabase()
  if (!database) return NextResponse.json({ error: 'Inquiry service is unavailable.' }, { status: 503 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const payload = {
    name: clean(body.name, 120),
    email: clean(body.email, 254).toLowerCase(),
    company: clean(body.company, 160) || null,
    role: clean(body.role, 60) || 'recruiter',
    opportunity_type: clean(body.opportunityType, 60) || 'full-time',
    budget: clean(body.budget, 100) || null,
    timeline: clean(body.timeline, 100) || null,
    message: clean(body.message, 4000),
    source_path: clean(body.sourcePath, 300) || '/hire',
  }

  if (!payload.name || !/^\S+@\S+\.\S+$/.test(payload.email) || payload.message.length < 10) {
    return NextResponse.json({ error: 'Enter a valid name, email, and a message of at least 10 characters.' }, { status: 400 })
  }

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await database.from('hiring_inquiries').select('id', { count: 'exact', head: true }).eq('email', payload.email).gte('created_at', since)
  if ((count || 0) >= 3) return NextResponse.json({ error: 'Please wait a few minutes before sending another inquiry.' }, { status: 429 })

  const { error } = await database.from('hiring_inquiries').insert(payload)
  return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 500 : 201 })
}
