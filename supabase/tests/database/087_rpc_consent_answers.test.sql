begin;
create extension if not exists pgtap with schema extensions;
select plan(45);

-- fixtures (inserted as the superuser): A and B are patients, C is a support person, D has no profile.
-- a1: a draft with questions Q1 and Q3 on the plan and Q2 off it. a2: a draft with no suggestions.
-- a3: a draft whose suggestions are all off the plan.
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

insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
  select (select v from ctx where k = 'a1'), 'pain-location', 1, 'Q1', true
  union all select (select v from ctx where k = 'a1'), 'pain-location', 2, 'Q2', false
  union all select (select v from ctx where k = 'a1'), 'management', 1, 'Q3', true
  union all select (select v from ctx where k = 'a3'), 'management', 1, 'Q4', false;

-- function privileges
select has_function('public', 'save_recording_consent', array['integer', 'text'],
  'save_recording_consent exists');
select has_function('public', 'save_appointment_answers', array['integer', 'jsonb'],
  'save_appointment_answers exists');
select has_function('public', 'save_appointment', array['integer'], 'save_appointment exists');
select ok(
  not has_function_privilege('anon', 'public.save_recording_consent(int,text)', 'execute'),
  'anon cannot execute save_recording_consent');
select ok(
  not has_function_privilege('anon', 'public.save_appointment_answers(int,jsonb)', 'execute'),
  'anon cannot execute save_appointment_answers');
select ok(
  not has_function_privilege('anon', 'public.save_appointment(int)', 'execute'),
  'anon cannot execute save_appointment');
select ok(
  has_function_privilege('authenticated', 'public.save_recording_consent(int,text)', 'execute')
  and has_function_privilege('authenticated', 'public.save_appointment_answers(int,jsonb)', 'execute')
  and has_function_privilege('authenticated', 'public.save_appointment(int)', 'execute'),
  'authenticated can execute all three functions');

-- ===== patient A =====
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

-- saving the appointment
select throws_ok(
  format('select public.save_appointment(%s)', (select v from ctx where k = 'a3')),
  'P0001', 'NO_QUESTIONS', 'an appointment whose suggestions are all off the plan cannot be saved');
select throws_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', ''hi'')))',
    (select v from ctx where k = 'a1')),
  'P0001', 'APPOINTMENT_NOT_SAVED', 'answers cannot be saved on a draft appointment');
select lives_ok(
  format('select public.save_appointment(%s)', (select v from ctx where k = 'a1')),
  'a draft with questions on the plan can be saved');
select lives_ok(
  format('select public.save_appointment(%s)', (select v from ctx where k = 'a1')),
  'saving again is harmless (a retry after a lost response)');
select ok(
  (select status = 'saved' and saved_at is not null from public.appointment
    where appointment_id = (select v from ctx where k = 'a1')),
  'the appointment is saved with a saved_at time');
select lives_ok(
  format('select public.save_appointment(%s)', (select v from ctx where k = 'a2')),
  'an appointment with no suggestions can be saved');

-- answers need consent
select throws_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', ''hi'')))',
    (select v from ctx where k = 'a1')),
  'P0001', 'CONSENT_REQUIRED', 'an answer cannot be saved before the doctor has consented');
select lives_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', ''   '')))',
    (select v from ctx where k = 'a1')),
  'clearing an answer does not need consent');

