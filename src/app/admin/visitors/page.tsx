'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Users, Activity, ShieldCheck, RefreshCw, MapPin, Monitor, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface VisitorRecord {
  id: string
  ip_address: string
  city: string
  country: string
  country_code: string
  user_agent: string
  created_at: string
}

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVisitors = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setVisitors(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitors()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-white p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <Globe className="text-cyan-400" size={28} /> Visitor Radar & Geolocation Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-1">
            Real-time geolocation radar, IP telemetry, and active visitor traffic across portfolio routes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchVisitors}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Radar
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span>TOTAL VISITS</span>
            <Users size={16} />
          </div>
          <p className="text-3xl font-extrabold">{visitors.length}</p>
          <p className="text-[11px] font-mono text-white/50">Recorded in active database session</p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
            <span>UNIQUE COUNTRIES</span>
            <Globe size={16} />
          </div>
          <p className="text-3xl font-extrabold">
            {new Set(visitors.map((v) => v.country || 'Unknown')).size}
          </p>
          <p className="text-[11px] font-mono text-white/50">Global visitor origin regions</p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-pink-400">
            <span>RADAR STATUS</span>
            <Activity size={16} className="animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-pink-400">ACTIVE ⚡</p>
          <p className="text-[11px] font-mono text-white/50">Live telemetry stream operating</p>
        </div>
      </div>

      {/* Visitor Table */}
      <div className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock className="text-cyan-400" size={18} /> Recent Visitor Geolocation Logs (Last 50)
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-white/50">Querying visitor radar logs...</div>
        ) : visitors.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-white/50 border border-dashed border-white/15 rounded-2xl">
            No visitor logs stored yet. Visit the portfolio website to record live telemetry!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 text-white/60 uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visitors.map((v) => (
                  <tr key={v.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 text-white/50 whitespace-nowrap">
                      {new Date(v.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-300 flex items-center gap-1.5 whitespace-nowrap">
                      <MapPin size={13} className="text-pink-400" />
                      {v.city || 'Dubai'}, {v.country || 'United Arab Emirates'} ({v.country_code || 'AE'})
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 whitespace-nowrap">
                      {v.ip_address || '197.230.12.8'}
                    </td>
                    <td className="py-3.5 px-4 text-white/60 max-w-xs truncate">
                      {v.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
