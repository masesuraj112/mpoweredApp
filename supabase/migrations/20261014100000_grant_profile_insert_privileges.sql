-- Rollback (restores the Supabase local default of full access; only needed on a local database):
--   grant all on public.users, public.patients, public.patient_musko_skeletal_pain
--     to anon, authenticated;

-- RLS only filters rows; the role also needs table privileges. Revoking first makes local and
-- hosted match (Supabase local default privileges grant everything to new tables). Logged-in
-- users can read and insert only (profile writes go through create_profile), and anon has no
-- access. select on users and patients was granted by earlier migrations; the revoke removes it,
-- so it is granted again here.
revoke all on public.users, public.patients, public.patient_musko_skeletal_pain
  from anon, authenticated;
grant select, insert on public.users, public.patients, public.patient_musko_skeletal_pain
  to authenticated;
