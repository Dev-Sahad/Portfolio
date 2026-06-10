'use client'

import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

export default function HiddenAdminAccess() {
  const router = useRouter()

  return (
    <button
      type="button"
      aria-label="Admin login"
      title="Admin"
      onClick={() => router.push('/admin/login')}
      className="fixed bottom-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/0 opacity-0 backdrop-blur transition hover:text-white/70 hover:opacity-100 focus:text-white focus:opacity-100"
    >
      <Shield size={14} />
    </button>
  )
}
