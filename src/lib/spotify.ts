const SPOTIFY_TYPES = new Set(['playlist', 'track', 'album', 'artist', 'show', 'episode'])

export const DEFAULT_SPOTIFY_URL =
  'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0'

export function normalizeSpotifyEmbedUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const input = value.trim()
  if (!input) return null

  let type = ''
  let id = ''

  if (input.startsWith('spotify:')) {
    const parts = input.split(':')
    type = parts[1]?.toLowerCase() || ''
    id = parts[2] || ''
  } else {
    try {
      const url = new URL(input)
      if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com') return null
      const parts = url.pathname.split('/').filter(Boolean)
      const offset = parts[0]?.startsWith('intl-') ? 1 : 0
      const embedOffset = parts[offset] === 'embed' ? offset + 1 : offset
      type = parts[embedOffset]?.toLowerCase() || ''
      id = parts[embedOffset + 1] || ''
    } catch {
      return null
    }
  }

  if (!SPOTIFY_TYPES.has(type) || !/^[A-Za-z0-9]{10,64}$/.test(id)) return null
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
}