-- the signature
select throws_ok(
  format('select public.save_recording_consent(%s, ''not json'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SIGNATURE', 'a signature that is not JSON is rejected');
select throws_ok(
  format('select public.save_recording_consent(%s, ''{"w":1,"h":1,"paths":[]}'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SIGNATURE', 'a signature with no strokes is rejected');
select throws_ok(
  format('select public.save_recording_consent(%s, ''{"h":1,"paths":["M1 1"]}'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SIGNATURE', 'a signature without a width is rejected');
select throws_ok(
  format('select public.save_recording_consent(%s, ''{"w":1,"h":1,"paths":"M1 1"}'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SIGNATURE', 'a signature whose paths are not a list is rejected');
select throws_ok(
  format('select public.save_recording_consent(%s, ''[1]'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SIGNATURE', 'a signature that is not an object is rejected');
select throws_ok(
  format('select public.save_recording_consent(%s, %L)', (select v from ctx where k = 'a1'), repeat('x', 60001)),
  'P0001', 'INVALID_SIGNATURE', 'a signature over 60000 characters is rejected');
select ok(
  (select recording_consent_at is null and recording_consent_signature is null
     from public.appointment where appointment_id = (select v from ctx where k = 'a1')),
  'rejected signatures stored nothing');
select lives_ok(
  format('select public.save_recording_consent(%s, ''{"w":313,"h":200,"paths":["M10.5 20.1L11 21.4"]}'')',
    (select v from ctx where k = 'a1')),
  'a valid signature is accepted');
select ok(
  (select abs(extract(epoch from now() - recording_consent_at)) < 5
      and recording_consent_signature = '{"w":313,"h":200,"paths":["M10.5 20.1L11 21.4"]}'
     from public.appointment where appointment_id = (select v from ctx where k = 'a1')),
  'the consent time is the server''s and the signature is stored as sent');
select lives_ok(
  format('select public.save_recording_consent(%s, ''{"w":300,"h":150,"paths":["M1 1L2 2"]}'')',
    (select v from ctx where k = 'a1')),
  'signing again is accepted');
select ok(
  (select recording_consent_signature = '{"w":300,"h":150,"paths":["M1 1L2 2"]}'
     from public.appointment where appointment_id = (select v from ctx where k = 'a1')),
  'signing again replaces the earlier signature');

-- answers: all or nothing
select throws_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', ''ok''), jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q2''), ''answer_text'', ''no'')))',
    (select v from ctx where k = 'a1')),
  'P0001', 'QUESTION_NOT_ON_PLAN', 'an answer for a question that is not on the plan is rejected');
select ok(
  (select answer is null from public.appointment_questions where question = 'Q1'),
  'the earlier answer in the same call was not saved');
select lives_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', ''  Take rest  '')))',
    (select v from ctx where k = 'a1')),
  'an answer can be saved once the doctor has consented');
select ok(
  (select answer = 'Take rest' from public.appointment_questions where question = 'Q1'),
  'the answer is trimmed');
select lives_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', '''')))',
    (select v from ctx where k = 'a1')),
  'a blank answer is accepted');
select ok(
  (select answer is null from public.appointment_questions where question = 'Q1'),
  'a blank answer clears the answer');
select lives_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', ''one''), jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q3''), ''answer_text'', ''three'')))',
    (select v from ctx where k = 'a1')),
  'several answers can be saved together');
select ok(
  (select count(*) = 2 from public.appointment_questions where answer in ('one', 'three')),
  'both answers were saved');
select lives_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', %L)))',
    (select v from ctx where k = 'a1'), repeat('x', 4000)),
  'an answer of exactly 4000 characters is accepted');
select throws_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', %L)))',
    (select v from ctx where k = 'a1'), repeat('x', 4001)),
  'P0001', 'VALUE_TOO_LONG', 'an answer over 4000 characters is rejected');
select throws_ok(
  format('select public.save_appointment_answers(%s, ''[]'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_ANSWER', 'an empty list of answers is rejected');
select throws_ok(
  format('select public.save_appointment_answers(%s, ''{"question_id":1,"answer_text":"x"}'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_ANSWER', 'answers that are not a list are rejected');
select throws_ok(
  format('select public.save_appointment_answers(%s, ''[{"question_id":"abc","answer_text":"x"}]'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_ANSWER', 'a question id that is not a number is rejected');

-- ===== patient B: every function says the appointment does not exist =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);
select throws_ok(
  format('select public.save_appointment(%s)', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'patient B cannot save patient A''s appointment');
select throws_ok(
  format('select public.save_recording_consent(%s, ''{"w":1,"h":1,"paths":["M1 1"]}'')', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'patient B cannot sign consent on patient A''s appointment');
select throws_ok(
  format('select public.save_appointment_answers(%s, ''[{"question_id":1,"answer_text":"x"}]'')', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'patient B cannot save answers on patient A''s appointment');

-- ===== C: a support person; D: no profile =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000c', 'role', 'authenticated')::text, true);
select throws_ok(
  format('select public.save_appointment_answers(%s, ''[{"question_id":1,"answer_text":"x"}]'')', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'a support person cannot save answers with these functions');
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000d', 'role', 'authenticated')::text, true);
select throws_ok(
  format('select public.save_appointment(%s)', (select v from ctx where k = 'a1')),
  'P0001', 'NO_PROFILE', 'an account without a profile is rejected');

reset role;
select ok(
  (select count(*) = 1 from public.appointment_questions where answer = 'three')
  and (select recording_consent_signature = '{"w":300,"h":150,"paths":["M1 1L2 2"]}'
         from public.appointment where appointment_id = (select v from ctx where k = 'a1')),
  'patient A''s answers and signature were not changed by anyone else');

select * from finish();
rollback;
