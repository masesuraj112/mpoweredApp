-- Rollback:
--   drop function public.save_appointment_questions(int, int[]);
--   drop function public.save_appointment_suggestions(int, date, jsonb);

-- Stores the generated suggested questions against an appointment. The app generates the
-- questions (pure TypeScript); this function only validates and stores them.
-- p_questions is an array of {"group_key": "...", "question": "..."}, in display order.
-- Returns true when stored, false when the appointment already had suggestions (so a retry or
-- a second screen load is harmless).
create function public.save_appointment_suggestions(
  p_appointment_id int,
  p_generated_on date,
  p_questions jsonb
)
returns boolean
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
  -- The date is the caller's local calendar date, which can be a day ahead of the server's.
  if p_generated_on is null or p_generated_on > current_date + 1 then
    raise exception 'FUTURE_DATE' using errcode = 'P0001';
  end if;
  if p_questions is null
     or jsonb_typeof(p_questions) <> 'array'
     or jsonb_array_length(p_questions) not between 1 and 60 then
    raise exception 'INVALID_QUESTION' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_questions) e
     where jsonb_typeof(e) <> 'object'
        or btrim(coalesce(e->>'group_key', '')) !~ '^[a-z]+(-[a-z]+)*$'
        or coalesce(btrim(e->>'question'), '') = ''
        or char_length(btrim(e->>'question')) > 200
  ) then
    raise exception 'INVALID_QUESTION' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.appointment_questions where appointment_id = p_appointment_id) then
    return false;
  end if;

  begin
    insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
    select p_appointment_id,
           q.group_key,
           (row_number() over (partition by q.group_key order by q.ord))::smallint,
           q.question,
           false
      from (
        select btrim(e.value->>'group_key') as group_key,
               btrim(e.value->>'question') as question,
               e.ord
          from jsonb_array_elements(p_questions) with ordinality as e(value, ord)
      ) q;
  exception when unique_violation then
    -- a concurrent call stored them first
    return false;
  end;

  update public.appointment
     set suggestions_generated_on = p_generated_on
   where appointment_id = p_appointment_id;
  return true;
end;
$$;

-- Sets which suggested questions are on the plan. A question that is removed loses its answer.
-- At least one must stay selected when the appointment has suggestions.
create function public.save_appointment_questions(
  p_appointment_id int,
  p_question_ids int[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
  v_ids int[] := coalesce(p_question_ids, '{}'::int[]);
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

  update public.appointment_questions
     set is_selected = (question_id = any (v_ids)),
         answer = case when question_id = any (v_ids) then answer else null end
   where appointment_id = p_appointment_id;
end;
$$;

revoke all on function public.save_appointment_suggestions(int, date, jsonb) from public, anon;
grant execute on function public.save_appointment_suggestions(int, date, jsonb) to authenticated;
revoke all on function public.save_appointment_questions(int, int[]) from public, anon;
grant execute on function public.save_appointment_questions(int, int[]) to authenticated;
