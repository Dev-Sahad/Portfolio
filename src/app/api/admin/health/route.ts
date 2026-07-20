import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type ServiceStatus = 'healthy' | 'degraded' | 'unavailable'

export async function GET() {
  const startedAt = Date.now()
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  const checks: Record<string, { status: ServiceStatus; message: string }> = {
    application: {
      status: 'healthy',
      message: 'Next.js server is responding.',
    },
    database: {
      status: hasSupabaseConfig ? 'degraded' : 'unavailable',
      message: hasSupabaseConfig
        ? 'Database configuration detected; connectivity not yet verified.'
        : 'Supabase environment variables are missing.',
    },
  }

  if (hasSupabaseConfig) {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })

      checks.database = error
        ? { status: 'degraded', message: error.message }
        : { status: 'healthy', message: 'Supabase connection is working.' }
    } catch (error) {
      checks.database = {
        status: 'unavailable',
        message: error instanceof Error ? error.message : 'Database check failed.',
      }
    }
  }

  const overallStatus = Object.values(checks).every(
    (check) => check.status === 'healthy',
  )
    ? 'healthy'
    : Object.values(checks).some((check) => check.status === 'unavailable')
      ? 'unavailable'
      : 'degraded'

  return NextResponse.json(
    {
      status: overallStatus,
      checks,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'unknown',
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    {
      status: overallStatus === 'unavailable' ? 503 : 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
