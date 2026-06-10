import { createBrowserClient } from '@supabase/ssr'

const noopResult = { data: [], error: null, count: 0, status: 200 }

const createNoopQuery = () => {
  const query: any = {
    select: () => query,
    order: () => query,
    then: (resolve: any) => {
      resolve(noopResult)
      return Promise.resolve(noopResult)
    },
    catch: () => query,
    finally: () => query,
  }

  return query
}

const createNoopClient = () => {
  const query = createNoopQuery()
  return {
    from: () => query,
    auth: {
      signInWithPassword: async () => ({
        data: null,
        error: new Error('Missing Supabase environment variables'),
      }),
    },
  } as unknown as ReturnType<typeof createBrowserClient>
}

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn(
      'Missing Supabase environment variables in browser. Using no-op client.'
    )
    return createNoopClient()
  }

  return createBrowserClient(url, key)
}
