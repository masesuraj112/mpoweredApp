-- Rollback:
--   drop function public.save_management_assessment(date, text, text, text, boolean, text[]);

create function public.save_management_assessment(
  p_date date,
  p_exercise text,
  p_emotion text,
  p_otc_medication text,
  p_no_medication boolean,
  p_medications text[]
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer;
  v_created_on date;
  v_start_week date;
  v_exercise text := btrim(p_exercise);
  v_emotion text := nullif(btrim(p_emotion), '');
  v_otc text := nullif(btrim(p_otc_medication), '');
  v_no_medication boolean := coalesce(p_no_medication, false);
  v_medications text[];
  v_submission_id integer;
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  -- +1 day tolerates timezones ahead of UTC; exact "today" is enforced in the app
  if p_date is null or p_date > current_date + 1 then
    raise exception 'FUTURE_DATE' using errcode = 'P0001';
  end if;

  -- Monday of the week containing (created_at::date - 1); one-day tolerance as above
  select u.created_at::date - 1
    into v_created_on
    from public.users u
   where u.users_id = v_users_id;
  v_start_week := v_created_on - (extract(isodow from v_created_on)::int - 1);
  if p_date < v_start_week then
    raise exception 'BEFORE_START' using errcode = 'P0001';
  end if;

  if v_exercise is null or v_exercise = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;

  -- trim, drop nulls/blanks, de-duplicate
  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_medications
    from (select btrim(x) as t from unnest(p_medications) as x) s
   where t is not null and t <> '';

  if v_no_medication and cardinality(v_medications) > 0 then
    raise exception 'MEDICATION_CONFLICT' using errcode = 'P0001';
  end if;

  if exists (select 1 from unnest(v_medications) x where char_length(x) > 100) then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  -- Parent and children in one function body = one transaction. 23505 (second submission in
  -- the same week) is not caught: the client maps it.
  insert into public.personal_management (
    users_id, "date", exercise, emotion, otc_medication, no_medication
  )
  values (v_users_id, p_date, v_exercise, v_emotion, v_otc, v_no_medication)
  returning submission_id into v_submission_id;

  insert into public.personal_management_medication_names (medication_name, submission_id)
  select x, v_submission_id from unnest(v_medications) as x;

  return v_submission_id;
end;
$$;

revoke all on function public.save_management_assessment(date, text, text, text, boolean, text[])
  from public, anon;
grant execute on function public.save_management_assessment(date, text, text, text, boolean, text[])
  to authenticated;
