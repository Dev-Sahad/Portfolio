'use client'

import React, { useState } from 'react'
import { Play, RotateCcw, Copy, Check, Terminal, Eye, Code2 } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface CodeSandboxProps {
  initialCode: string
  language?: string
  title?: string
}

export default function CodeSandbox({
  initialCode,
  language = 'javascript',
  title = 'Interactive Code Snippet',
}: CodeSandboxProps) {
  const [code, setCode] = useState(initialCode.trim())
  const [activeTab, setActiveTab] = useState<'editor' | 'output'>('editor')
  const [copied, setCopied] = useState(false)
  const [logs, setLogs] = useState<{ type: 'log' | 'error' | 'warn'; text: string }[]>([])
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const { playClick, playHover, playSuccess } = useAudio()

  const normalizedLang = language.toLowerCase()
  const isHtml = ['html', 'htm', 'markup'].includes(normalizedLang)

  const handleCopy = () => {
    playClick()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    playClick()
    setCode(initialCode.trim())
    setLogs([])
    setHtmlPreview(null)
  }

  const runCode = () => {
    playClick()
    setIsExecuting(true)
    setActiveTab('output')

    if (isHtml) {
      setHtmlPreview(code)
      playSuccess()
      setIsExecuting(false)
      return
    }

    // Evaluate JavaScript safely
    const capturedLogs: { type: 'log' | 'error' | 'warn'; text: string }[] = []
    
    const customConsole = {
      log: (...args: unknown[]) => {
        capturedLogs.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') })
      },
      error: (...args: unknown[]) => {
        capturedLogs.push({ type: 'error', text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') })
      },
      warn: (...args: unknown[]) => {
        capturedLogs.push({ type: 'warn', text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') })
      },
    }

    try {
      const runFn = new Function('console', code)
      runFn(customConsole)
      if (capturedLogs.length === 0) {
        capturedLogs.push({ type: 'log', text: '▶ Code executed successfully (No console output).' })
      }
      setLogs(capturedLogs)
      playSuccess()
    } catch (err) {
      capturedLogs.push({ type: 'error', text: String(err) })
      setLogs(capturedLogs)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/15 bg-[#0e0e11] shadow-xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#16161c] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-white/50">{title} ({normalizedLang})</span>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => { playClick(); setActiveTab('editor'); }}
            onMouseEnter={playHover}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'editor' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 size={13} />
            Editor
          </button>
          <button
            type="button"
            onClick={() => { playClick(); setActiveTab('output'); }}
            onMouseEnter={playHover}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'output' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {isHtml ? <Eye size={13} /> : <Terminal size={13} />}
            {isHtml ? 'Preview' : 'Console'}
            {logs.length > 0 && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            onMouseEnter={playHover}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white transition"
            title="Copy code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            onMouseEnter={playHover}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white transition"
            title="Reset code"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={runCode}
            onMouseEnter={playHover}
            disabled={isExecuting}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30 transition shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Play size={13} className="fill-emerald-300" />
            <span>Run Code</span>
          </button>
        </div>
      </div>

      {/* Editor & Output Body */}
      <div className="relative min-h-[160px] p-4 font-mono text-xs leading-6">
        {activeTab === 'editor' ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[180px] bg-transparent text-emerald-300/90 focus:outline-none resize-y font-mono"
            placeholder="Type or edit code here..."
          />
        ) : (
          <div className="min-h-[180px]">
            {isHtml ? (
              htmlPreview !== null ? (
                <iframe
                  srcDoc={htmlPreview}
                  title="Live Preview"
                  sandbox="allow-scripts"
                  className="w-full min-h-[220px] rounded-lg border border-white/10 bg-white text-black"
                />
              ) : (
                <div className="flex h-full min-h-[180px] items-center justify-center text-white/35">
                  Click &quot;Run Code&quot; to generate live preview.
                </div>
              )
            ) : (
              <div className="space-y-1.5">
                {logs.length === 0 ? (
                  <div className="flex h-full min-h-[180px] items-center justify-center text-white/35">
                    Click &quot;Run Code&quot; to execute JavaScript and view output logs.
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 rounded px-2 py-1 ${
                        log.type === 'error'
                          ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500'
                          : log.type === 'warn'
                          ? 'bg-yellow-500/10 text-yellow-300 border-l-2 border-yellow-500'
                          : 'bg-white/5 text-emerald-300 border-l-2 border-emerald-500'
                      }`}
                    >
                      <span className="text-white/30 font-bold">&gt;</span>
                      <pre className="whitespace-pre-wrap font-mono break-all">{log.text}</pre>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
