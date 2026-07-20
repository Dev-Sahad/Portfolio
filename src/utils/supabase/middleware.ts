import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isProtectedAdminRoute =
    request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname !== '/admin/login'
  const protectedAdminApiRoutes = new Set([
    '/api/add-sample-certificates',
    '/api/import-github-projects',
    '/api/seed-certificates',
    '/api/setup-db',
  ])
  const isProtectedAdminApiRoute = protectedAdminApiRoutes.has(request.nextUrl.pathname)

  const redirectToLogin = () => {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.search = ''
    const redirect = NextResponse.redirect(loginUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  const denyApiRequest = (status: 401 | 403) => NextResponse.json(
    { error: status === 401 ? 'Authentication required' : 'Admin access required' },
    { status },
  )

  if (!url || !key) {
    if (isProtectedAdminApiRoute) return denyApiRequest(401)
    return isProtectedAdminRoute ? redirectToLogin() : supabaseResponse
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verify the identity with Supabase Auth instead of trusting cookie data.
  const { data: { user } } = await supabase.auth.getUser()
  const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'dev.sxhd@gmail.com').toLowerCase()
  const isAdmin = Boolean(
    user && (
      user.app_metadata?.role === 'admin' ||
      user.email?.toLowerCase() === configuredAdminEmail
    )
  )

  if (isProtectedAdminApiRoute && !user) return denyApiRequest(401)
  if (isProtectedAdminApiRoute && !isAdmin) return denyApiRequest(403)

  if (isProtectedAdminRoute && !isAdmin) {
    return redirectToLogin()
  }

  return supabaseResponse
}
