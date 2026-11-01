-- Rollback:
--   drop function public.save_personal_care_assessment(date, text[], text, text, text);

-- Saves one personal care submission and its general activities in a single call, so the
-- parent and the children commit together or not at all. Normalisation (casing, canonical
-- spelling) lives in the app; this function enforces invariants only.
-- Unique (users_id, week_start) violations (23505) are deliberately not caught: the client
-- maps them to DUPLICATE_WEEK.
create function public.save_personal_care_assessment(
  p_date date,
  p_general_activities text[],
  p_washing_dressing text,
  p_sleeping text,
  p_reflection text
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
  v_activities text[];
  v_washing text;
  v_sleeping text;
  v_reflection text;
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

  -- trim, drop nulls/blanks, de-duplicate
  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_activities
    from (select btrim(x) as t from unnest(p_general_activities) as x) s
   where t is not null and t <> '';
  if cardinality(v_activities) = 0 then
    raise exception 'NO_ACTIVITY' using errcode = 'P0001';
  end if;
  -- personal_care_general_activities.activity_statement is varchar(100)
  if exists (select 1 from unnest(v_activities) x where char_length(x) > 100) then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  v_washing := btrim(p_washing_dressing);
  v_sleeping := btrim(p_sleeping);
  if v_washing is null or v_washing = '' or v_sleeping is null or v_sleeping = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;

  -- the reflection is optional: blank becomes null
  v_reflection := nullif(btrim(p_reflection), '');

  insert into public.personal_care_assessment (
    users_id, "date", washing_dressing, sleeping, reflection
  )
  values (v_users_id, p_date, v_washing, v_sleeping, v_reflection)
  returning submission_id into v_submission_id;

  insert into public.personal_care_general_activities (
    activity_statement, personal_care_assessment_submission_id
  )
  select x, v_submission_id from unnest(v_activities) as x;

  return v_submission_id;
end;
$$;

revoke all on function public.save_personal_care_assessment(date, text[], text, text, text)
  from public, anon;
grant execute on function public.save_personal_care_assessment(date, text[], text, text, text)
  to authenticated;