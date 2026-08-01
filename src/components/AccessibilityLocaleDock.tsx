'use client'

import { useEffect, useState } from 'react'
import { Accessibility, Languages, Minus, Plus, RotateCcw, X } from 'lucide-react'

const languages = [
  ['en','English'],['ar','العربية'],['bn','বাংলা'],['zh-CN','中文'],['hi','हिन्दी'],['es','Español'],['fr','Français'],['de','Deutsch'],['pt-BR','Português'],['ru','Русский'],['ja','日本語'],['ko','한국어'],['tr','Türkçe'],['ur','اردو'],['id','Bahasa Indonesia'],['it','Italiano'],['nl','Nederlands'],['fa','فارسی'],['sw','Kiswahili'],['ta','தமிழ்'],['ml','മലയാളം'],['te','తెలుగు'],['th','ไทย'],['vi','Tiếng Việt']
]

export default function AccessibilityLocaleDock() {
  const [open, setOpen] = useState<'access'|'language'|null>(null)
  const [scale, setScale] = useState(100)
  const [contrast, setContrast] = useState(false)
  const [readable, setReadable] = useState(false)
  const [guide, setGuide] = useState(false)
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${scale}%`
    root.dataset.highContrast = contrast ? 'true' : 'false'
    root.dataset.readableFont = readable ? 'true' : 'false'
    localStorage.setItem('portfolio-accessibility', JSON.stringify({ scale, contrast, readable, guide }))
  }, [scale, contrast, readable, guide])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('portfolio-accessibility') || '{}')
      if (saved.scale) setScale(saved.scale)
      setContrast(Boolean(saved.contrast)); setReadable(Boolean(saved.readable)); setGuide(Boolean(saved.guide))
      const language = localStorage.getItem('portfolio-locale') || navigator.language || 'en'
      setLocale(language)
      document.documentElement.lang = language
      document.documentElement.dir = /^(ar|fa|he|ur)/i.test(language) ? 'rtl' : 'ltr'
    } catch {}
  }, [])

  const setLanguage = (value: string) => {
    const next = value.trim()
    if (!/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(next)) return
    setLocale(next); localStorage.setItem('portfolio-locale', next)
    document.documentElement.lang = next
    document.documentElement.dir = /^(ar|fa|he|ur)/i.test(next) ? 'rtl' : 'ltr'
    window.dispatchEvent(new CustomEvent('portfolio:locale', { detail: next }))
  }

  return <>
    {guide && <div className="pointer-events-none fixed left-0 right-0 z-[9997] h-10 border-y border-cyan-300/40 bg-cyan-300/[0.08]" style={{ top: 'calc(var(--reader-y, 50vh) - 20px)' }} />}
    <div className="fixed bottom-5 left-5 z-[9998] flex items-center gap-2">
      <button onClick={() => setOpen(open === 'access' ? null : 'access')} aria-label="Accessibility controls" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/80 text-white shadow-2xl backdrop-blur-xl hover:bg-white hover:text-black"><Accessibility size={18}/></button>
      <button onClick={() => setOpen(open === 'language' ? null : 'language')} aria-label="Language controls" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/80 text-white shadow-2xl backdrop-blur-xl hover:bg-white hover:text-black"><Languages size={18}/></button>
    </div>
    {open && <div className="fixed bottom-20 left-5 z-[9999] w-[min(360px,calc(100vw-40px))] rounded-3xl border border-white/15 bg-[#090909]/95 p-5 text-white shadow-2xl backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-mono uppercase tracking-[.22em] text-cyan-300">{open === 'access' ? 'Access center' : 'Universal locale'}</p><h2 className="mt-1 text-lg font-semibold">{open === 'access' ? 'Make this portfolio yours' : 'Any BCP-47 language'}</h2></div><button onClick={() => setOpen(null)} aria-label="Close"><X size={18}/></button></div>
      {open === 'access' ? <div className="space-y-3">
        <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3"><span className="text-sm">Text size · {scale}%</span><div className="flex gap-2"><button onClick={() => setScale(Math.max(85,scale-10))}><Minus size={17}/></button><button onClick={() => setScale(Math.min(140,scale+10))}><Plus size={17}/></button></div></div>
        {[['High contrast',contrast,setContrast],['Readable font',readable,setReadable],['Reading guide',guide,setGuide]].map(([label,value,setter]: any) => <button key={label} onClick={() => setter(!value)} className="flex w-full items-center justify-between rounded-2xl bg-white/5 p-3 text-sm"><span>{label}</span><span className={`h-5 w-9 rounded-full p-0.5 ${value?'bg-cyan-400':'bg-white/15'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${value?'translate-x-4':''}`}/></span></button>)}
        <button onClick={() => {setScale(100);setContrast(false);setReadable(false);setGuide(false)}} className="flex items-center gap-2 text-xs text-white/50"><RotateCcw size={14}/>Reset preferences</button>
      </div> : <div><select value={locale} onChange={(e)=>setLanguage(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm">{languages.map(([code,name])=><option key={code} value={code} className="bg-black">{name} · {code}</option>)}</select><input aria-label="Custom language code" placeholder="Or enter any code: he, af, fil, pt-PT…" onKeyDown={(e)=>{if(e.key==='Enter')setLanguage(e.currentTarget.value)}} className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-cyan-300/40"/><p className="mt-3 text-xs leading-5 text-white/40">All valid language and regional codes are supported. Admin-managed translations load through the locale API; missing strings safely remain in English.</p></div>}
    </div>}
  </>
}
