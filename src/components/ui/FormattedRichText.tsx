'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface FormattedRichTextProps {
  content: string
  className?: string
}

export default function FormattedRichText({ content, className = '' }: FormattedRichTextProps) {
  if (!content) return null

  // Helper to decode HTML entities if double-encoded
  const sanitizedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

  return (
    <div className={`rich-text-content space-y-3 leading-relaxed text-white/80 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-white mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-cyan-300 mt-2 mb-1">{children}</h3>,
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 my-2 pl-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 my-2 pl-2">{children}</ol>,
          li: ({ children }) => <li className="text-white/80">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-medium">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-white/90">{children}</em>,
          code: ({ children }) => (
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-cyan-300">{children}</code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cyan-500/50 bg-cyan-500/10 p-3 rounded-r-xl italic text-white/80 my-3">
              {children}
            </blockquote>
          ),
          br: () => <br className="my-1" />,
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  )
}
