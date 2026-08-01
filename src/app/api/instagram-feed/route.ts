import { NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/adminAccess'
import { syncInstagramAccount } from '@/lib/instagramGraph'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

async function sync(request: Request) {
  const database = await createClient()
  const { data: { user } } = await database.auth.getUser()
  if (!isAdminUser(user)) {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
  }

  let suppliedToken = ''
  if (request.method === 'POST') {
    const body = await request.json().catch(() => ({}))
    suppliedToken = typeof body.token === 'string' ? body.token.trim() : ''
  }

  let accessToken = suppliedToken
  if (!accessToken) {
    const { data: connection, error } = await database
      .from('instagram_connections')
      .select('access_token')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    accessToken = connection?.access_token || ''
  }

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: 'Authenticate Instagram or provide a valid access token first.' },
      { status: 400 },
    )
  }

  try {
    const result = await syncInstagramAccount({
      database,
      accessToken,
      connectedBy: user!.id,
      persistConnection: true,
    })
    return NextResponse.json({ success: true, source: 'INSTAGRAM_GRAPH_API', ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Instagram sync failed'
    return NextResponse.json({ success: false, message }, { status: 502 })
  }
}

export async function GET(request: Request) {
  return sync(request)
}

export async function POST(request: Request) {
  return sync(request)
}
