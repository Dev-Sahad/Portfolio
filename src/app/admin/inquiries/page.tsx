'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Clock, CheckCircle2, Trash2, Send, RefreshCw, Sparkles, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Inquiry {
  id: string
  name: string
  email: string
  message: string
  budget?: string
  created_at: string
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: 'inq-1',
      name: 'Alex Vance',
      email: 'alex@designstudio.io',
      message: 'Hi Sahad, loved your 3D WebGL portfolio! We have a Next.js 15 project launching next month and would love to hire you for frontend design.',
      budget: '$3,000 - $5,000',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'inq-2',
      name: 'Sara Al-Maktoum',
      email: 'sara@techdubai.ae',
      message: 'Hey Sahad! Interested in collaborating on a web app dashboard UI with Supabase real-time integration.',
      budget: '$5,000+',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-white p-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <Mail className="text-pink-400" size={28} /> Inquiries & Client Leads Command Center
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-1">
            Submitted contact form inquiries, project lead requests, budget preferences, and client messages.
          </p>
        </div>
      </div>

      {/* Inquiry Cards List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={18} /> Active Client Inquiries ({inquiries.length})
        </h2>

        <div className="space-y-4">
          {inquiries.map((inq) => (
            <motion.div
              key={inq.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{inq.name}</h3>
                    <p className="text-xs font-mono text-cyan-400">{inq.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-white/50">
                  {inq.budget && (
                    <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-emerald-300 font-bold border border-emerald-500/30">
                      Budget: {inq.budget}
                    </span>
                  )}
                  <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-mono bg-white/5 p-4 rounded-xl border border-white/10">
                &quot;{inq.message}&quot;
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <a
                  href={`mailto:${inq.email}?subject=Re:%20Portfolio%20Inquiry%20from%20Sahad`}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
                >
                  <Send size={13} /> Reply via Email
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
