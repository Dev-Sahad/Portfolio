import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/api/add-sample-certificates',
    '/api/import-github-projects',
    '/api/seed-certificates',
    '/api/setup-db',
    '/api/visitors',
  ],
}
