import { NextResponse } from 'next/server'
import { getAuthenticatedAdminUser } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdminUser()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { origin } = new URL(request.url)
  const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim()
  if (!clientId) {
    const settingsUrl = new URL('/admin/instagram', origin)
    settingsUrl.searchParams.set(
      'error',
      'Instagram Login is not configured. Add the Instagram App ID as INSTAGRAM_CLIENT_ID in Vercel. Do not use the Facebook App ID.'
    )
    return NextResponse.redirect(settingsUrl)
  }

  const redirectUri = `${origin}/api/instagram-callback`
  const state = crypto.randomUUID()
  const authUrl = new URL('https://www.instagram.com/oauth/authorize')
  authUrl.searchParams.set('enable_fb_login', '0')
  authUrl.searchParams.set('force_authentication', '1')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'instagram_business_basic')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('instagram_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/instagram-callback',
    maxAge: 600,
  })
  return response
}
