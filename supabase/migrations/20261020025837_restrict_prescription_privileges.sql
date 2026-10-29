-- Rollback:
--   grant select, insert, update on public.medications, public.dosage to authenticated;

-- Remove Supabase local default grants so local and hosted privilege behavior matches.
revoke all on public.medications, public.dosage from anon, authenticated;
grant select, insert, update on public.medications, public.dosage to authenticated;