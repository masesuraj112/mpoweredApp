-- Rollback: alter table public.users drop column user_type;

-- Existing rows are backfilled with 'patient' by the default. Support persons get a users
-- row only (see create_profile); the patient links them later through support_persons.
alter table public.users
  add column user_type text not null default 'patient'
  constraint chk_users_user_type check (user_type in ('patient', 'support_person'));
