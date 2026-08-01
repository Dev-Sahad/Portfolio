'use client'
import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

export default function HiringInquiryForm({ role }: { role: string }) {
  const [state,setState]=useState<'idle'|'sending'|'sent'>('idle'); const [error,setError]=useState('')
  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setState('sending');setError('');const form=new FormData(e.currentTarget);const response=await fetch('/api/hiring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(form.entries()))});const body=await response.json().catch(()=>({}));if(response.ok)setState('sent');else{setState('idle');setError(body.error||'Could not send inquiry.')}}
  if(state==='sent') return <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 text-center"><CheckCircle2 className="mx-auto text-emerald-300"/><h3 className="mt-3 text-xl font-semibold">Inquiry received</h3><p className="mt-2 text-white/55">Sahad can now review the opportunity in the hiring dashboard.</p></div>
  const input='rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-cyan-300/50'
  return <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-white/10 bg-white/[.025] p-5 sm:grid-cols-2">
    <input name="name" required placeholder="Your name" className={input}/><input name="email" type="email" required placeholder="Work email" className={input}/><input name="company" placeholder="Company" className={input}/><select name="opportunityType" className={input}><option className="bg-black">Full-time role</option><option className="bg-black">Contract project</option><option className="bg-black">Technical call</option><option className="bg-black">Collaboration</option></select><input name="timeline" placeholder="Hiring timeline" className={input}/><input name="budget" placeholder="Budget / salary range (optional)" className={input}/><textarea name="message" required minLength={10} placeholder="Role, problem, team, and what success looks like…" rows={5} className={`${input} sm:col-span-2`}/><input type="hidden" name="role" value={role}/><input type="hidden" name="sourcePath" value={`/hire/${role}`}/>{error&&<p className="text-sm text-red-300 sm:col-span-2">{error}</p>}<button disabled={state==='sending'} className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black sm:col-span-2"><Send size={15}/>{state==='sending'?'Sending…':'Send qualified inquiry'}</button>
  </form>
}
