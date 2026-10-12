-- Rollback (restores the Supabase local default of full access; only needed on a local database):
--   grant all on public.movement_assessment, public.movement_general_impacts
--     to anon, authenticated;

-- Same approach as 20261003134756_restrict_pain_table_privileges.sql: make the privileges
-- explicit so local and hosted databases match. Logged-in users can read and insert only
-- (no editing after submission) and anon has no access. RLS still limits which rows are
-- visible. movement_condition is not used by the app yet and is left untouched.
revoke all on public.movement_assessment, public.movement_general_impacts
  from anon, authenticated;
grant select, insert on public.movement_assessment, public.movement_general_impacts
  to authenticated;