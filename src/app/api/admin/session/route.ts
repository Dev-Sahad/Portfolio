import { NextResponse } from 'next/server'
import { getAuthenticatedAdminUser } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getAuthenticatedAdminUser()
  if (!user) {
    return NextResponse.json(
      { authenticated: false, error: 'Admin access required' },
      { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  return NextResponse.json(
    {
      authenticated: true,
      admin: {
        id: user.id,
        email: user.email,
      },
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
