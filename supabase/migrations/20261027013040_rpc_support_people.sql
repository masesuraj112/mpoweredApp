-- Rollback:
--   drop function public.list_my_support_persons();
--   drop function public.save_appointment_support_people(int, jsonb);
--   drop function public.save_support_person(text, text, text, text, int);

-- Creates (no p_support_person_id) or edits one of the signed-in patient's support people.
-- Phone must be E.164 (+61...) or null. Adding a number the patient already has updates that
-- person instead of creating a duplicate.
create function public.save_support_person(
  p_name text,
  p_phone text,
  p_email text,
  p_access_type text,
  p_support_person_id int default null
)
returns public.support_persons
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
  v_name text := btrim(p_name);
  v_phone text := nullif(btrim(p_phone), '');
  v_email text := nullif(btrim(p_email), '');
  v_row public.support_persons;
begin
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_patient_id is null then
    raise exception 'NOT_A_PATIENT' using errcode = 'P0001';
  end if;
  if v_name is null or v_name = '' then
    raise exception 'INVALID_SUPPORT_PERSON' using errcode = 'P0001';
  end if;
  if char_length(v_name) > 100 or char_length(v_email) > 254 then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;
  if v_phone is not null and v_phone !~ '^\+614[0-9]{8}$' then
    raise exception 'INVALID_PHONE' using errcode = 'P0001';
  end if;
  if p_access_type is null
     or p_access_type not in ('none', 'questions', 'answers', 'questions,answers') then
    raise exception 'INVALID_ACCESS_TYPE' using errcode = 'P0001';
  end if;

  if p_support_person_id is null then
    insert into public.support_persons (patient_id, name, phone_number, email, access_type)
    values (v_patient_id, v_name, v_phone, v_email, p_access_type)
    on conflict (patient_id, phone_number) where phone_number is not null
    do update set name = excluded.name,
                  email = excluded.email,
                  access_type = excluded.access_type
    returning * into v_row;
  else
    if v_phone is not null and exists (
      select 1 from public.support_persons
       where patient_id = v_patient_id
         and phone_number = v_phone
         and support_person_id <> p_support_person_id
    ) then
      raise exception 'DUPLICATE_SUPPORT_PERSON' using errcode = 'P0001';
    end if;
    update public.support_persons
       set name = v_name, phone_number = v_phone, email = v_email, access_type = p_access_type
     where support_person_id = p_support_person_id
       and patient_id = v_patient_id
    returning * into v_row;
    if not found then
      raise exception 'NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  return v_row;
end;
$$;

-- Replaces the support people on an appointment (at most two). Each item is either an existing
-- person {"support_person_id": 7} (only linked) or a new one
-- {"name": "...", "phone": "+61...", "email": "...", "access_type": "questions"}.
-- An empty array means "no support person". People removed from the appointment are unlinked,
-- never deleted. Returns the resulting list.
create function public.save_appointment_support_people(
  p_appointment_id int,
  p_people jsonb
)
returns setof public.support_persons
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
  v_person jsonb;
  v_id integer;
  v_ids int[] := '{}'::int[];
begin
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.appointment
     where appointment_id = p_appointment_id and patient_id = v_patient_id
  ) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if p_people is null or jsonb_typeof(p_people) <> 'array' then
    raise exception 'INVALID_SUPPORT_PERSON' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_people) > 2 then
    raise exception 'TOO_MANY_SUPPORT_PEOPLE' using errcode = 'P0001';
  end if;

  for v_person in select e from jsonb_array_elements(p_people) e loop
    if jsonb_typeof(v_person) <> 'object' then
      raise exception 'INVALID_SUPPORT_PERSON' using errcode = 'P0001';
    end if;
    if nullif(v_person->>'support_person_id', '') is not null then
      v_id := (v_person->>'support_person_id')::int;
      if not exists (
        select 1 from public.support_persons
         where support_person_id = v_id and patient_id = v_patient_id
      ) then
        raise exception 'NOT_FOUND' using errcode = 'P0001';
      end if;
    else
      select sp.support_person_id into v_id
        from public.save_support_person(
          v_person->>'name',
          v_person->>'phone',
          v_person->>'email',
          coalesce(v_person->>'access_type', 'none')
        ) sp;
    end if;
    if not (v_id = any (v_ids)) then
      v_ids := v_ids || v_id;
    end if;
  end loop;

  if cardinality(v_ids) > 2 then
    raise exception 'TOO_MANY_SUPPORT_PEOPLE' using errcode = 'P0001';
  end if;

  delete from public.appointment_has_support_persons
   where appointment_id = p_appointment_id
     and support_person_id <> all (v_ids);
  insert into public.appointment_has_support_persons (appointment_id, support_person_id)
  select p_appointment_id, i from unnest(v_ids) as i
  on conflict do nothing;

  return query
    select sp.*
      from public.support_persons sp
      join public.appointment_has_support_persons l using (support_person_id)
     where l.appointment_id = p_appointment_id
     order by sp.support_person_id;
end;
$$;

-- The signed-in patient's support people (the Settings > Support Persons list).
create function public.list_my_support_persons()
returns setof public.support_persons
language sql
stable
security invoker
set search_path = public
as $$
  select sp.*
    from public.support_persons sp
   where sp.patient_id = public.patient_id_for_user(public.current_users_id())
   order by sp.name, sp.support_person_id;
$$;

revoke all on function public.save_support_person(text, text, text, text, int) from public, anon;
grant execute on function public.save_support_person(text, text, text, text, int) to authenticated;
revoke all on function public.save_appointment_support_people(int, jsonb) from public, anon;
grant execute on function public.save_appointment_support_people(int, jsonb) to authenticated;
revoke all on function public.list_my_support_persons() from public, anon;
grant execute on function public.list_my_support_persons() to authenticated;
