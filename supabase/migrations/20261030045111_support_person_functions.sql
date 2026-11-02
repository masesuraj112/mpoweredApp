-- Rollback:
--   drop function public.save_supported_answers(int, jsonb);
--   drop function public.save_supported_questions(int, int[]);
--   drop function public.list_supported_appointment_questions(int);
--   drop function public.get_supported_appointment(int);
--   drop function public.unpair_from_patient(int);
--   drop function public.reject_support_request(int);
--   drop function public.accept_support_request(int);
--   drop function public.list_supported_appointments();
--   drop function public.list_supported_patients();
--   drop function public.list_my_support_requests();
--   drop function public.supports_appointment(int);
--   drop function public.support_access(int, text);

-- These functions are `security definer` on purpose: the support person is not allowed to read
-- the patient's tables (previous migration), so the functions read them on their behalf. Each one
--   * works out the caller from auth.uid() (never from an argument),
--   * only ever returns rows for patients who invited that caller's phone number, and
--   * returns only the columns the Care Planner shows.

-- True when the signed-in support person has accepted this patient, and (optionally) the patient
-- gave them the access `p_token` ('questions' or 'answers'). Not callable from the app.
create function public.support_access(p_patient_id int, p_token text default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.support_persons sp
      join public.users u on u.users_id = sp.users_id
     where sp.patient_id = p_patient_id
       and sp.status = 'accepted'
       and u.auth_id = auth.uid()
       and u.user_type = 'support_person'
       and (p_token is null or p_token = any (string_to_array(sp.access_type, ',')))
  );
$$;
revoke all on function public.support_access(int, text) from public, anon, authenticated;

-- Decision S2: true when the signed-in support person has accepted and the patient added them to
-- this appointment. Taking them off the appointment ends their access to it. Not callable from the app.
create function public.supports_appointment(p_appointment_id int)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.appointment_has_support_persons l
      join public.support_persons sp on sp.support_person_id = l.support_person_id
      join public.users u on u.users_id = sp.users_id
     where l.appointment_id = p_appointment_id
       and sp.status = 'accepted'
       and u.auth_id = auth.uid()
       and u.user_type = 'support_person'
  );
$$;
revoke all on function public.supports_appointment(int) from public, anon, authenticated;

