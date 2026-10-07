-- Rollback:
--   drop function public.save_social_health_assessment(date, text, text, int, int, int, text, text);

create function public.save_social_health_assessment(
  p_date date,
  p_social_life text,
  p_travelling text,
  p_mood int,
  p_relation_with_others int,
  p_enjoyment_of_life int,
  p_mood_overall text,
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
  v_social_life text := btrim(p_social_life);
  v_travelling text := btrim(p_travelling);
  v_reflection text := nullif(btrim(p_reflection), '');
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

  -- invariants only: the option lists themselves are checked in the app (S13)
  if v_social_life is null or v_social_life = ''
     or v_travelling is null or v_travelling = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;

  -- Slider range (chk_mood, chk_relation_with_others, chk_enjoyment_of_life) and
  -- mood_overall (chk_mood_overall) fail with 23514; a NULL slider fails with 23502;
  -- a second submission in the same week fails with 23505. None are caught: the client maps them.
  insert into public.social_health_assessment (
    users_id, "date", social_life, travelling,
    mood, relation_with_others, enjoyment_of_life, mood_overall, reflection
  )
  values (
    v_users_id, p_date, v_social_life, v_travelling,
    p_mood, p_relation_with_others, p_enjoyment_of_life, p_mood_overall, v_reflection
  )
  returning submission_id into v_submission_id;

  return v_submission_id;
end;
$$;

revoke all on function public.save_social_health_assessment(date, text, text, int, int, int, text, text)
  from public, anon;
grant execute on function public.save_social_health_assessment(date, text, text, int, int, int, text, text)
  to authenticated;
