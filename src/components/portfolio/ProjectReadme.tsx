'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

import CodeSandbox from '@/components/ui/CodeSandbox'

type ReadmeData = {
  markdown: string
  rawBaseUrl: string
  sourceBaseUrl: string
}

function resolveReadmeUrl(value: string | undefined, baseUrl: string) {
  if (!value || value.startsWith('#')) return value
  if (/^(https?:|mailto:|tel:|data:)/i.test(value)) return value

  try {
    return new URL(value.replace(/^\/+/, ''), baseUrl).toString()
  } catch {
    return value
  }
}

export default function ProjectReadme({ githubUrl }: { githubUrl?: string }) {
  const [data, setData] = useState<ReadmeData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(githubUrl))

  useEffect(() => {
    if (!githubUrl) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadReadme() {
      setLoading(true)
      setError('')
      setData(null)

      try {
        const response = await fetch(
          `/api/github-readme?repository=${encodeURIComponent(githubUrl || '')}`,
          { signal: controller.signal },
        )
        const result = await response.json()

        if (!response.ok) throw new Error(result.error || 'README unavailable.')
        setData(result)
      } catch (readmeError) {
        if (controller.signal.aborted) return
        setError(readmeError instanceof Error ? readmeError.message : 'README unavailable.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadReadme()
    return () => controller.abort()
  }, [githubUrl])

  if (!githubUrl) return null

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4 md:px-7">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
          <BookOpen size={16} />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Project README</h2>
          <p className="mt-0.5 text-[11px] text-white/35">Loaded directly inside this case study</p>
        </div>
      </header>

      {loading ? (
        <div className="flex min-h-44 items-center justify-center gap-3 text-sm text-white/35">
          <Loader2 size={16} className="animate-spin" />
          Loading repository documentation...
        </div>
      ) : error ? (
        <p className="px-5 py-10 text-sm text-white/40 md:px-7">{error}</p>
      ) : data ? (
        <article className="readme-content px-5 py-7 md:px-8 md:py-9">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              a: ({ children, href }) => (
                <a
                  href={resolveReadmeUrl(href, data.sourceBaseUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              img: ({ alt, src }) => (
                <img
                  src={resolveReadmeUrl(src, data.rawBaseUrl)}
                  alt={alt || 'README visual'}
                  loading="lazy"
                />
              ),
              code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) {
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : ''
                const codeContent = String(children).replace(/\n$/, '')
                if (match) {
                  return <CodeSandbox initialCode={codeContent} language={language} />
                }
                return <code className={className} {...props}>{children}</code>
              },
            }}
          >
            {data.markdown}
          </ReactMarkdown>
        </article>
      ) : null}
    </section>
  )
}

