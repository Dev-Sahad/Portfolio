'use client'

import { FormEvent, useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, Loader2, Send, X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { useAudio } from '@/context/AudioContext'

type AssistantReply = {
  answer: string
  links: Array<{ label: string; href: string }>
}

export default function PortfolioAssistant() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<AssistantReply | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { playClick, playHover } = useAudio()

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    if (isSpeaking) {
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const startVoiceInput = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    playClick()
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      if (transcript) {
        setQuestion(transcript)
      }
    }

    recognition.start()
  }

  const ask = async (event: FormEvent) => {
    event.preventDefault()
    if (!question.trim() || loading) return
    playClick()
    setLoading(true)
    trackEvent('assistant_question')
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await response.json()
      const resultData = response.ok ? data : { answer: data.error || 'Unable to answer right now.', links: [] }
      setReply(resultData)
      if (resultData.answer) {
        speakText(resultData.answer)
      }
    } catch {
      setReply({ answer: 'Connection error. Please try again.', links: [] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <section
          aria-label="Portfolio assistant"
          className="fixed bottom-20 right-4 z-[100] w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-white/15 bg-[#0c0c0c]/95 p-5 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Bot size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  Ask AI Assistant
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-mono text-purple-300">Voice Enabled</span>
                </h2>
                <p className="text-[11px] text-white/40">Ask about Sahad&apos;s skills, projects & CV</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playClick()
                setOpen(false)
              }}
              onMouseEnter={playHover}
              aria-label="Close assistant"
              className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {reply && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-6 text-white/75 flex-1">{reply.answer}</p>
                <button
                  type="button"
                  onClick={() => speakText(reply.answer)}
                  onMouseEnter={playHover}
                  className={`rounded-lg p-1.5 border transition ${
                    isSpeaking ? 'bg-purple-500/30 text-purple-200 border-purple-400' : 'bg-white/5 text-white/50 hover:text-white border-white/10'
                  }`}
                  title={isSpeaking ? 'Mute Speech' : 'Listen to Answer'}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>

              {reply.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {reply.links.map((link) => (
                    <Link
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white hover:text-black transition"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={ask} className="flex gap-2">
            <label className="sr-only" htmlFor="portfolio-assistant-question">Ask a question</label>
            <div className="relative flex-1">
              <input
                id="portfolio-assistant-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask or tap mic to speak..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-4 pr-10 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/30"
              />
              <button
                type="button"
                onClick={startVoiceInput}
                onMouseEnter={playHover}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-1.5 transition ${
                  isListening ? 'bg-red-500/30 text-red-300 animate-pulse' : 'text-white/40 hover:text-white'
                }`}
                title="Speak question"
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={playHover}
              aria-label="Send question"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black disabled:opacity-50 hover:bg-white/90 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          playClick()
          setOpen((value) => !value)
        }}
        onMouseEnter={playHover}
        aria-label="Open portfolio assistant"
        className="fixed bottom-5 right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white text-black shadow-2xl transition hover:scale-105"
      >
        <Bot size={20} />
      </button>
    </>
  )
}

