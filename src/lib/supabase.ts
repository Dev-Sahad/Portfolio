import { createBrowserClient } from "@supabase/ssr";

const createNoopClient = () => {
  const noopResult = { data: null, error: null, count: 0, status: 200 };
  let noopProxy: any;
  const noopFn: any = (..._args: any[]) => noopProxy;
  noopFn.then = (resolve: any) => resolve(noopResult);
  noopFn.catch = () => noopProxy;
  noopFn.finally = () => noopProxy;

  noopProxy = new Proxy(noopFn, {
    get(target, prop) {
      if (prop === "then") return target.then;
      if (prop === "catch") return target.catch;
      if (prop === "finally") return target.finally;
      if (prop === Symbol.toStringTag) return "Promise";
      return noopProxy;
    },
    apply() {
      return noopProxy;
    },
  });

  return noopProxy as unknown as ReturnType<typeof createBrowserClient>;
};

export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn(
      "Missing Supabase environment variables. Falling back to a no-op browser client."
    );
    return createNoopClient();
  }

  return createBrowserClient(url, key);
}

// Lazy singleton — created only in browser, never during SSR
let _client: ReturnType<typeof createBrowserClient> | null = null;

function getClient() {
  if (typeof window === "undefined") {
    // Return a no-op proxy during SSR so imports don't crash
    return createNoopClient();
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
