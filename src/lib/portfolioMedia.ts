type ProjectMedia = {
  github_url?: string | null
  image_url?: string | null
  image_urls?: unknown
}

type CertificateMedia = {
  date?: string | null
  image_url?: string | null
  issuer?: string | null
  title: string
}

export type GitHubRepository = {
  owner: string
  repo: string
}

const certificatePalettes = [
  ['#06b6d4', '#312e81'],
  ['#8b5cf6', '#4c1d95'],
  ['#ec4899', '#831843'],
  ['#22c55e', '#14532d'],
  ['#f59e0b', '#78350f'],
] as const

export function parseGitHubRepository(value?: string | null): GitHubRepository | null {
  if (!value) return null

  try {
    const url = new URL(value)
    if (!['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return null

    const [owner, rawRepo] = url.pathname.split('/').filter(Boolean)
    const repo = rawRepo?.replace(/\.git$/i, '')
    const validSegment = /^[a-z0-9_.-]+$/i

    if (!owner || !repo || !validSegment.test(owner) || !validSegment.test(repo)) return null
    return { owner, repo }
  } catch {
    return null
  }
}

export function isGenericPlaceholderImage(value?: string | null) {
  if (!value) return false

  try {
    const hostname = new URL(value).hostname.toLowerCase()
    return hostname === 'images.unsplash.com' || hostname === 'source.unsplash.com'
  } catch {
    return false
  }
}

export function getRepositoryThumbnail(githubUrl?: string | null) {
  const repository = parseGitHubRepository(githubUrl)
  if (!repository) return ''

  return `https://opengraph.githubassets.com/portfolio-project/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}`
}

export function getProjectThumbnail(project: ProjectMedia) {
  const uploadedImage = project.image_url?.trim()
  if (uploadedImage && !isGenericPlaceholderImage(uploadedImage)) return uploadedImage

  return getRepositoryThumbnail(project.github_url) || uploadedImage || ''
}

export function getProjectImages(project: ProjectMedia) {
  const uploadedGallery = Array.isArray(project.image_urls)
    ? project.image_urls.filter(
        (value): value is string =>
          typeof value === 'string' &&
          Boolean(value.trim()) &&
          !isGenericPlaceholderImage(value),
      )
    : []
  const thumbnail = getProjectThumbnail(project)

  return [...new Set([...uploadedGallery, thumbnail].filter(Boolean))]
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function splitTitle(value: string) {
  const words = value.trim().split(/\s+/)
  const lines: string[] = []

  for (const word of words) {
    const current = lines.at(-1)
    if (!current || (current.length + word.length + 1 > 28 && lines.length < 3)) {
      lines.push(word)
    } else {
      lines[lines.length - 1] = `${current} ${word}`
    }
  }

  return lines.slice(0, 3)
}

function stringHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

export function getCertificateThumbnail(certificate: CertificateMedia) {
  const uploadedImage = certificate.image_url?.trim()
  if (uploadedImage && !isGenericPlaceholderImage(uploadedImage)) return uploadedImage

  const palette =
    certificatePalettes[
      stringHash(`${certificate.issuer || ''}-${certificate.title}`) %
        certificatePalettes.length
    ]
  const lines = splitTitle(certificate.title)
  const titleMarkup = lines
    .map(
      (line, index) =>
        `<text x="72" y="${184 + index * 48}" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join('')
  const issuer = escapeXml(certificate.issuer || 'Professional Development')
  const date = certificate.date ? ` · ${escapeXml(certificate.date)}` : ''
  const initial = escapeXml((certificate.issuer || certificate.title).trim().charAt(0).toUpperCase())

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#09090b"/>
          <stop offset="0.58" stop-color="${palette[1]}"/>
          <stop offset="1" stop-color="#09090b"/>
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stop-color="${palette[0]}" stop-opacity=".55"/>
          <stop offset="1" stop-color="${palette[0]}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="960" height="540" rx="28" fill="url(#background)"/>
      <circle cx="820" cy="92" r="250" fill="url(#glow)"/>
      <path d="M0 426 C210 355 350 510 590 420 C735 365 825 360 960 395" fill="none" stroke="${palette[0]}" stroke-opacity=".28" stroke-width="2"/>
      <rect x="48" y="48" width="864" height="444" rx="22" fill="none" stroke="#ffffff" stroke-opacity=".14"/>
      <circle cx="112" cy="108" r="38" fill="${palette[0]}" fill-opacity=".18" stroke="${palette[0]}" stroke-opacity=".75"/>
      <text x="112" y="121" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="800">${initial}</text>
      <text x="166" y="98" fill="#ffffff" fill-opacity=".55" font-family="Arial, sans-serif" font-size="15" letter-spacing="3">CERTIFICATE RECORD</text>
      <text x="166" y="126" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="600">${issuer}${date}</text>
      ${titleMarkup}
      <text x="72" y="446" fill="#ffffff" fill-opacity=".42" font-family="Arial, sans-serif" font-size="14" letter-spacing="2">SKILLS · LEARNING · ACHIEVEMENT</text>
      <circle cx="850" cy="430" r="42" fill="none" stroke="${palette[0]}" stroke-opacity=".7" stroke-width="2"/>
      <path d="M831 430 l13 13 l27 -31" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
