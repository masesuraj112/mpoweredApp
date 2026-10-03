-- Rollback (restores the Supabase local default of full access; only needed on a local database):
--   grant all on public.pain_assessment, public.pain_location, public.pain_characteristics
--     to anon, authenticated;

-- Supabase local default privileges give anon and authenticated full access to every new
-- table, while the hosted project does not. Make the privileges explicit so local and
-- hosted match: logged-in users can only read and insert (D13: no editing after
-- submission), and anon has no access. RLS still limits which rows are visible.
revoke all on public.pain_assessment, public.pain_location, public.pain_characteristics
  from anon, authenticated;
grant select, insert on public.pain_assessment, public.pain_location, public.pain_characteristics
  to authenticated;
