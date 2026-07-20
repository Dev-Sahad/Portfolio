'use client'

import { useCallback, useEffect, useState } from 'react'
import Sidebar from '@/app/admin/Sidebar'
import { Activity, CheckCircle2, RefreshCcw, Server, TriangleAlert, XCircle } from 'lucide-react'

type ServiceStatus = 'healthy' | 'degraded' | 'unavailable'

type HealthData = {
  status: ServiceStatus
  checks: Record<string, { status: ServiceStatus; message: string }>
  environment: string
  responseTimeMs: number
  timestamp: string
}

const statusStyles: Record<ServiceStatus, string> = {
  healthy: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  degraded: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  unavailable: 'border-red-500/20 bg-red-500/10 text-red-300',
}

function StatusIcon({ status }: { status: ServiceStatus }) {
  if (status === 'healthy') return <CheckCircle2 size={18} />
  if (status === 'degraded') return <TriangleAlert size={18} />
  return <XCircle size={18} />
}

export default function AdminStatusPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHealth = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/health', { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok && !payload?.checks) {
        throw new Error(payload?.error || 'Unable to load system status.')
      }

      setData(payload)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load system status.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadHealth()
  }, [loadHealth])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="lg:ml-[250px] pt-[95px] lg:pt-8 min-h-screen px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest mb-2">
                <Activity size={15} /> Diagnostics
              </div>
              <h1 className="text-3xl font-semibold">System Status</h1>
              <p className="text-sm text-white/40 mt-2">
                Verify the application and database connection from the admin panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadHealth()}
              disabled={loading}
              className="h-11 px-5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh status
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 mb-5">
              {error}
            </div>
          )}

          {data && (
            <>
              <div className={`rounded-2xl border p-5 mb-5 ${statusStyles[data.status]}`}>
                <div className="flex items-center gap-3">
                  <StatusIcon status={data.status} />
                  <div>
                    <p className="font-semibold capitalize">{data.status}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {data.environment} · {data.responseTimeMs} ms · {new Date(data.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(data.checks).map(([name, check]) => (
                  <article key={name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                          <Server size={17} />
                        </div>
                        <div>
                          <h2 className="font-medium capitalize">{name}</h2>
                          <p className="text-xs text-white/40 mt-1">{check.message}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] capitalize ${statusStyles[check.status]}`}>
                        <StatusIcon status={check.status} />
                        {check.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
