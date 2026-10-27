begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

-- fixtures (inserted as the superuser): patient A (the signed-in patient), patient B.
--   a1: draft, no consent, questions Q1 (on the plan) and Q2 (off it)
--   a2: draft, no consent, one question that is off the plan
--   a3: draft, consent recorded, question Q3 on the plan
--   a4: draft, no questions at all
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.users (name, auth_id, user_type) values
  ('Test A', '00000000-0000-0000-0000-00000000000a', 'patient'),
  ('Test B', '00000000-0000-0000-0000-00000000000b', 'patient');
insert into public.patients (sex, users_id)
  select 'Female', users_id from public.users;
insert into public.appointment (patient_id, date_time, recording_consent_at)
  select p.patient_id, d.dt, d.consent
    from public.patients p
    join public.users u using (users_id)
    cross join (values
      ('2026-11-05 14:30'::timestamp, null::timestamptz),
      ('2026-11-06 09:00', null),
      ('2026-11-07 09:00', now()),
      ('2026-11-08 09:00', null)
    ) as d(dt, consent)
   where u.name = 'Test A';

create temp table ctx (k text primary key, v int);
grant all on ctx to authenticated;
insert into ctx select 'a1', appointment_id from public.appointment where date_time = '2026-11-05 14:30';
insert into ctx select 'a2', appointment_id from public.appointment where date_time = '2026-11-06 09:00';
insert into ctx select 'a3', appointment_id from public.appointment where date_time = '2026-11-07 09:00';
insert into ctx select 'a4', appointment_id from public.appointment where date_time = '2026-11-08 09:00';

insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
  select (select v from ctx where k = 'a1'), 'pain-location', 1, 'Q1', true
  union all select (select v from ctx where k = 'a1'), 'pain-location', 2, 'Q2', false
  union all select (select v from ctx where k = 'a2'), 'management', 1, 'Q4', false
  union all select (select v from ctx where k = 'a3'), 'management', 1, 'Q3', true;

select has_trigger('public', 'appointment_questions', 'appointment_questions_answer_needs_consent',
  'the answer consent trigger exists');
select has_trigger('public', 'appointment', 'appointment_save_needs_question',
  'the save needs a question trigger exists');

-- ===== patient A writing the tables directly =====
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

-- an answer needs recorded consent, even when written straight to the table
select throws_ok(
  $$update public.appointment_questions set answer = 'direct' where question = 'Q1'$$,
  'P0001', 'CONSENT_REQUIRED', 'a direct answer update is refused without consent');
select ok((select answer is null from public.appointment_questions where question = 'Q1'),
  'the refused answer was not stored');
select throws_ok(
  format('insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected, answer) values (%s, ''management'', 9, ''Q9'', true, ''direct'')',
    (select v from ctx where k = 'a1')),
  'P0001', 'CONSENT_REQUIRED', 'a direct insert with an answer is refused without consent');
select lives_ok(
  $$update public.appointment_questions set answer = null where question = 'Q1'$$,
  'clearing an answer does not need consent');
select lives_ok(
  $$update public.appointment_questions set is_selected = true where question = 'Q2'$$,
  'changing the plan without changing an answer does not need consent');
select lives_ok(
  $$update public.appointment_questions set answer = 'with consent' where question = 'Q3'$$,
  'a direct answer is accepted once consent is recorded');
select ok((select answer = 'with consent' from public.appointment_questions where question = 'Q3'),
  'the answer was stored');
select lives_ok(
  $$update public.appointment_questions set answer = 'with consent' where question = 'Q3'$$,
  'writing the same answer again is accepted');

-- an appointment with suggestions needs a question on the plan to be saved
select throws_ok(
  format('update public.appointment set status = ''saved'', saved_at = now() where appointment_id = %s',
    (select v from ctx where k = 'a2')),
  'P0001', 'NO_QUESTIONS', 'a direct save is refused when no question is on the plan');
select ok(
  (select status = 'draft' from public.appointment where appointment_id = (select v from ctx where k = 'a2')),
  'the appointment is still a draft');
select lives_ok(
  format('update public.appointment set status = ''saved'', saved_at = now() where appointment_id = %s',
    (select v from ctx where k = 'a1')),
  'a direct save is accepted when a question is on the plan');
select lives_ok(
  format('update public.appointment set status = ''saved'', saved_at = now() where appointment_id = %s',
    (select v from ctx where k = 'a4')),
  'an appointment with no suggestions can be saved');

-- the functions still work with the triggers in place
select throws_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q1''), ''answer_text'', ''hi'')))',
    (select v from ctx where k = 'a1')),
  'P0001', 'CONSENT_REQUIRED', 'the answers function still refuses an answer without consent');
select lives_ok(
  format('select public.save_appointment_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'', (select question_id from public.appointment_questions where question = ''Q3''), ''answer_text'', ''via function'')))',
    (select v from ctx where k = 'a3')),
  'the answers function still saves an answer once consent is recorded');

-- support people: a non-numeric id is a normal error code, not a raw cast error
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, ''[{"support_person_id":"abc"}]'')',
    (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SUPPORT_PERSON', 'a non-numeric support_person_id is rejected with a normal code');
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, ''[{"support_person_id":"12; drop"}]'')',
    (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SUPPORT_PERSON', 'a support_person_id with extra characters is rejected');
select lives_ok(
  format('select * from public.save_appointment_support_people(%s, ''[]'')', (select v from ctx where k = 'a1')),
  'an empty list is still accepted');

-- ===== patient B cannot use the direct paths on A's rows =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, ''[]'')', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'patient B still cannot change patient A''s support people');

select * from finish();
rollback;
