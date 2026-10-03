-- Rollback: re-run the function body from 20261003015852_save_pain_assessment_validation.sql
-- with create or replace (same signature). Grants are preserved by create or replace.

create or replace function public.save_pain_assessment(
  p_date date,
  p_current int,
  p_mildest int,
  p_worst int,
  p_average int,
  p_locations text[],
  p_characteristics text[]
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
  v_locations text[];
  v_characteristics text[];
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

  -- trim, drop nulls/blanks, de-duplicate (no title-casing: done in the app)
  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_locations
    from (select btrim(x) as t from unnest(p_locations) as x) s
   where t is not null and t <> '';
  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_characteristics
    from (select btrim(x) as t from unnest(p_characteristics) as x) s
   where t is not null and t <> '';

  if cardinality(v_locations) = 0 then
    raise exception 'NO_LOCATION' using errcode = 'P0001';
  end if;
  if cardinality(v_characteristics) = 0 then
    raise exception 'NO_CHARACTERISTIC' using errcode = 'P0001';
  end if;

  if exists (select 1 from unnest(v_locations) x where char_length(x) > 45)
     or exists (select 1 from unnest(v_characteristics) x where char_length(x) > 45) then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  -- Parent and children in one function body = one transaction. Unique (users_id,
  -- week_start) violations (23505) and pain level constraint failures (23514, 23502)
  -- are deliberately not caught: the client maps them.
  insert into public.pain_assessment (
    users_id, "date",
    current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level
  )
  values (v_users_id, p_date, p_current, p_mildest, p_worst, p_average)
  returning submission_id into v_submission_id;

  insert into public.pain_location (pain_location, pain_assessment_submission_id)
  select x, v_submission_id from unnest(v_locations) as x;

  insert into public.pain_characteristics (pain_characteristic, pain_assessment_submission_id)
  select x, v_submission_id from unnest(v_characteristics) as x;

  return v_submission_id;
end;
$$;
