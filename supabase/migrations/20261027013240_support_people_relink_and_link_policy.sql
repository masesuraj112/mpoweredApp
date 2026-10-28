-- Rollback:
--   -- put back the previous link policy (from 20260902052010_remote_schema.sql):
--   drop policy ahsp_insert on public.appointment_has_support_persons;
--   create policy ahsp_insert on public.appointment_has_support_persons
--     as permissive for insert to public
--     with check (exists (
--       select 1 from public.appointment a
--        where a.appointment_id = appointment_has_support_persons.appointment_id
--          and public.is_own_patient_record(a.patient_id)));
--   -- and re-create public.save_appointment_support_people from 20261027013040_rpc_support_people.sql.

-- 1. Saving the same support people again must not fail. The two-person trigger runs before
-- `on conflict do nothing` can skip a link that already exists, so a full appointment (two links)
-- refused a re-save with TOO_MANY_SUPPORT_PEOPLE. Only the links that are missing are inserted now.
create or replace function public.save_appointment_support_people(
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
  select p_appointment_id, i
    from unnest(v_ids) as i
   where not exists (
     select 1 from public.appointment_has_support_persons l
      where l.appointment_id = p_appointment_id and l.support_person_id = i
   );

  return query
    select sp.*
      from public.support_persons sp
      join public.appointment_has_support_persons l using (support_person_id)
     where l.appointment_id = p_appointment_id
     order by sp.support_person_id;
end;
$$;

revoke all on function public.save_appointment_support_people(int, jsonb) from public, anon;
grant execute on function public.save_appointment_support_people(int, jsonb) to authenticated;

-- 2. A link may only join a patient's own appointment to one of that patient's own support
-- people. The old policy only checked the appointment, so a direct insert could point an
-- appointment at another patient's support person.
drop policy ahsp_insert on public.appointment_has_support_persons;
create policy ahsp_insert
  on public.appointment_has_support_persons
  as permissive
  for insert
  to authenticated
  with check (exists (
    select 1
      from public.appointment a
      join public.support_persons sp on sp.patient_id = a.patient_id
     where a.appointment_id = appointment_has_support_persons.appointment_id
       and sp.support_person_id = appointment_has_support_persons.support_person_id
       and public.is_own_patient_record(a.patient_id)
  ));
