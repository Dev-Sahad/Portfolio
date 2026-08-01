'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Database, Play, RefreshCw, CheckCircle2, ShieldCheck, Terminal, Layers, Table, HardDrive, Zap, Code, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TableInfo {
  name: string
  rowCount: number
  status: 'ACTIVE' | 'NOT_CREATED'
  description: string
}

const DEFAULT_SQL_QUERY = `-- Master Supabase SQL Query & Schema Migration
SELECT table_name, num_rows 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 1-Click Master Schema Migration available via /api/setup-db`

const MANAGED_TABLES: TableInfo[] = [
  { name: 'projects', rowCount: 0, status: 'ACTIVE', description: 'Portfolio showcase items, tech stacks, GitHub links' },
  { name: 'certificates', rowCount: 0, status: 'ACTIVE', description: 'Verified credentials, issuers, credential IDs' },
  { name: 'comments', rowCount: 0, status: 'ACTIVE', description: 'Public visitor testimonials & comment feed' },
  { name: 'technologies', rowCount: 0, status: 'ACTIVE', description: 'Tech stack badges, proficiency levels, icons' },
  { name: 'scene3d_words', rowCount: 0, status: 'ACTIVE', description: '3D WebGL particle cloud words' },
  { name: 'portfolio_settings', rowCount: 0, status: 'ACTIVE', description: 'Global site config, intro music, Spotify URLs' },
  { name: 'instagram_accounts', rowCount: 0, status: 'ACTIVE', description: 'Permissioned Instagram account profile and sync metadata' },
  { name: 'instagram_media', rowCount: 0, status: 'ACTIVE', description: 'Connected account posts, carousels, and Reels' },
  { name: 'instagram_connections', rowCount: 0, status: 'ACTIVE', description: 'Admin-only OAuth token, scopes, and expiry metadata' },
  { name: 'visitors', rowCount: 0, status: 'ACTIVE', description: 'Real-time visitor IP geolocations & browser user agents' },
  { name: 'analytics', rowCount: 0, status: 'ACTIVE', description: 'Performance telemetry & Web Vitals benchmarks' },
]

export default function AdminDatabasePage() {
  const [sqlQuery, setSqlQuery] = useState(DEFAULT_SQL_QUERY)
  const [executing, setExecuting] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [message, setMessage] = useState('')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'tables' | 'editor' | 'master_sql'>('tables')
  const [tables, setTables] = useState<TableInfo[]>(MANAGED_TABLES)

  const fetchTableMetrics = useCallback(async () => {
    setMessage('')
    try {
      const updated = await Promise.all(
        MANAGED_TABLES.map(async (t) => {
          try {
            const { count, error } = await supabase.from(t.name).select('*', { count: 'exact', head: true })
            if (error) {
              return { ...t, status: 'NOT_CREATED' as const, rowCount: 0 }
            }
            return { ...t, status: 'ACTIVE' as const, rowCount: count || 0 }
          } catch {
            return { ...t, status: 'NOT_CREATED' as const, rowCount: 0 }
          }
        })
      )
      setTables(updated)
    } catch (e: any) {
      setMessage(`Error fetching database metrics: ${e.message}`)
    }
  }, [])

  useEffect(() => {
    fetchTableMetrics()

    // Real-time Supabase Realtime Subscription Listener
    const channel = supabase
      .channel('admin-db-realtime-listener')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload: any) => {
        setMessage(`⚡ Real-Time DB Event: ${payload.eventType} on table "${payload.table}"`)
        fetchTableMetrics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTableMetrics])

  // Execute SQL Console
  const handleExecuteSQL = async () => {
    setExecuting(true)
    setMessage('')
    setQueryResult(null)

    try {
      // Execute via setup-db / SQL API handler
      const res = await fetch('/api/setup-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute_sql', query: sqlQuery }),
      })
      const data = await res.json()
      setQueryResult(data)
      setMessage('✅ SQL Command executed successfully!')
      fetchTableMetrics()
    } catch (e: any) {
      setMessage(`SQL Execution Error: ${e.message}`)
    } finally {
      setExecuting(false)
    }
  }

  // 1-Click Push Master Schema to Supabase
  const handlePushMasterSchema = async () => {
    setPushing(true)
    setMessage('')

    try {
      const res = await fetch('/api/setup-db')
      const data = await res.json()
      if (data.success) {
        setMessage('🚀 Master Schema & RLS Policies successfully pushed and created in Supabase!')
        fetchTableMetrics()
      } else {
        setMessage(`Schema Push Warning: ${data.message || 'Check database permissions'}`)
      }
    } catch (e: any) {
      setMessage(`Push Error: ${e.message}`)
    } finally {
      setPushing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-white p-2 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <Database className="text-emerald-400" size={28} /> Real-Time Supabase Tables & SQL Studio
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-1">
            Real-time table metrics, SQL query editor console, and 1-click master schema push for all 9 portfolio entities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePushMasterSchema}
            disabled={pushing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
          >
            <Zap size={15} className={pushing ? 'animate-bounce' : ''} />
            {pushing ? 'Pushing Schema...' : 'Push Master Schema'}
          </button>

          <button
            type="button"
            onClick={fetchTableMetrics}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition"
          >
            <RefreshCw size={14} /> Refresh Tables
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-mono text-emerald-300">
          {message}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 font-bold transition ${
            activeTab === 'tables' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Table size={14} /> ACTIVE TABLES ({tables.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 font-bold transition ${
            activeTab === 'editor' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Terminal size={14} /> SQL QUERY CONSOLE
        </button>
      </div>

      {/* Tab 1: Tables Overview */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tables.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                    <Table size={14} className="text-emerald-400" /> {t.name}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                    t.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-white/60 font-mono">{t.description}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/40">ROW COUNT</span>
                <span className="text-lg font-bold text-white">{t.rowCount}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tab 2: SQL Console */}
      {activeTab === 'editor' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2 font-mono text-emerald-400">
              <Code size={18} /> PostgreSQL Terminal Console
            </h2>
            <button
              type="button"
              onClick={handleExecuteSQL}
              disabled={executing}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-black shadow-lg hover:bg-emerald-400 transition"
            >
              <Play size={14} className="fill-black" />
              {executing ? 'Executing Query...' : 'Run SQL Query'}
            </button>
          </div>

          <textarea
            rows={8}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-zinc-950 p-4 font-mono text-xs text-emerald-300 placeholder:text-white/30 focus:border-emerald-500 focus:outline-none leading-relaxed"
          />

          {queryResult && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-mono text-white/70">Execution Output Response:</h3>
              <pre className="rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-xs text-cyan-300 overflow-x-auto max-h-60">
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
