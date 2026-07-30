import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/adminAccess";

function getSafeAdminPath(value: string | null) {
  return value?.startsWith('/admin/') && !value.startsWith('//')
    ? value
    : '/admin/dashboard'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeAdminPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (isAdminUser(user)) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`)
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=callback`);
}
