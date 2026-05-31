import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only protect admin and auth routes
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/auth')
  ) {
    try {
      const { updateSession } = await import('@/utils/supabase/middleware')
      return await updateSession(request)
    } catch {
      return NextResponse.next()
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
}
