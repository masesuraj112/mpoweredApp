-- Rollback:
--   drop function public.list_my_appointments();
--   drop function public.save_appointment_details(timestamp, text, text, int);

-- Creates (no p_appointment_id) or edits the signed-in patient's appointment details. A new
-- appointment is a draft. p_date_time is local wall-clock time (timestamp without time zone):
-- never convert it. Returns the appointment_id.
create function public.save_appointment_details(
  p_date_time timestamp,
  p_practitioner_name text,
  p_health_service text,
  p_appointment_id int default null
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
  v_name text := nullif(btrim(p_practitioner_name), '');
  v_service text := nullif(btrim(p_health_service), '');
  v_id integer;
begin
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_patient_id is null then
    raise exception 'NOT_A_PATIENT' using errcode = 'P0001';
  end if;
  if p_date_time is null then
    raise exception 'NO_DATE_TIME' using errcode = 'P0001';
  end if;
  if char_length(v_name) > 100 or char_length(v_service) > 100 then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  if p_appointment_id is null then
    insert into public.appointment (patient_id, date_time, practitioner_name, health_service)
    values (v_patient_id, p_date_time, v_name, v_service)
    returning appointment_id into v_id;
  else
    update public.appointment
       set date_time = p_date_time,
           practitioner_name = v_name,
           health_service = v_service
     where appointment_id = p_appointment_id
       and patient_id = v_patient_id
    returning appointment_id into v_id;
    if v_id is null then
      raise exception 'NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  return v_id;
end;
$$;

-- The signed-in patient's saved appointments (drafts are not listed). Only the columns the list
-- needs, so the consent signature is not sent for every row.
create function public.list_my_appointments()
returns table (
  appointment_id integer,
  date_time timestamp,
  practitioner_name varchar,
  health_service text,
  status text
)
language sql
stable
security invoker
set search_path = public
as $$
  select a.appointment_id, a.date_time, a.practitioner_name, a.health_service, a.status
    from public.appointment a
   where a.patient_id = public.patient_id_for_user(public.current_users_id())
     and a.status = 'saved'
   order by a.date_time, a.appointment_id;
$$;

revoke all on function public.save_appointment_details(timestamp, text, text, int)
  from public, anon;
grant execute on function public.save_appointment_details(timestamp, text, text, int)
  to authenticated;
revoke all on function public.list_my_appointments() from public, anon;
grant execute on function public.list_my_appointments() to authenticated;
