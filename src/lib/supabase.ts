import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Lazy singleton — created only in browser, never during SSR
let _client: ReturnType<typeof createBrowserClient> | null = null;

function getClient() {
  if (typeof window === "undefined") {
    // Return a no-op proxy during SSR so imports don't crash
    return new Proxy({} as ReturnType<typeof createBrowserClient>, {
      get: () => () => Promise.resolve({ data: null, error: null }),
    });
  }
  if (!_client) {
    _client = createSupabaseBrowser();
  }
  return _client;
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
});
