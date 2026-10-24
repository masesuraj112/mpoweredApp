-- Rollback:
--   drop function public.save_movement_assessment(date, numeric, text[], text, text, text, text, text);

-- Saves one movement submission and its general impacts in a single call, so the parent and
-- the children commit together or not at all. Normalisation lives in the app; this function
-- enforces invariants only. Unique (users_id, week_start) violations (23505) are deliberately
-- not caught: the client maps them to DUPLICATE_WEEK.
create function public.save_movement_assessment(
  p_date date,
  p_active_hours numeric,
  p_general_impacts text[],
  p_walking text,
  p_lifting text,
  p_sitting text,
  p_standing text,
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
  v_impacts text[];
  v_walking text;
  v_lifting text;
  v_sitting text;
  v_standing text;
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

  if p_active_hours is null or p_active_hours < 0 or p_active_hours > 24 then
    raise exception 'INVALID_HOURS' using errcode = 'P0001';
  end if;

  -- trim, drop nulls/blanks, de-duplicate
  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_impacts
    from (select btrim(x) as t from unnest(p_general_impacts) as x) s
   where t is not null and t <> '';
  if cardinality(v_impacts) = 0 then
    raise exception 'NO_IMPACT' using errcode = 'P0001';
  end if;
  -- movement_general_impacts.impact_statement is varchar(100)
  if exists (select 1 from unnest(v_impacts) x where char_length(x) > 100) then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  v_walking := btrim(p_walking);
  v_lifting := btrim(p_lifting);
  v_sitting := btrim(p_sitting);
  v_standing := btrim(p_standing);
  if v_walking is null or v_walking = ''
     or v_lifting is null or v_lifting = ''
     or v_sitting is null or v_sitting = ''
     or v_standing is null or v_standing = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;

  -- the reflection is optional: blank becomes null
  v_reflection := nullif(btrim(p_reflection), '');

  insert into public.movement_assessment (
    users_id, "date", average_active_hours,
    walking_impact, lifting_impact, sitting_impact, standing_impact, reflection
  )
  values (
    v_users_id, p_date, p_active_hours,
    v_walking, v_lifting, v_sitting, v_standing, v_reflection
  )
  returning submission_id into v_submission_id;

  insert into public.movement_general_impacts (
    impact_statement, movement_assessment_submission_id
  )
  select x, v_submission_id from unnest(v_impacts) as x;

  return v_submission_id;
end;
$$;

revoke all on function public.save_movement_assessment(date, numeric, text[], text, text, text, text, text)
  from public, anon;
grant execute on function public.save_movement_assessment(date, numeric, text[], text, text, text, text, text)
  to authenticated;