-- Run once in the Supabase SQL editor before using the new Admin webhook fields.
alter table public.webhook_settings
  add column if not exists contact_webhook_url text,
  add column if not exists comments_webhook_url text,
  add column if not exists contact_custom_message text,
  add column if not exists comments_custom_message text;

-- Webhook URLs are secrets: only server-side service-role code may read/write them.
drop policy if exists "public_rw" on public.webhook_settings;
