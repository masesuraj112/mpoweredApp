begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

-- fixtures (inserted as the superuser): A and B are patients, C is a support person, D has no profile.
-- Patient A has three appointments: a1 for the main flow, a2 for the "tomorrow" date, a3 with no suggestions.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-00000000000c'),
  ('00000000-0000-0000-0000-00000000000d');
insert into public.users (name, auth_id, user_type) values
  ('Test A', '00000000-0000-0000-0000-00000000000a', 'patient'),
  ('Test B', '00000000-0000-0000-0000-00000000000b', 'patient'),
  ('Test C', '00000000-0000-0000-0000-00000000000c', 'support_person');
insert into public.patients (sex, users_id)
  select 'Female', users_id from public.users where user_type = 'patient';
insert into public.appointment (patient_id, date_time)
  select p.patient_id, d.dt
    from public.patients p
    join public.users u using (users_id)
    cross join (values ('2026-11-05 14:30'::timestamp), ('2026-11-06 09:00'), ('2026-11-07 09:00')) as d(dt)
   where u.name = 'Test A';

create temp table ctx (k text primary key, v int);
grant all on ctx to authenticated;
insert into ctx select 'a1', appointment_id from public.appointment where date_time = '2026-11-05 14:30';
insert into ctx select 'a2', appointment_id from public.appointment where date_time = '2026-11-06 09:00';
insert into ctx select 'a3', appointment_id from public.appointment where date_time = '2026-11-07 09:00';

-- function privileges
select has_function('public', 'save_appointment_suggestions',
  array['integer', 'date', 'jsonb'], 'save_appointment_suggestions exists');
select has_function('public', 'save_appointment_questions',
  array['integer', 'integer[]'], 'save_appointment_questions exists');
select ok(
  not has_function_privilege('anon',
    'public.save_appointment_suggestions(int,date,jsonb)', 'execute'),
  'anon cannot execute save_appointment_suggestions');
select ok(
  not has_function_privilege('anon',
    'public.save_appointment_questions(int,int[])', 'execute'),
  'anon cannot execute save_appointment_questions');
select ok(
  has_function_privilege('authenticated',
    'public.save_appointment_suggestions(int,date,jsonb)', 'execute')
  and has_function_privilege('authenticated',
    'public.save_appointment_questions(int,int[])', 'execute'),
  'authenticated can execute both functions');

-- ===== patient A =====
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

