-- Rollback:
--   drop function public.update_profile(text, int);
--   revoke update (name) on public.users from authenticated;
--   revoke update (year_of_birth) on public.patients from authenticated;

-- Lets a signed-in user change their own name, and a patient their year of birth. Same checks as
-- create_profile. RLS (users_update, patients_update) limits both updates to the caller's own row.
create function public.update_profile(p_name text, p_year_of_birth int)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_name text := btrim(p_name);
begin
  if auth.uid() is null then
    raise exception 'NO_SESSION' using errcode = 'P0001';
  end if;
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_name is null or v_name = '' or char_length(v_name) > 45 then
    raise exception 'INVALID_NAME' using errcode = 'P0001';
  end if;
  if p_year_of_birth is not null
     and (p_year_of_birth < 1900 or p_year_of_birth > extract(year from current_date)::int) then
    raise exception 'INVALID_YEAR' using errcode = 'P0001';
  end if;

  update public.users set name = v_name where users_id = v_users_id;
  -- A support person has no patients row, so this changes nothing for them.
  update public.patients set year_of_birth = p_year_of_birth::smallint where users_id = v_users_id;
end;
$$;

revoke all on function public.update_profile(text, int) from public, anon;
grant execute on function public.update_profile(text, int) to authenticated;

-- The function runs as the caller, so the caller needs these two columns, and only these.
grant update (name) on public.users to authenticated;
grant update (year_of_birth) on public.patients to authenticated;
