-- Rollback:
--   drop table public.user_settings;

-- One row per user: their notification choices (Settings > Notifications). Nothing sends reminders
-- yet; this only stores the choices. A missing row means the defaults below.
create table public.user_settings (
  users_id integer primary key references public.users (users_id) on delete cascade,
  assessment_reminders boolean not null default false,
  assessment_every integer not null default 3 check (assessment_every between 1 and 7),
  assessment_unit text not null default 'days' check (assessment_unit in ('days', 'weeks')),
  appointment_reminders boolean not null default false,
  appointment_day_before boolean not null default false,
  appointment_on_day boolean not null default false
);

alter table public.user_settings enable row level security;

create policy user_settings_select on public.user_settings
  for select to authenticated using (users_id = public.current_users_id());
create policy user_settings_insert on public.user_settings
  for insert to authenticated with check (users_id = public.current_users_id());
create policy user_settings_update on public.user_settings
  for update to authenticated
  using (users_id = public.current_users_id())
  with check (users_id = public.current_users_id());

-- Local Supabase grants everything on new tables and the hosted project grants nothing: make both match.
revoke all on public.user_settings from anon, authenticated;
grant select, insert, update on public.user_settings to authenticated;
