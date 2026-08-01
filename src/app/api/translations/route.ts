import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const locale = new URL(request.url).searchParams.get('locale')?.trim() || 'en'
  if (!/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(locale)) return NextResponse.json({ error: 'Invalid locale.' }, { status: 400 })
  const database = await createClient()
  const { data } = await database.from('portfolio_translations').select('locale,namespace,translations,native_name,direction').eq('locale', locale).eq('enabled', true)
  return NextResponse.json({ locale, bundles: data || [] }, { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' } })
}
