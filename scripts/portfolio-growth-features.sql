-- Portfolio growth features: case studies, testimonials, publishing, analytics,
-- contact inbox, revision history, and operational controls.

alter table public.projects
  add column if not exists slug text,
  add column if not exists problem text,
  add column if not exists project_role text,
  add column if not exists solution text,
  add column if not exists challenges text,
  add column if not exists results text,
  add column if not exists metrics jsonb not null default '[]'::jsonb,
  add column if not exists featured_order integer not null default 100,
  add column if not exists is_featured boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists projects_slug_unique
  on public.projects (slug) where slug is not null;
create index if not exists projects_featured_order_idx
  on public.projects (is_featured desc, featured_order asc, created_at desc);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  company text,
  quote text not null,
  avatar_url text,
  source_url text,
  rating integer not null default 5 check (rating between 1 and 5),
  approved boolean not null default false,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_url text,
  tags text[] not null default '{}',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_published_at_idx
  on public.posts (published desc, published_at desc);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  path text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_type_created_idx
  on public.analytics_events (event_type, created_at desc);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'replied', 'archived')),
  page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

create table if not exists public.content_revisions (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id text not null,
  action text not null check (action in ('create', 'update', 'delete', 'restore')),
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists content_revisions_entity_created_idx
  on public.content_revisions (entity_type, entity_id, created_at desc);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  owner_name text not null default 'Muhammad Sahad',
  hero_title_primary text not null default 'Frontend',
  hero_title_secondary text not null default 'Developer',
  hero_role text not null default 'Junior Programmer',
  hero_description text not null default 'Creating modern websites with a clean, responsive, and elegant appearance.',
  availability_text text not null default 'Available for work',
  about_eyebrow text not null default 'ABOUT ME',
  about_title text not null default E'Muhammad\nSahad',
  about_description text not null default 'Front-End Developer & UI Enthusiast.',
  about_quote text not null default 'Turning ideas into clean, modern, and meaningful digital experiences.',
  cv_url text,
  github_url text,
  linkedin_url text,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  contact_heading text not null default 'Contact Me',
  contact_subheading text not null default 'Have something in mind? Send a message and let''s connect.',
  updated_at timestamptz not null default now()
);

alter table public.site_settings
  add column if not exists maintenance_mode boolean not null default false,
  add column if not exists maintenance_message text not null default 'The portfolio is receiving an update. Please check back shortly.',
  add column if not exists booking_url text,
  add column if not exists show_testimonials boolean not null default true,
  add column if not exists assistant_enabled boolean not null default true,
  add column if not exists performance_mode text not null default 'auto'
    check (performance_mode in ('auto', 'full', 'reduced'));

alter table public.testimonials enable row level security;
alter table public.posts enable row level security;
alter table public.analytics_events enable row level security;
alter table public.contact_messages enable row level security;
alter table public.content_revisions enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "public_read_approved_testimonials" on public.testimonials;
create policy "public_read_approved_testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (approved = true);

drop policy if exists "public_read_published_posts" on public.posts;
create policy "public_read_published_posts"
  on public.posts for select
  to anon, authenticated
  using (published = true);

drop policy if exists "public_read_site_settings" on public.site_settings;
create policy "public_read_site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

revoke all on public.testimonials from anon, authenticated;
revoke all on public.posts from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;
revoke all on public.content_revisions from anon, authenticated;
revoke all on public.site_settings from anon, authenticated;

grant select on public.testimonials to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant all on public.testimonials to service_role;
grant all on public.posts to service_role;
grant all on public.analytics_events to service_role;
grant all on public.contact_messages to service_role;
grant all on public.content_revisions to service_role;
grant all on public.site_settings to service_role;
grant usage, select on sequence public.analytics_events_id_seq to service_role;
grant usage, select on sequence public.content_revisions_id_seq to service_role;

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;
