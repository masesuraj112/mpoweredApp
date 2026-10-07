-- Rollback:
--   revoke select on public.users from authenticated;
--   revoke select, insert on public.pain_assessment, public.pain_location,
--     public.pain_characteristics from authenticated;

-- RLS only filters rows; the role also needs table privileges. No update/delete
-- is granted on purpose (D13: no editing after submission).
grant select on public.users to authenticated;
grant select, insert on public.pain_assessment to authenticated;
grant select, insert on public.pain_location to authenticated;
grant select, insert on public.pain_characteristics to authenticated;
