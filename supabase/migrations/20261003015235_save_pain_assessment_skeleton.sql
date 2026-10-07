-- Rollback:
--   drop function public.save_pain_assessment(date, int, int, int, int, text[], text[]);

create function public.save_pain_assessment(
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
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  -- placeholder: validation and inserts follow in later migrations
  return null::int;
end;
$$;

revoke all on function public.save_pain_assessment(date, int, int, int, int, text[], text[])
  from public, anon;
grant execute on function public.save_pain_assessment(date, int, int, int, int, text[], text[])
  to authenticated;
