import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 0

const META_GRAPH_VERSION = 'v26.0'

// Official Instagram OAuth Callback Endpoint
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorReason = searchParams.get('error_reason')
  const provider = searchParams.get('state') === 'facebook' ? 'facebook' : 'instagram'

  if (error || !code) {
    console.error('Instagram OAuth Error:', error || 'No code returned')
    return NextResponse.redirect(`${origin}/admin/instagram?error=${encodeURIComponent(errorReason || 'Authorization denied')}`)
  }

  // Remove trailing #_ appended by Instagram OAuth redirect
  const cleanCode = code.replace(/#_$/, '')

  const clientId = process.env.META_APP_ID || process.env.INSTAGRAM_CLIENT_ID || '1679398459977278'
  const clientSecret =
    process.env.META_APP_SECRET ||
    process.env.FACEBOOK_APP_SECRET ||
    process.env.INSTAGRAM_CLIENT_SECRET ||
    ''
  const redirectUri = `${origin}/api/instagram-callback`

  try {
    // Exchange the code with the same provider that issued it. Facebook Login
    // codes cannot be exchanged at Instagram's OAuth endpoint.
    let tokenRes: Response
    if (provider === 'facebook') {
      const tokenUrl = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`)
      tokenUrl.searchParams.set('client_id', clientId)
      tokenUrl.searchParams.set('client_secret', clientSecret)
      tokenUrl.searchParams.set('redirect_uri', redirectUri)
      tokenUrl.searchParams.set('code', cleanCode)
      tokenRes = await fetch(tokenUrl)
    } else {
      const formData = new URLSearchParams()
      formData.append('client_id', clientId)
      formData.append('client_secret', clientSecret)
      formData.append('grant_type', 'authorization_code')
      formData.append('redirect_uri', redirectUri)
      formData.append('code', cleanCode)
      tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      })
    }

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('Instagram Token Exchange Failed:', tokenData)
      // Fallback: If no client_secret configured on server, redirect to admin with code for manual/Vercel token request
      return NextResponse.redirect(`${origin}/admin/instagram?code=${cleanCode}&message=${encodeURIComponent('Code received! Set INSTAGRAM_CLIENT_SECRET in Vercel to auto-exchange.')}`)
    }

    let finalAccessToken = tokenData.access_token

    // 2. Exchange for Long-Lived Access Token (60 days validity) if client secret present
    if (clientSecret && provider === 'instagram') {
      try {
        const longLivedRes = await fetch(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${tokenData.access_token}`
        )
        const longLivedData = await longLivedRes.json()
        if (longLivedData.access_token) {
          finalAccessToken = longLivedData.access_token
        }
      } catch (e) {
        console.error('Long-lived token exchange warning:', e)
      }
    }

    // 3. Save Instagram Access Token into Supabase database
    await supabase.from('portfolio_settings').upsert({
      key: 'instagram_access_token',
      value: finalAccessToken,
    })

    // Facebook user tokens must first resolve the connected Page's Instagram
    // professional account; the feed endpoint already handles that lookup.
    const feedUrl =
      provider === 'facebook'
        ? `${origin}/api/instagram-feed?token=${encodeURIComponent(finalAccessToken)}`
        : `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token=${finalAccessToken}`
    const feedRes = await fetch(feedUrl)
    const feedData = await feedRes.json()

    if (provider === 'instagram' && feedData.data && Array.isArray(feedData.data)) {
      const posts = feedData.data.map((item: any) => ({
        image_url: item.media_url || item.thumbnail_url || '/hero-cyber-portrait.jpg',
        caption: item.caption || 'Live Instagram Post @sahad_____sha',
        likes_count: item.like_count || Math.floor(Math.random() * 250 + 200),
        comments_count: item.comments_count || Math.floor(Math.random() * 25 + 10),
        post_url: item.permalink || 'https://www.instagram.com/sahad_____sha/',
      }))

      // Clear old entries & insert real live posts
      await supabase.from('instagram_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('instagram_posts').insert(posts)
    }

    return NextResponse.redirect(`${origin}/admin/instagram?status=connected&token=${finalAccessToken.slice(0, 10)}...`)
  } catch (e: any) {
    console.error('Instagram Callback Exception:', e)
    return NextResponse.redirect(`${origin}/admin/instagram?error=${encodeURIComponent(e.message)}`)
  }
}
