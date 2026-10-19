-- Rollback (restores the Supabase local default of full access; only needed on a local database):
--   grant all on public.social_health_assessment to anon, authenticated;

-- RLS only filters rows; the role also needs table privileges. Logged-in users can read and
-- insert only (S3: no editing after submission), and anon has no access. Revoking first makes
-- local and hosted match (Supabase local default privileges grant everything to new tables).
revoke all on public.social_health_assessment from anon, authenticated;
grant select, insert on public.social_health_assessment to authenticated;
