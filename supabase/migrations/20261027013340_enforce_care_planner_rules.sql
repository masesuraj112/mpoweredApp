-- Rollback:
--   drop trigger appointment_questions_answer_needs_consent on public.appointment_questions;
--   drop function public.enforce_answer_needs_consent();
--   drop trigger appointment_save_needs_question on public.appointment;
--   drop function public.enforce_appointment_save_needs_question();
--   -- and re-create limit_appointment_support_people (20261027012740_care_planner_privileges_policies)
--   -- and save_appointment_support_people (20261027013240_support_people_relink_and_link_policy)
--   -- from those files.

-- The functions enforce these rules, but the logged-in role also has table-level UPDATE and
-- INSERT (the functions run as the signed-in user, so they need it). These triggers apply the
-- same rules to direct writes, so the rules hold however the row is changed.

-- 1. A doctor's answer needs recorded consent. Clearing an answer, or changing a row without
-- changing its answer, does not.
create function public.enforce_answer_needs_consent()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.answer is not null
     and (tg_op = 'INSERT' or new.answer is distinct from old.answer) then
    if not exists (
      select 1 from public.appointment a
       where a.appointment_id = new.appointment_id
         and a.recording_consent_at is not null
    ) then
      raise exception 'CONSENT_REQUIRED' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger appointment_questions_answer_needs_consent
  before insert or update of answer on public.appointment_questions
  for each row execute function public.enforce_answer_needs_consent();

-- 2. An appointment that has suggested questions can only be saved with at least one of them on
-- the plan.
create function public.enforce_appointment_save_needs_question()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status = 'saved' and old.status is distinct from 'saved' then
    if exists (select 1 from public.appointment_questions where appointment_id = new.appointment_id)
       and not exists (
         select 1 from public.appointment_questions
          where appointment_id = new.appointment_id and is_selected
       ) then
      raise exception 'NO_QUESTIONS' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger appointment_save_needs_question
  before update of status on public.appointment
  for each row execute function public.enforce_appointment_save_needs_question();

-- 3. The two-person limit counts rows before inserting, so two inserts at the same moment could
-- both pass. Locking the appointment row first makes them take turns.
create or replace function public.limit_appointment_support_people()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform 1 from public.appointment where appointment_id = new.appointment_id for update;
  if (select count(*) from public.appointment_has_support_persons
       where appointment_id = new.appointment_id) >= 2 then
    raise exception 'TOO_MANY_SUPPORT_PEOPLE' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- 4. save_appointment_support_people: lock the appointment while the list is replaced, so two
-- overlapping saves cannot interleave, and report a non-numeric support_person_id as a normal
-- error code instead of a raw cast error.
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
  perform 1 from public.appointment
   where appointment_id = p_appointment_id and patient_id = v_patient_id
     for update;
  if not found then
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
      if (v_person->>'support_person_id') !~ '^[0-9]{1,9}$' then
        raise exception 'INVALID_SUPPORT_PERSON' using errcode = 'P0001';
      end if;
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
