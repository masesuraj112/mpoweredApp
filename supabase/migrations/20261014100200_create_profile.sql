-- Rollback:
--   drop function public.create_profile(text, text, text, int, text[], text, text);

create function public.create_profile(
  p_name text,
  p_user_type text,
  p_sex text,
  p_year_of_birth int,
  p_conditions text[],
  p_other_conditions text,
  p_phone text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_auth_id uuid := auth.uid();
  v_name text := btrim(p_name);
  v_other_conditions text := nullif(btrim(p_other_conditions), '');
  v_conditions text[] := '{}';
  v_users_id integer;
  v_patient_id integer;
begin
  if v_auth_id is null then
    raise exception 'NO_SESSION' using errcode = 'P0001';
  end if;

  if public.current_users_id() is not null then
    raise exception 'PROFILE_EXISTS' using errcode = 'P0001';
  end if;

  if v_name is null or v_name = '' or char_length(v_name) > 45 then
    raise exception 'INVALID_NAME' using errcode = 'P0001';
  end if;

  if p_user_type is null or p_user_type not in ('patient', 'support_person') then
    raise exception 'INVALID_USER_TYPE' using errcode = 'P0001';
  end if;

  -- E.164 Australian mobile; fits users.phone_number varchar(12) exactly
  if p_phone is null or p_phone !~ '^\+614[0-9]{8}$' then
    raise exception 'INVALID_PHONE' using errcode = 'P0001';
  end if;

  -- Support persons get a users row only; sex, year and conditions are ignored for them.
  if p_user_type = 'patient' then
    if p_sex is null or p_sex not in ('Female', 'Male', 'Prefer not to say') then
      raise exception 'INVALID_SEX' using errcode = 'P0001';
    end if;

    if p_year_of_birth is not null
       and (p_year_of_birth < 1900 or p_year_of_birth > extract(year from current_date)::int) then
      raise exception 'INVALID_YEAR' using errcode = 'P0001';
    end if;

    if exists (
      select 1
        from unnest(coalesce(p_conditions, '{}'::text[])) as c
       where c is null or btrim(c) = '' or char_length(btrim(c)) > 45
    ) then
      raise exception 'INVALID_CONDITION' using errcode = 'P0001';
    end if;

    select coalesce(array_agg(distinct btrim(c)), '{}'::text[])
      into v_conditions
      from unnest(coalesce(p_conditions, '{}'::text[])) as c;
  end if;

  -- A concurrent second call fails the unique auth_id index; report it as PROFILE_EXISTS.
  begin
    insert into public.users (auth_id, name, phone_number, user_type)
    values (v_auth_id, v_name, p_phone, p_user_type);
  exception when unique_violation then
    raise exception 'PROFILE_EXISTS' using errcode = 'P0001';
  end;

  if p_user_type = 'patient' then
    -- The new row is read back with a separate select instead of INSERT ... RETURNING: the
    -- select policies call helper functions that read the same table, and those functions
    -- cannot see a row inserted by the statement that is still running.
    select u.users_id into v_users_id
      from public.users u
     where u.auth_id = v_auth_id;

    insert into public.patients (users_id, sex, year_of_birth, other_conditions)
    values (v_users_id, p_sex, p_year_of_birth::smallint, v_other_conditions);

    select p.patient_id into v_patient_id
      from public.patients p
     where p.users_id = v_users_id;

    insert into public.patient_musko_skeletal_pain (patient_id, disease)
    select v_patient_id, c from unnest(v_conditions) as c;
  end if;
end;
$$;

revoke all on function public.create_profile(text, text, text, int, text[], text, text)
  from public, anon;
grant execute on function public.create_profile(text, text, text, int, text[], text, text)
  to authenticated;
