alter table public.projects
  add column if not exists architecture text,
  add column if not exists decisions text,
  add column if not exists demo_video_url text,
  add column if not exists featured_for text[] not null default '{}';

create table if not exists public.hiring_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text,
  role text not null default 'recruiter',
  opportunity_type text not null default 'full-time',
  budget text,
  timeline text,
  message text not null check (char_length(message) between 10 and 4000),
  source_path text,
  status text not null default 'new' check (status in ('new','reviewing','contacted','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  category text not null default 'build',
  link_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_translations (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
  namespace text not null default 'common',
  translations jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  native_name text,
  direction text not null default 'ltr' check (direction in ('ltr','rtl')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(locale, namespace)
);

create table if not exists public.seo_settings (
  id integer primary key default 1 check (id = 1),
  site_title text not null default 'Muhammad Sahad — Frontend Developer',
  description text not null default 'Frontend developer creating modern, responsive, and thoughtfully animated web experiences.',
  keywords text[] not null default array['frontend developer','Next.js','React','portfolio'],
  og_image_url text,
  social_title text,
  social_description text,
  allow_indexing boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.seo_settings (id) values (1) on conflict (id) do nothing;

alter table public.hiring_inquiries enable row level security;
alter table public.portfolio_updates enable row level security;
alter table public.portfolio_translations enable row level security;
alter table public.seo_settings enable row level security;

drop policy if exists "Public can read published portfolio updates" on public.portfolio_updates;
create policy "Public can read published portfolio updates" on public.portfolio_updates
  for select using (published = true);

drop policy if exists "Public can read enabled translations" on public.portfolio_translations;
create policy "Public can read enabled translations" on public.portfolio_translations
  for select using (enabled = true);

drop policy if exists "Public can read SEO settings" on public.seo_settings;
create policy "Public can read SEO settings" on public.seo_settings
  for select using (true);

revoke all on public.hiring_inquiries from anon, authenticated;
grant select on public.portfolio_updates, public.portfolio_translations, public.seo_settings to anon, authenticated;

insert into public.portfolio_updates (title, summary, category, published, published_at)
values
  ('Portfolio Platform Studio', 'Launched recruiter focus pages, interactive project demos, universal localization, accessibility controls, and a smarter hiring funnel.', 'launch', true, now()),
  ('Case studies, upgraded', 'Projects now support architecture notes, engineering decisions, outcome metrics, and role-specific featuring.', 'case-study', true, now() - interval '1 day')
on conflict do nothing;
