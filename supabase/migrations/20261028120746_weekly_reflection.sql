-- Rollback:
--   drop function public.save_weekly_reflection(date, text, boolean);
--   drop table public.weekly_reflection;

-- One free-text reflection per user per week (Monday start), shown on the home page.
-- Unlike the assessments it can be edited: saving again in the same week replaces the text.
-- A draft (saved when the user leaves with "Back to Home") has is_complete = false.
-- The old patient_reflection table is left untouched.
create table public.weekly_reflection (
  reflection_id integer generated always as identity primary key,
  users_id integer not null references public.users (users_id),
  week_start date not null,
  entry text not null,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_reflection_user_week_key unique (users_id, week_start),
  constraint chk_week_start_monday check (extract(isodow from week_start) = 1),
  constraint chk_entry_not_blank check (btrim(entry) <> '')
);

alter table public.weekly_reflection enable row level security;

create policy weekly_reflection_select on public.weekly_reflection
  for select to authenticated using (users_id = public.current_users_id());
create policy weekly_reflection_insert on public.weekly_reflection
  for insert to authenticated with check (users_id = public.current_users_id());
create policy weekly_reflection_update on public.weekly_reflection
  for update to authenticated
  using (users_id = public.current_users_id())
  with check (users_id = public.current_users_id());

-- No delete and no anon access. Revoking first makes local and hosted match.
revoke all on public.weekly_reflection from anon, authenticated;
grant select, insert, update on public.weekly_reflection to authenticated;

create function public.save_weekly_reflection(p_date date, p_entry text, p_is_complete boolean)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer;
  v_created_on date;
  v_start_week date;
  v_week_start date;
  v_entry text := btrim(p_entry);
  v_reflection_id integer;
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  -- +1 day tolerates timezones ahead of UTC; exact "today" is enforced in the app
  if p_date is null or p_date > current_date + 1 then
    raise exception 'FUTURE_DATE' using errcode = 'P0001';
  end if;

  select u.created_at::date - 1 into v_created_on
    from public.users u where u.users_id = v_users_id;
  v_start_week := v_created_on - (extract(isodow from v_created_on)::int - 1);
  if p_date < v_start_week then
    raise exception 'BEFORE_START' using errcode = 'P0001';
  end if;

  if v_entry is null or v_entry = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;
  -- 200-word cap, counted the same way as countWords() in the app
  if array_length(regexp_split_to_array(v_entry, '\s+'), 1) > 200 then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  v_week_start := p_date - (extract(isodow from p_date)::int - 1);

  insert into public.weekly_reflection (users_id, week_start, entry, is_complete)
  values (v_users_id, v_week_start, v_entry, coalesce(p_is_complete, false))
  on conflict (users_id, week_start)
    -- once finished it stays finished: a later Back-save keeps it done
    do update set entry = excluded.entry,
                  is_complete = weekly_reflection.is_complete or excluded.is_complete,
                  updated_at = now()
  returning reflection_id into v_reflection_id;

  return v_reflection_id;
end;
$$;

revoke all on function public.save_weekly_reflection(date, text, boolean) from public, anon;
grant execute on function public.save_weekly_reflection(date, text, boolean) to authenticated;
