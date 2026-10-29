-- Rollback:
--   drop function public.save_appointment(int);
--   drop function public.save_appointment_answers(int, jsonb);
--   drop function public.save_recording_consent(int, text);

-- Stores the doctor's signature that allows the consultation to be recorded. The time is the
-- server's, not the phone's. Signing again replaces the earlier signature. Returns the time.
-- p_signature is the app's JSON: {"w": 313, "h": 200, "paths": ["M10.5 20.1L11 21.4"]}.
create function public.save_recording_consent(
  p_appointment_id int,
  p_signature text
)
returns timestamptz
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
  v_sig jsonb;
  v_at timestamptz := now();
  v_id integer;
begin
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if p_signature is null or char_length(p_signature) > 60000 then
    raise exception 'INVALID_SIGNATURE' using errcode = 'P0001';
  end if;
  begin
    v_sig := p_signature::jsonb;
  exception when others then
    raise exception 'INVALID_SIGNATURE' using errcode = 'P0001';
  end;
  if jsonb_typeof(v_sig) <> 'object'
     or jsonb_typeof(v_sig->'paths') is distinct from 'array'
     or jsonb_array_length(v_sig->'paths') = 0
     or jsonb_typeof(v_sig->'w') is distinct from 'number'
     or jsonb_typeof(v_sig->'h') is distinct from 'number' then
    raise exception 'INVALID_SIGNATURE' using errcode = 'P0001';
  end if;

  update public.appointment
     set recording_consent_at = v_at,
         recording_consent_signature = p_signature
   where appointment_id = p_appointment_id
     and patient_id = v_patient_id
  returning appointment_id into v_id;
  if v_id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  return v_at;
end;
$$;

-- Saves the doctor's answers (plain text) for questions on a saved plan. All or nothing.
-- p_answers is an array of {"question_id": 12, "answer_text": "..."}; empty text clears the
-- answer. Saving text needs recording consent first.
create function public.save_appointment_answers(
  p_appointment_id int,
  p_answers jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
  v_appointment public.appointment;
  v_item jsonb;
  v_question_id integer;
  v_text text;
begin
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  select * into v_appointment
    from public.appointment
   where appointment_id = p_appointment_id and patient_id = v_patient_id;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_appointment.status <> 'saved' then
    raise exception 'APPOINTMENT_NOT_SAVED' using errcode = 'P0001';
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

-- Saves a draft appointment so it appears in My Appointments. Saving a saved one again is fine.
create function public.save_appointment(p_appointment_id int)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
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
  if exists (select 1 from public.appointment_questions where appointment_id = p_appointment_id)
     and not exists (
       select 1 from public.appointment_questions
        where appointment_id = p_appointment_id and is_selected
     ) then
    raise exception 'NO_QUESTIONS' using errcode = 'P0001';
  end if;

  update public.appointment
     set status = 'saved',
         saved_at = coalesce(saved_at, now())
   where appointment_id = p_appointment_id;
end;
$$;

revoke all on function public.save_recording_consent(int, text) from public, anon;
grant execute on function public.save_recording_consent(int, text) to authenticated;
revoke all on function public.save_appointment_answers(int, jsonb) from public, anon;
grant execute on function public.save_appointment_answers(int, jsonb) to authenticated;
revoke all on function public.save_appointment(int) from public, anon;
grant execute on function public.save_appointment(int) to authenticated;
