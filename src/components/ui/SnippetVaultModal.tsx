'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, X, Copy, Check, Terminal, Sparkles } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface Snippet {
  id: string
  title: string
  category: string
  code: string
}

const SNIPPETS: Snippet[] = [
  {
    id: '1',
    title: 'rehype-raw Markdown Parser',
    category: 'React / Next.js',
    code: `import ReactMarkdown from 'react-markdown'\nimport rehypeRaw from 'rehype-raw'\nimport remarkGfm from 'remark-gfm'\n\nexport default function RichText({ content }: { content: string }) {\n  return (\n    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>\n      {content}\n    </ReactMarkdown>\n  )\n}`,
  },
  {
    id: '2',
    title: 'Custom Audio Manager Hook',
    category: 'Web Audio API',
    code: `export function useAudio() {\n  const playClick = () => {\n    const ctx = new AudioContext()\n    const osc = ctx.createOscillator()\n    osc.frequency.setValueAtTime(800, ctx.currentTime)\n    osc.connect(ctx.destination)\n    osc.start()\n    osc.stop(ctx.currentTime + 0.05)\n  }\n  return { playClick }\n}`,
  },
  {
    id: '3',
    title: 'Supabase RLS Policy Pattern',
    category: 'PostgreSQL DB',
    code: `-- Public Read & Authenticated Admin Write\nCREATE POLICY "Public Read Access" ON projects\n  FOR SELECT USING (true);\n\nCREATE POLICY "Admin Write Access" ON projects\n  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));`,
  },
]

interface SnippetVaultModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SnippetVaultModal({ isOpen, onClose }: SnippetVaultModalProps) {
  const [activeSnippet, setActiveSnippet] = useState<Snippet>(SNIPPETS[0])
  const [copied, setCopied] = useState(false)
  const { playClick, playHover } = useAudio()

  const handleCopy = () => {
    playClick()
    navigator.clipboard.writeText(activeSnippet.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            className="relative flex flex-col w-full max-w-2xl h-[520px] overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0a0c16]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Sahad Reusable Code Snippet Vault
                  </h3>
                  <p className="text-xs text-white/50">Production React hooks & database patterns</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Snippet Selector Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 shrink-0 no-scrollbar">
              {SNIPPETS.map((snippet) => (
                <button
                  key={snippet.id}
                  type="button"
                  onClick={() => {
                    playClick()
                    setActiveSnippet(snippet)
                  }}
                  onMouseEnter={playHover}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-mono transition border ${
                    activeSnippet.id === snippet.id
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {snippet.title}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <div className="relative flex-1 rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs overflow-y-auto text-cyan-200">
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20 transition"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <pre className="whitespace-pre-wrap leading-relaxed">{activeSnippet.code}</pre>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
