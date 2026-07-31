import { NextResponse } from 'next/server'
import { parseGitHubRepository } from '@/lib/portfolioMedia'

type GitHubReadmeResponse = {
  content?: string
  download_url?: string | null
  encoding?: string
  html_url?: string
  name?: string
  path?: string
}

function directoryUrl(value?: string | null) {
  if (!value) return ''
  return value.slice(0, value.lastIndexOf('/') + 1)
}

export async function GET(request: Request) {
  const repositoryUrl = new URL(request.url).searchParams.get('repository')
  const repository = parseGitHubRepository(repositoryUrl)

  if (!repository) {
    return NextResponse.json({ error: 'A valid GitHub repository URL is required.' }, { status: 400 })
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Dev-Sahad-Portfolio/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}/readme`,
    {
      headers,
      next: { revalidate: 3600 },
    },
  )

  if (response.status === 404) {
    return NextResponse.json({ error: 'This repository does not have a README yet.' }, { status: 404 })
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: 'The repository README is temporarily unavailable.' },
      { status: response.status === 403 ? 503 : 502 },
    )
  }

  const readme = (await response.json()) as GitHubReadmeResponse
  if (!readme.content || readme.encoding !== 'base64') {
    return NextResponse.json({ error: 'The README response was not readable.' }, { status: 502 })
  }

  const markdown = Buffer.from(readme.content.replace(/\s/g, ''), 'base64').toString('utf8')

  return NextResponse.json(
    {
      markdown,
      rawBaseUrl: directoryUrl(readme.download_url),
      sourceBaseUrl: directoryUrl(readme.html_url),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
