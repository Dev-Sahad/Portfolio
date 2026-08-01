-- Instagram account, credential, and media storage for authenticated Graph API sync.

create table if not exists public.instagram_accounts (
  id uuid primary key default gen_random_uuid(),
  instagram_user_id text not null unique,
  username text not null,
  name text,
  biography text,
  website text,
  profile_picture_url text,
  account_type text,
  followers_count bigint not null default 0 check (followers_count >= 0),
  follows_count bigint not null default 0 check (follows_count >= 0),
  media_count bigint not null default 0 check (media_count >= 0),
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_connections (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.instagram_accounts(id) on delete cascade,
  access_token text not null,
  token_type text not null default 'bearer',
  scopes text[] not null default '{}'::text[],
  expires_at timestamptz,
  connected_by uuid references auth.users(id) on delete set null,
  last_refreshed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_media (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.instagram_accounts(id) on delete cascade,
  instagram_media_id text not null,
  media_type text not null,
  media_product_type text not null default 'FEED',
  media_url text,
  thumbnail_url text,
  permalink text not null,
  caption text,
  username text,
  posted_at timestamptz,
  like_count bigint not null default 0 check (like_count >= 0),
  comments_count bigint not null default 0 check (comments_count >= 0),
  children jsonb not null default '[]'::jsonb,
  is_visible boolean not null default true,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, instagram_media_id)
);

create index if not exists instagram_media_account_posted_idx
  on public.instagram_media (account_id, posted_at desc);
create index if not exists instagram_media_product_posted_idx
  on public.instagram_media (media_product_type, posted_at desc);
create index if not exists instagram_media_visible_posted_idx
  on public.instagram_media (is_visible, posted_at desc);

alter table public.instagram_accounts enable row level security;
alter table public.instagram_connections enable row level security;
alter table public.instagram_media enable row level security;

revoke all on table public.instagram_accounts from anon, authenticated;
revoke all on table public.instagram_connections from anon, authenticated;
revoke all on table public.instagram_media from anon, authenticated;

grant select on table public.instagram_accounts to anon;
grant select on table public.instagram_media to anon;
grant select, insert, update, delete on table public.instagram_accounts to authenticated;
grant select, insert, update, delete on table public.instagram_connections to authenticated;
grant select, insert, update, delete on table public.instagram_media to authenticated;
grant select, insert, update, delete on table public.instagram_accounts to service_role;
grant select, insert, update, delete on table public.instagram_connections to service_role;
grant select, insert, update, delete on table public.instagram_media to service_role;

drop policy if exists "Public read active Instagram accounts" on public.instagram_accounts;
create policy "Public read active Instagram accounts"
on public.instagram_accounts for select
to anon
using (is_active = true);

drop policy if exists "Public read visible Instagram media" on public.instagram_media;
create policy "Public read visible Instagram media"
on public.instagram_media for select
to anon
using (is_visible = true);

drop policy if exists "Authenticated read active Instagram accounts" on public.instagram_accounts;
create policy "Authenticated read active Instagram accounts"
on public.instagram_accounts for select
to authenticated
using (
  is_active = true
  or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

drop policy if exists "Authenticated read visible Instagram media" on public.instagram_media;
create policy "Authenticated read visible Instagram media"
on public.instagram_media for select
to authenticated
using (
  is_visible = true
  or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

drop policy if exists "Portfolio admins manage Instagram accounts" on public.instagram_accounts;
create policy "Portfolio admins manage Instagram accounts"
on public.instagram_accounts for all
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
)
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

drop policy if exists "Portfolio admins manage Instagram connections" on public.instagram_connections;
create policy "Portfolio admins manage Instagram connections"
on public.instagram_connections for all
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
)
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

drop policy if exists "Portfolio admins manage Instagram media" on public.instagram_media;
create policy "Portfolio admins manage Instagram media"
on public.instagram_media for all
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
)
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('dev.sxhd@gmail.com', 'msahadk12@gmail.com')
);

notify pgrst, 'reload schema';
