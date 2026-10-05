-- Rollback: revoke select on public.patients from authenticated;

-- Needed because the users_select policy subqueries public.patients directly,
-- so any select on public.users requires this privilege. RLS (patients_select)
-- still limits rows to the user's own patient record or patients they support.
grant select on public.patients to authenticated;