-- validation: nothing is stored when a check fails
select throws_ok(
  format('select public.save_appointment_suggestions(%s, current_date, ''[]''::jsonb)',
    (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_QUESTION', 'an empty list of questions is rejected');
select throws_ok(
  format('select public.save_appointment_suggestions(%s, current_date + 5, ''[{"group_key":"pain-location","question":"q"}]''::jsonb)',
    (select v from ctx where k = 'a1')),
  'P0001', 'FUTURE_DATE', 'a generated-on date five days ahead is rejected');
select throws_ok(
  format('select public.save_appointment_suggestions(%s, current_date, ''[{"group_key":"Bad Key","question":"q"}]''::jsonb)',
    (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_QUESTION', 'a malformed group_key is rejected');
select throws_ok(
  format('select public.save_appointment_suggestions(%s, current_date, ''[{"group_key":"pain-location","question":"  "}]''::jsonb)',
    (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_QUESTION', 'a blank question is rejected');
select throws_ok(
  format('select public.save_appointment_suggestions(%s, current_date, jsonb_build_array(jsonb_build_object(''group_key'', ''pain-location'', ''question'', %L)))',
    (select v from ctx where k = 'a1'), repeat('x', 201)),
  'P0001', 'INVALID_QUESTION', 'a question over 200 characters is rejected');
select throws_ok(
  format('select public.save_appointment_suggestions(%s, current_date, ''{"group_key":"pain-location","question":"q"}''::jsonb)',
    (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_QUESTION', 'questions that are not an array are rejected');
select throws_ok(
  format('select public.save_appointment_suggestions(%s, current_date, ''[{"question":"q"}]''::jsonb)',
    (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_QUESTION', 'a question without a group_key is rejected');
select ok((select count(*) = 0 from public.appointment_questions),
  'failed validation stored nothing');

-- the local calendar date can be a day ahead of the server's
select ok(
  public.save_appointment_suggestions((select v from ctx where k = 'a2'), current_date + 1,
    '[{"group_key":"pain-location","question":"Tomorrow question"}]'::jsonb),
  'a generated-on date of tomorrow is accepted');

-- stored once, in order, unselected
insert into ctx select 'first', case when public.save_appointment_suggestions(
  (select v from ctx where k = 'a1'), current_date,
  '[{"group_key":"pain-location","question":"Q1"},{"group_key":"pain-location","question":"Q2"},{"group_key":"management","question":"Q3"}]'::jsonb)
  then 1 else 0 end;
select ok((select v = 1 from ctx where k = 'first'), 'the first save returns true');
select ok(
  not public.save_appointment_suggestions((select v from ctx where k = 'a1'), current_date,
    '[{"group_key":"other","question":"Another"}]'::jsonb),
  'a second save for the same appointment returns false');
select ok(
  (select count(*) = 3 and bool_and(not is_selected) from public.appointment_questions
    where appointment_id = (select v from ctx where k = 'a1')),
  'three questions are stored, none selected, and the second call added nothing');
select ok(
  (select array_agg(sort_order order by question) = array[1, 2, 1]::smallint[]
     from public.appointment_questions where appointment_id = (select v from ctx where k = 'a1')),
  'sort_order counts up within each group');
select ok(
  (select suggestions_generated_on = current_date from public.appointment
    where appointment_id = (select v from ctx where k = 'a1')),
  'the appointment records the generated-on date');

-- choosing the plan
select throws_ok(
  format('select public.save_appointment_questions(%s, array[99999])', (select v from ctx where k = 'a1')),
  'P0001', 'UNKNOWN_QUESTION', 'a question id that is not on the appointment is rejected');
select throws_ok(
  format('select public.save_appointment_questions(%s, ''{}''::int[])', (select v from ctx where k = 'a1')),
  'P0001', 'NO_QUESTIONS', 'removing every question is rejected');
select lives_ok(
  format('select public.save_appointment_questions(%s, (select array_agg(question_id) from public.appointment_questions where question in (''Q1'', ''Q3'')))',
    (select v from ctx where k = 'a1')),
  'two questions can be chosen');
select ok(
  (select count(*) = 2 from public.appointment_questions
    where appointment_id = (select v from ctx where k = 'a1') and is_selected),
  'exactly the two chosen questions are selected');

-- removing a question removes its answer
reset role;
update public.appointment_questions set answer = 'ans3' where question = 'Q3';
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);
select lives_ok(
  format('select public.save_appointment_questions(%s, (select array_agg(question_id) from public.appointment_questions where question = ''Q1''))',
    (select v from ctx where k = 'a1')),
  'a chosen question with an answer can be removed');
select ok(
  (select answer is null and not is_selected from public.appointment_questions where question = 'Q3'),
  'the removed question lost its answer');

-- an appointment without suggestions has nothing to protect
select lives_ok(
  format('select public.save_appointment_questions(%s, ''{}''::int[])', (select v from ctx where k = 'a3')),
  'an empty selection is fine when the appointment has no suggestions');

-- ===== patient B: another patient's appointment looks like it does not exist =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);
select throws_ok(
  format('select public.save_appointment_suggestions(%s, current_date, ''[{"group_key":"a","question":"q"}]''::jsonb)',
    (select v from ctx where k = 'a3')),
  'P0001', 'NOT_FOUND', 'patient B cannot store suggestions on patient A''s appointment');
select throws_ok(
  format('select public.save_appointment_questions(%s, ''{}''::int[])', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'patient B cannot change patient A''s plan');
select ok((select count(*) = 0 from public.appointment_questions),
  'patient B sees none of patient A''s questions');

-- ===== C: a support person; D: no profile =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000c', 'role', 'authenticated')::text, true);
select throws_ok(
  format('select public.save_appointment_questions(%s, ''{}''::int[])', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'a support person cannot change a patient''s plan');
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000d', 'role', 'authenticated')::text, true);
select throws_ok(
  format('select public.save_appointment_questions(%s, ''{}''::int[])', (select v from ctx where k = 'a1')),
  'P0001', 'NO_PROFILE', 'an account without a profile is rejected');

reset role;
select ok(
  (select count(*) = 3 from public.appointment_questions
    where appointment_id = (select v from ctx where k = 'a1')),
  'patient A''s questions are unchanged by anyone else');

select * from finish();
rollback;
