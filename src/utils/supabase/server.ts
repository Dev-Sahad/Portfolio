import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const noopResult = { data: [], error: null, count: 0, status: 200 }

const createNoopQuery = () => {
  const query: any = {
    select: () => query,
    order: () => query,
    eq: () => query,
    maybeSingle: async () => ({ ...noopResult, data: null }),
    single: async () => ({ ...noopResult, data: null }),
    then: (resolve: any) => {
      resolve(noopResult)
      return Promise.resolve(noopResult)
    },
    catch: () => query,
    finally: () => query,
  }

  return query
}

const createNoopServerClient = () => {
  const query = createNoopQuery()

  return {
    from: () => query,
    auth: {
      exchangeCodeForSession: async () => ({
        data: null,
        error: new Error('Missing Supabase environment variables'),
      }),
    },
  } as unknown as ReturnType<typeof createServerClient>
}

export const createClient = async () => {
  let cookieStore: any
  try {
    cookieStore = await cookies()
  } catch {
    cookieStore = {
      get: () => undefined,
      set: () => {},
      delete: () => {},
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('Missing Supabase environment variables on server. Using no-op client.')
    return createNoopServerClient()
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get?.(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set?.({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set?.({ name, value: '', ...options }); } catch {}
        },
      },
    }
  )
}
