import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminUser } from '@/lib/adminAccess'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isAdminLoginRoute = request.nextUrl.pathname === '/admin/login'
  const isProtectedAdminRoute =
    request.nextUrl.pathname.startsWith('/admin') &&
    !isAdminLoginRoute
  const protectedAdminApiRoutes = new Set([
    '/api/add-sample-certificates',
    '/api/import-github-projects',
    '/api/seed-certificates',
    '/api/setup-db',
  ])
  const isProtectedAdminApiRoute =
    protectedAdminApiRoutes.has(request.nextUrl.pathname) ||
    (request.nextUrl.pathname === '/api/visitors' && request.method === 'GET')
  const isPublicVisitorRequest =
    request.nextUrl.pathname === '/api/visitors' && request.method !== 'GET'

  const redirectToLogin = () => {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.search = ''
    const redirect = NextResponse.redirect(loginUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  const redirectToDashboard = () => {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/admin/dashboard'
    dashboardUrl.search = ''
    const redirect = NextResponse.redirect(dashboardUrl)
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

  if (isPublicVisitorRequest) return supabaseResponse

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
  const isAdmin = isAdminUser(user)

  if (isProtectedAdminApiRoute && !user) return denyApiRequest(401)
  if (isProtectedAdminApiRoute && !isAdmin) return denyApiRequest(403)

  if (isProtectedAdminRoute && !isAdmin) {
    return redirectToLogin()
  }

  if (isAdminLoginRoute && isAdmin) {
    return redirectToDashboard()
  }

  return supabaseResponse
}
