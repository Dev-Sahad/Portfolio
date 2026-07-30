-- Restrict portfolio writes to verified owner accounts while retaining public reads.
-- JWT claims are selected once per statement to avoid per-row auth re-evaluation.

alter table public.projects enable row level security;
alter table public.certificates enable row level security;
alter table public.notes enable row level security;
alter table public.webhook_settings enable row level security;

drop policy if exists "public_rw" on public.projects;
drop policy if exists "public_read_projects" on public.projects;
create policy "public_read_projects"
  on public.projects for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_insert_projects" on public.projects;
create policy "admin_insert_projects"
  on public.projects for insert
  to authenticated
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  );

drop policy if exists "admin_update_projects" on public.projects;
create policy "admin_update_projects"
  on public.projects for update
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

drop policy if exists "admin_delete_projects" on public.projects;
create policy "admin_delete_projects"
  on public.projects for delete
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  );

drop policy if exists "Allow authenticated write access" on public.certificates;
drop policy if exists "Allow public read access" on public.certificates;
drop policy if exists "public_rw" on public.certificates;
drop policy if exists "public_read_certificates" on public.certificates;
create policy "public_read_certificates"
  on public.certificates for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_insert_certificates" on public.certificates;
create policy "admin_insert_certificates"
  on public.certificates for insert
  to authenticated
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  );

drop policy if exists "admin_update_certificates" on public.certificates;
create policy "admin_update_certificates"
  on public.certificates for update
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

drop policy if exists "admin_delete_certificates" on public.certificates;
create policy "admin_delete_certificates"
  on public.certificates for delete
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) in (
      'dev.sxhd@gmail.com',
      'msahadk12@gmail.com'
    )
  );

drop policy if exists "Enable read access for all users" on public.notes;
drop policy if exists "public_read_notes" on public.notes;
create policy "public_read_notes"
  on public.notes for select
  to anon, authenticated
  using (true);

revoke all on public.projects from anon, authenticated;
revoke all on public.certificates from anon, authenticated;
revoke all on public.notes from anon, authenticated;
revoke all on public.webhook_settings from anon, authenticated;

grant select on public.projects to anon, authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select on public.certificates to anon, authenticated;
grant select, insert, update, delete on public.certificates to authenticated;
grant select on public.notes to anon, authenticated;