-- Invitations sent to the signed-in person's phone number and not answered yet.
-- Decision S5: only the patient's name. Their conditions appear once the request is accepted, so a
-- mistyped number never shows a stranger someone's health conditions.
create function public.list_my_support_requests()
returns table (
  patient_id integer,
  patient_name text,
  can_add_questions boolean,
  can_add_answers boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select p.patient_id,
         pu.name::text,
         'questions' = any (string_to_array(sp.access_type, ',')),
         'answers' = any (string_to_array(sp.access_type, ','))
    from public.users me
    join public.support_persons sp on sp.phone_number = me.phone_number
    join public.patients p on p.patient_id = sp.patient_id
    join public.users pu on pu.users_id = p.users_id
   where me.auth_id = auth.uid()
     and me.user_type = 'support_person'
     and me.phone_number is not null
     and sp.status = 'pending'
   order by sp.support_person_id;
$$;

-- The patients the signed-in support person has accepted.
create function public.list_supported_patients()
returns table (
  patient_id integer,
  patient_name text,
  conditions text,
  can_add_questions boolean,
  can_add_answers boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select p.patient_id,
         pu.name::text,
         (select string_agg(distinct m.disease::text, ', ' order by m.disease::text)
            from public.patient_musko_skeletal_pain m where m.patient_id = p.patient_id),
         'questions' = any (string_to_array(sp.access_type, ',')),
         'answers' = any (string_to_array(sp.access_type, ','))
    from public.users me
    join public.support_persons sp on sp.users_id = me.users_id
    join public.patients p on p.patient_id = sp.patient_id
    join public.users pu on pu.users_id = p.users_id
   where me.auth_id = auth.uid()
     and me.user_type = 'support_person'
     and sp.status = 'accepted'
   order by pu.name, p.patient_id;
$$;

-- The saved appointments of every accepted patient that the patient added this person to.
-- Drafts are never shown. Decision S2: an appointment they weren't added to is not shown.
create function public.list_supported_appointments()
returns table (
  patient_id integer,
  appointment_id integer,
  date_time timestamp,
  practitioner_name varchar,
  health_service text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select a.patient_id, a.appointment_id, a.date_time, a.practitioner_name, a.health_service, a.status
    from public.users me
    join public.support_persons sp on sp.users_id = me.users_id
    join public.appointment a on a.patient_id = sp.patient_id
   where me.auth_id = auth.uid()
     and me.user_type = 'support_person'
     and sp.status = 'accepted'
     and a.status = 'saved'
     and exists (select 1 from public.appointment_has_support_persons l
                  where l.appointment_id = a.appointment_id
                    and l.support_person_id = sp.support_person_id)
   order by a.date_time, a.appointment_id;
$$;

-- Accepts an invitation and returns the patient now supported.
create function public.accept_support_request(p_patient_id int)
returns table (
  patient_id integer,
  patient_name text,
  conditions text,
  can_add_questions boolean,
  can_add_answers boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me public.users;
  v_id integer;
begin
  select * into v_me from public.users where auth_id = auth.uid();
  if not found then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_me.user_type <> 'support_person' then
    raise exception 'NOT_A_SUPPORT_PERSON' using errcode = 'P0001';
  end if;

  update public.support_persons sp
     set status = 'accepted', users_id = v_me.users_id, responded_at = now()
   where sp.patient_id = p_patient_id
     and sp.status = 'pending'
     and v_me.phone_number is not null
     and sp.phone_number = v_me.phone_number
  returning sp.support_person_id into v_id;
  if v_id is null then
    raise exception 'REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  return query select * from public.list_supported_patients() s where s.patient_id = p_patient_id;
end;
$$;

-- Turns an invitation down. The patient's record is kept (as declined) so the same person is not
-- asked again unless the patient adds them again.
create function public.reject_support_request(p_patient_id int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me public.users;
  v_id integer;
begin
  select * into v_me from public.users where auth_id = auth.uid();
  if not found then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_me.user_type <> 'support_person' then
    raise exception 'NOT_A_SUPPORT_PERSON' using errcode = 'P0001';
  end if;

  update public.support_persons sp
     set status = 'declined', responded_at = now()
   where sp.patient_id = p_patient_id
     and sp.status = 'pending'
     and v_me.phone_number is not null
     and sp.phone_number = v_me.phone_number
  returning sp.support_person_id into v_id;
  if v_id is null then
    raise exception 'REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;
end;
$$;

-- Stops supporting a patient: the person loses all access at once and is taken off the patient's
-- appointments. The patient's record stays, as declined.
create function public.unpair_from_patient(p_patient_id int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me public.users;
  v_id integer;
begin
  select * into v_me from public.users where auth_id = auth.uid();
  if not found then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_me.user_type <> 'support_person' then
    raise exception 'NOT_A_SUPPORT_PERSON' using errcode = 'P0001';
  end if;

  update public.support_persons sp
     set status = 'declined', users_id = null, responded_at = now()
   where sp.patient_id = p_patient_id
     and sp.status = 'accepted'
     and sp.users_id = v_me.users_id
  returning sp.support_person_id into v_id;
  if v_id is null then
    raise exception 'PATIENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  delete from public.appointment_has_support_persons where support_person_id = v_id;
end;
$$;

-- One supported appointment: details, whether recording consent was given (never the signature),
-- and what this person may change.
create function public.get_supported_appointment(p_appointment_id int)
returns table (
  appointment_id integer,
  patient_id integer,
  date_time timestamp,
  practitioner_name varchar,
  health_service text,
  status text,
  recording_consent_at timestamptz,
  suggestions_generated_on date,
  can_add_questions boolean,
  can_add_answers boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select a.appointment_id, a.patient_id, a.date_time, a.practitioner_name, a.health_service, a.status,
         a.recording_consent_at, a.suggestions_generated_on,
         public.support_access(a.patient_id, 'questions'),
         public.support_access(a.patient_id, 'answers')
    from public.appointment a
   where a.appointment_id = p_appointment_id
     and a.status = 'saved'
     and public.support_access(a.patient_id)
     and public.supports_appointment(a.appointment_id);
$$;

-- Every question stored for a supported appointment, with which are on the plan and any answer.
create function public.list_supported_appointment_questions(p_appointment_id int)
returns table (
  question_id integer,
  group_key text,
  sort_order smallint,
  question varchar,
  is_selected boolean,
  answer text
)
language sql
stable
security definer
set search_path = public
as $$
  select q.question_id, q.group_key, q.sort_order, q.question, q.is_selected, q.answer
    from public.appointment a
    join public.appointment_questions q on q.appointment_id = a.appointment_id
   where a.appointment_id = p_appointment_id
     and a.status = 'saved'
     and public.support_access(a.patient_id)
     and public.supports_appointment(a.appointment_id)
   order by q.group_key, q.sort_order;
$$;

-- Sets the questions on a supported patient's plan. Needs the "Add questions" access. Taking an
-- answered question off the plan removes its answer, so that also needs "Add doctor's answer".
create function public.save_supported_questions(p_appointment_id int, p_question_ids int[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id integer;
  v_ids int[] := coalesce(p_question_ids, '{}'::int[]);
begin
  if auth.uid() is null then
    raise exception 'NO_SESSION' using errcode = 'P0001';
  end if;
  select a.patient_id into v_patient_id
    from public.appointment a
   where a.appointment_id = p_appointment_id and a.status = 'saved';
  if v_patient_id is null
     or not public.support_access(v_patient_id)
     or not public.supports_appointment(p_appointment_id) then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not public.support_access(v_patient_id, 'questions') then
    raise exception 'NO_QUESTIONS_PERMISSION' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from unnest(v_ids) as i
     where not exists (
       select 1 from public.appointment_questions q
        where q.appointment_id = p_appointment_id and q.question_id = i
     )
  ) then
    raise exception 'UNKNOWN_QUESTION' using errcode = 'P0001';
  end if;
  if cardinality(v_ids) = 0
     and exists (select 1 from public.appointment_questions where appointment_id = p_appointment_id) then
    raise exception 'NO_QUESTIONS' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.appointment_questions q
     where q.appointment_id = p_appointment_id
       and q.answer is not null
       and not (q.question_id = any (v_ids))
  ) and not public.support_access(v_patient_id, 'answers') then
    raise exception 'NO_ANSWERS_PERMISSION' using errcode = 'P0001';
  end if;

  update public.appointment_questions
     set is_selected = (question_id = any (v_ids)),
         answer = case when question_id = any (v_ids) then answer else null end
   where appointment_id = p_appointment_id;
end;
$$;

-- Saves the doctor's answers (plain text) for a supported patient. Needs the "Add doctor's
-- answer" access, and the patient must have given recording consent first.
create function public.save_supported_answers(p_appointment_id int, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment public.appointment;
  v_item jsonb;
  v_question_id integer;
  v_text text;
begin
  if auth.uid() is null then
    raise exception 'NO_SESSION' using errcode = 'P0001';
  end if;
  select * into v_appointment
    from public.appointment a
   where a.appointment_id = p_appointment_id and a.status = 'saved';
  if not found
     or not public.support_access(v_appointment.patient_id)
     or not public.supports_appointment(p_appointment_id) then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not public.support_access(v_appointment.patient_id, 'answers') then
    raise exception 'NO_ANSWERS_PERMISSION' using errcode = 'P0001';
  end if;
  if p_answers is null
     or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) not between 1 and 60 then
    raise exception 'INVALID_ANSWER' using errcode = 'P0001';
  end if;

  for v_item in select e from jsonb_array_elements(p_answers) e loop
    if jsonb_typeof(v_item) <> 'object'
       or coalesce(v_item->>'question_id', '') !~ '^[0-9]{1,9}$' then
      raise exception 'INVALID_ANSWER' using errcode = 'P0001';
    end if;
    v_question_id := (v_item->>'question_id')::int;
    v_text := nullif(btrim(coalesce(v_item->>'answer_text', '')), '');
    if char_length(v_text) > 4000 then
      raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
    end if;
    if v_text is not null and v_appointment.recording_consent_at is null then
      raise exception 'CONSENT_REQUIRED' using errcode = 'P0001';
    end if;

    update public.appointment_questions
       set answer = v_text
     where appointment_id = p_appointment_id
       and question_id = v_question_id
       and is_selected;
    if not found then
      raise exception 'QUESTION_NOT_ON_PLAN' using errcode = 'P0001';
    end if;
  end loop;
end;
$$;

revoke all on function public.list_my_support_requests() from public, anon;
grant execute on function public.list_my_support_requests() to authenticated;
revoke all on function public.list_supported_patients() from public, anon;
grant execute on function public.list_supported_patients() to authenticated;
revoke all on function public.list_supported_appointments() from public, anon;
grant execute on function public.list_supported_appointments() to authenticated;
revoke all on function public.accept_support_request(int) from public, anon;
grant execute on function public.accept_support_request(int) to authenticated;
revoke all on function public.reject_support_request(int) from public, anon;
grant execute on function public.reject_support_request(int) to authenticated;
revoke all on function public.unpair_from_patient(int) from public, anon;
grant execute on function public.unpair_from_patient(int) to authenticated;
revoke all on function public.get_supported_appointment(int) from public, anon;
grant execute on function public.get_supported_appointment(int) to authenticated;
revoke all on function public.list_supported_appointment_questions(int) from public, anon;
grant execute on function public.list_supported_appointment_questions(int) to authenticated;
revoke all on function public.save_supported_questions(int, int[]) from public, anon;
grant execute on function public.save_supported_questions(int, int[]) to authenticated;
revoke all on function public.save_supported_answers(int, jsonb) from public, anon;
grant execute on function public.save_supported_answers(int, jsonb) to authenticated;
