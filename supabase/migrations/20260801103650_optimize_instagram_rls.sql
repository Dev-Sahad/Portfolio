create index if not exists instagram_connections_connected_by_idx
  on public.instagram_connections (connected_by);

drop policy if exists "Authenticated read active Instagram accounts" on public.instagram_accounts;
drop policy if exists "Authenticated read visible Instagram media" on public.instagram_media;
drop policy if exists "Portfolio admins manage Instagram accounts" on public.instagram_accounts;
drop policy if exists "Portfolio admins manage Instagram connections" on public.instagram_connections;
drop policy if exists "Portfolio admins manage Instagram media" on public.instagram_media;

create policy "Authenticated read Instagram accounts"
on public.instagram_accounts for select
to authenticated
using (
  is_active = true
  or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

create policy "Authenticated read Instagram media"
on public.instagram_media for select
to authenticated
using (
  is_visible = true
  or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

create policy "Portfolio admins insert Instagram accounts"
on public.instagram_accounts for insert
to authenticated
with check (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

create policy "Portfolio admins update Instagram accounts"
on public.instagram_accounts for update
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
)
with check (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

create policy "Portfolio admins delete Instagram accounts"
on public.instagram_accounts for delete
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

create policy "Portfolio admins manage Instagram connections"
on public.instagram_connections for all
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
)
with check (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

create policy "Portfolio admins insert Instagram media"
on public.instagram_media for insert
to authenticated
with check (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

create policy "Portfolio admins update Instagram media"
on public.instagram_media for update
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
)
with check (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

create policy "Portfolio admins delete Instagram media"
on public.instagram_media for delete
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce((select auth.jwt()) ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

notify pgrst, 'reload schema';
