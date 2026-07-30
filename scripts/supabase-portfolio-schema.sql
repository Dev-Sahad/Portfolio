-- Portfolio database completion script
-- Safe to run repeatedly in Supabase SQL Editor.
-- Creates the application tables and Storage buckets that are not covered by
-- the original project schema, then applies explicit Data API grants and RLS.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Guestbook comments
-- ---------------------------------------------------------------------------

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 100),
  comment text not null check (char_length(comment) between 1 and 1000),
  image_url text,
  likes integer not null default 0 check (likes >= 0),
  replies jsonb not null default '[]'::jsonb,
  is_pinned boolean not null default false,
  liked_by_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_pinned_created_idx
  on public.comments (is_pinned desc, created_at desc);

-- ---------------------------------------------------------------------------
-- Technology collections
-- ---------------------------------------------------------------------------

create table if not exists public.technologies (
  id bigint generated always as identity primary key,
  name text not null,
  image_url text,
  icon text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists technologies_name_unique
  on public.technologies (lower(name));

create table if not exists public.tech_stack (
  id bigint generated always as identity primary key,
  name text not null,
  logo_url text,
  category text,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tech_stack_name_unique
  on public.tech_stack (lower(name));

create index if not exists tech_stack_display_order_idx
  on public.tech_stack (display_order, created_at);

-- ---------------------------------------------------------------------------
-- Editable 3D hero words
-- ---------------------------------------------------------------------------

create table if not exists public.scene3d_words (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) between 1 and 80),
  color text not null default '#ffffff'
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  "fontSize" double precision not null default 1.8
    check ("fontSize" between 0.8 and 4),
  opacity double precision not null default 0.75
    check (opacity between 0.1 and 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- These settings fields are used by the admin visual/profile editor.
alter table public.site_settings
  add column if not exists profile_image_url text,
  add column if not exists theme_accent_color text not null default '#ffffff',
  add column if not exists theme_background_color text not null default '#0a0a0a',
  add column if not exists profile_animation_enabled boolean not null default true,
  add column if not exists profile_animation_speed numeric not null default 1;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.comments enable row level security;
alter table public.technologies enable row level security;
alter table public.tech_stack enable row level security;
alter table public.scene3d_words enable row level security;

drop policy if exists "public_read_comments" on public.comments;
create policy "public_read_comments"
  on public.comments for select
  to anon, authenticated
  using (true);

drop policy if exists "public_create_comments" on public.comments;
create policy "public_create_comments"
  on public.comments for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 100
    and char_length(comment) between 1 and 1000
    and likes = 0
    and replies = '[]'::jsonb
    and is_pinned = false
    and liked_by_admin = false
  );

drop policy if exists "public_like_comments" on public.comments;
create policy "public_like_comments"
  on public.comments for update
  to anon
  using (likes >= 0)
  with check (likes >= 0);

drop policy if exists "admin_manage_comments" on public.comments;
create policy "admin_manage_comments"
  on public.comments for all
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  );

drop policy if exists "public_read_technologies" on public.technologies;
create policy "public_read_technologies"
  on public.technologies for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_manage_technologies" on public.technologies;
create policy "admin_manage_technologies"
  on public.technologies for all
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  );

drop policy if exists "public_read_tech_stack" on public.tech_stack;
create policy "public_read_tech_stack"
  on public.tech_stack for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_manage_tech_stack" on public.tech_stack;
create policy "admin_manage_tech_stack"
  on public.tech_stack for all
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  );

drop policy if exists "public_read_scene3d_words" on public.scene3d_words;
create policy "public_read_scene3d_words"
  on public.scene3d_words for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_manage_scene3d_words" on public.scene3d_words;
create policy "admin_manage_scene3d_words"
  on public.scene3d_words for all
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  );

-- Explicit grants are required for tables created outside the Table Editor.
revoke all on public.comments from anon, authenticated;
revoke all on public.technologies from anon, authenticated;
revoke all on public.tech_stack from anon, authenticated;
revoke all on public.scene3d_words from anon, authenticated;

grant select, insert on public.comments to anon;
grant update (likes) on public.comments to anon;
grant select, insert, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;

grant select on public.technologies to anon, authenticated;
grant insert, update, delete on public.technologies to authenticated;
grant all on public.technologies to service_role;

grant select on public.tech_stack to anon, authenticated;
grant insert, update, delete on public.tech_stack to authenticated;
grant all on public.tech_stack to service_role;

grant select on public.scene3d_words to anon, authenticated;
grant insert, update, delete on public.scene3d_words to authenticated;
grant all on public.scene3d_words to service_role;

grant usage, select on sequence public.comments_id_seq
  to anon, authenticated, service_role;
grant usage, select on sequence public.technologies_id_seq
  to authenticated, service_role;
grant usage, select on sequence public.tech_stack_id_seq
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'comments',
    'technologies',
    'tech_stack',
    'scene3d_words'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        table_name
      );
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- Storage buckets and policies
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('comments', 'comments', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('certificates', 'certificates', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('technologies', 'technologies', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('tech-stack', 'tech-stack', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('project-images', 'project-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_portfolio_assets" on storage.objects;
create policy "public_read_portfolio_assets"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id in (
      'comments',
      'certificates',
      'technologies',
      'tech-stack',
      'project-images'
    )
  );

drop policy if exists "public_upload_comment_images" on storage.objects;
create policy "public_upload_comment_images"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'comments');

drop policy if exists "admin_manage_portfolio_assets" on storage.objects;
create policy "admin_manage_portfolio_assets"
  on storage.objects for all
  to authenticated
  using (
    bucket_id in (
      'comments',
      'certificates',
      'technologies',
      'tech-stack',
      'project-images'
    )
    and (
      ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
      or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
        'dev.sxhd@gmail.com',
        'msahadk12@gmail.com'
      )
    )
  )
  with check (
    bucket_id in (
      'comments',
      'certificates',
      'technologies',
      'tech-stack',
      'project-images'
    )
    and (
      ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
      or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
        'dev.sxhd@gmail.com',
        'msahadk12@gmail.com'
      )
    )
  );

-- Seed the 3D scene only when the table is empty.
insert into public.scene3d_words (text, color, "fontSize", opacity)
select seed.text, seed.color, seed.font_size, seed.opacity
from (
  values
    ('Design', '#ffffff', 1.8::double precision, 0.75::double precision),
    ('Frontend', '#aaaaff', 2.0, 0.80),
    ('React', '#ffffff', 1.8, 0.70),
    ('TypeScript', '#88aaff', 1.6, 0.70),
    ('設計', '#ffffff', 2.2, 0.60),
    ('開発', '#aaaaff', 2.0, 0.60),
    ('Three.js', '#ffffff', 1.6, 0.70),
    ('Tailwind', '#66ffaa', 1.6, 0.65),
    ('Next.js', '#ffffff', 1.8, 0.75),
    ('Creative', '#ffcc44', 1.8, 0.70),
    ('UI / UX', '#ff6688', 1.8, 0.70),
    ('Portfolio', '#ffffff', 1.6, 0.65)
) as seed(text, color, font_size, opacity)
where not exists (select 1 from public.scene3d_words);
