alter table public.site_settings
  add column if not exists profile_image_url text,
  add column if not exists theme_accent_color text default '#ffffff',
  add column if not exists theme_background_color text default '#0a0a0a',
  add column if not exists profile_animation_enabled boolean default true,
  add column if not exists profile_animation_speed numeric default 1;
