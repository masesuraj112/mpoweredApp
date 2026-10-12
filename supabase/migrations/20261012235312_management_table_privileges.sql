-- Rollback (local only; restores the Supabase local default):
--   grant all on public.personal_management, public.personal_management_medication_names
--     to anon, authenticated;

-- RLS only filters rows; the role also needs table privileges. Read and insert only (M3);
-- anon has no access. Revoking first makes local and hosted match.
revoke all on public.personal_management, public.personal_management_medication_names
  from anon, authenticated;
grant select, insert on public.personal_management, public.personal_management_medication_names
  to authenticated;
