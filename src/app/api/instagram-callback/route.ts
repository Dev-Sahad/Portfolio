import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminUser } from '@/lib/adminAccess'
import { syncInstagramAccount } from '@/lib/instagramGraph'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

function adminRedirect(origin: string, params: Record<string, string>) {
  const url = new URL('/admin/instagram', origin)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  const response = NextResponse.redirect(url)
  response.cookies.set('instagram_oauth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/instagram-callback',
    maxAge: 0,
  })
  return response
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const database = await createClient()
  const { data: { user } } = await database.auth.getUser()
  if (!isAdminUser(user)) return adminRedirect(origin, { error: 'Admin access required' })

  const error = searchParams.get('error')
  const code = searchParams.get('code')?.replace(/#_$/, '')
  const state = searchParams.get('state')
  const cookieStore = await cookies()
  const expectedState = cookieStore.get('instagram_oauth_state')?.value

  if (error || !code) {
    return adminRedirect(origin, { error: searchParams.get('error_reason') || error || 'Authorization denied' })
  }
  if (!state || !expectedState || state !== expectedState) {
    return adminRedirect(origin, { error: 'Instagram authorization state expired. Please reconnect.' })
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim()
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    return adminRedirect(origin, {
      error: 'Instagram Login is not configured. Add INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET in Vercel using the credentials from the Instagram API use case.',
    })
  }

  const redirectUri = `${origin}/api/instagram-callback`
  try {
    const formData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    })
    const shortResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      cache: 'no-store',
    })
    const shortToken = await shortResponse.json()
    if (!shortResponse.ok || !shortToken.access_token) {
      throw new Error(shortToken.error_message || shortToken.error?.message || 'Instagram token exchange failed')
    }

    let accessToken = shortToken.access_token as string
    let expiresIn: number | null = null
    const longUrl = new URL('https://graph.instagram.com/access_token')
    longUrl.searchParams.set('grant_type', 'ig_exchange_token')
    longUrl.searchParams.set('client_secret', clientSecret)
    longUrl.searchParams.set('access_token', accessToken)
    const longResponse = await fetch(longUrl, { cache: 'no-store' })
    const longToken = await longResponse.json()
    if (longResponse.ok && longToken.access_token) {
      accessToken = longToken.access_token
      expiresIn = typeof longToken.expires_in === 'number' ? longToken.expires_in : null
    }

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null
    const result = await syncInstagramAccount({
      database,
      accessToken,
      connectedBy: user!.id,
      expiresAt,
      persistConnection: true,
    })

    return adminRedirect(origin, {
      status: 'connected',
      account: result.username,
      posts: String(result.posts),
      reels: String(result.reels),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Instagram connection failed'
    return adminRedirect(origin, { error: message })
  }
}
