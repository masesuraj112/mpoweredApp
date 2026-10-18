-- Rollback (restores the Supabase local default of full access; only needed on a local database):
--   grant all on public.personal_care_assessment, public.personal_care_general_activities
--     to anon, authenticated;

-- Same approach as 20261003134756_restrict_pain_table_privileges.sql: make the privileges
-- explicit so local and hosted databases match. Logged-in users can read and insert only
-- (no editing after submission) and anon has no access. RLS still limits which rows are
-- visible.
revoke all on public.personal_care_assessment, public.personal_care_general_activities
  from anon, authenticated;
grant select, insert on public.personal_care_assessment, public.personal_care_general_activities
  to authenticated;