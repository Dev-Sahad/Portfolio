import type { SupabaseClient } from '@supabase/supabase-js'

const META_GRAPH_VERSION = 'v26.0'
const GRAPH_ROOT = `https://graph.instagram.com/${META_GRAPH_VERSION}`

type InstagramProfile = {
  id?: string
  user_id?: string
  username: string
  name?: string
  biography?: string
  website?: string
  profile_picture_url?: string
  account_type?: string
  followers_count?: number
  follows_count?: number
  media_count?: number
}

type InstagramMedia = {
  id: string
  caption?: string
  media_type: string
  media_product_type?: string
  media_url?: string
  permalink: string
  thumbnail_url?: string
  timestamp?: string
  username?: string
  comments_count?: number
  like_count?: number
  children?: { data?: Array<Record<string, unknown>> }
}

async function graphRequest<T>(path: string, accessToken: string): Promise<T> {
  const url = new URL(`${GRAPH_ROOT}${path}`)
  url.searchParams.set('access_token', accessToken)

  const response = await fetch(url, { cache: 'no-store' })
  const payload = await response.json()
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || `Instagram Graph API returned ${response.status}`)
  }
  return payload as T
}

export async function syncInstagramAccount(options: {
  database: SupabaseClient
  accessToken: string
  connectedBy?: string
  expiresAt?: string | null
  persistConnection?: boolean
}) {
  const { database, accessToken, connectedBy, expiresAt = null, persistConnection = true } = options
  const profileFields = [
    'user_id',
    'username',
    'name',
    'biography',
    'website',
    'profile_picture_url',
    'account_type',
    'followers_count',
    'follows_count',
    'media_count',
  ].join(',')
  const profile = await graphRequest<InstagramProfile>(`/me?fields=${profileFields}`, accessToken)
  const instagramUserId = String(profile.user_id || profile.id || '')
  if (!instagramUserId || !profile.username) {
    throw new Error('Instagram did not return an account ID and username for this token.')
  }

  const now = new Date().toISOString()
  const { data: account, error: accountError } = await database
    .from('instagram_accounts')
    .upsert(
      {
        instagram_user_id: instagramUserId,
        username: profile.username,
        name: profile.name || null,
        biography: profile.biography || null,
        website: profile.website || null,
        profile_picture_url: profile.profile_picture_url || null,
        account_type: profile.account_type || null,
        followers_count: profile.followers_count || 0,
        follows_count: profile.follows_count || 0,
        media_count: profile.media_count || 0,
        is_active: true,
        last_synced_at: now,
        updated_at: now,
      },
      { onConflict: 'instagram_user_id' },
    )
    .select('id, username')
    .single()

  if (accountError || !account) {
    throw new Error(accountError?.message || 'Could not store the Instagram account.')
  }

  if (persistConnection) {
    const { error: connectionError } = await database.from('instagram_connections').upsert(
      {
        account_id: account.id,
        access_token: accessToken,
        token_type: 'bearer',
        scopes: ['instagram_business_basic'],
        expires_at: expiresAt,
        connected_by: connectedBy || null,
        last_refreshed_at: now,
        updated_at: now,
      },
      { onConflict: 'account_id' },
    )
    if (connectionError) throw new Error(connectionError.message)
  }

  const mediaFields = [
    'id',
    'caption',
    'media_type',
    'media_product_type',
    'media_url',
    'permalink',
    'thumbnail_url',
    'timestamp',
    'username',
    'comments_count',
    'like_count',
    'children{id,media_type,media_url,thumbnail_url}',
  ].join(',')
  const mediaPayload = await graphRequest<{ data?: InstagramMedia[] }>(
    `/me/media?fields=${mediaFields}&limit=100`,
    accessToken,
  )
  const media = mediaPayload.data || []

  await database.from('instagram_media').update({ is_visible: false, updated_at: now }).eq('account_id', account.id)

  if (media.length) {
    const rows = media.map((item) => ({
      account_id: account.id,
      instagram_media_id: item.id,
      media_type: item.media_type,
      media_product_type: item.media_product_type || (item.media_type === 'VIDEO' ? 'REELS' : 'FEED'),
      media_url: item.media_url || null,
      thumbnail_url: item.thumbnail_url || null,
      permalink: item.permalink,
      caption: item.caption || null,
      username: item.username || profile.username,
      posted_at: item.timestamp || null,
      like_count: item.like_count || 0,
      comments_count: item.comments_count || 0,
      children: item.children?.data || [],
      is_visible: true,
      synced_at: now,
      updated_at: now,
    }))
    const { error: mediaError } = await database
      .from('instagram_media')
      .upsert(rows, { onConflict: 'account_id,instagram_media_id' })
    if (mediaError) throw new Error(mediaError.message)
  }

  return {
    accountId: account.id as string,
    username: account.username as string,
    count: media.length,
    posts: media.filter((item) => item.media_product_type !== 'REELS').length,
    reels: media.filter((item) => item.media_product_type === 'REELS').length,
  }
}
