begin;
create extension if not exists pgtap with schema extensions;

select plan(19);

-- fixtures (run as the migration/superuser role)
-- k1 patient with an appointment, a question and support person k2 linked and ACCEPTED;
-- k3 another patient. Only an accepted person proves the lockdown: the old policies already
-- ignored a pending one (the plan's mutation check).
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000c1'),
  ('00000000-0000-0000-0000-0000000000c2'),
  ('00000000-0000-0000-0000-0000000000c3');
insert into public.users (name, auth_id, user_type, phone_number) values
  ('Kai', '00000000-0000-0000-0000-0000000000c1', 'patient', '+61491570006'),
  ('Kim', '00000000-0000-0000-0000-0000000000c2', 'support_person', '+61491570007'),
  ('Kit', '00000000-0000-0000-0000-0000000000c3', 'patient', '+61491570009');
insert into public.patients (users_id, sex) select users_id, 'Female' from public.users where user_type = 'patient';
insert into public.appointment (patient_id, date_time, health_service, practitioner_name)
  select p.patient_id, timestamp '2026-11-05 14:30', 'GP', 'Dr Lee'
    from public.patients p join public.users u using (users_id) where u.name = 'Kai';
insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
  select appointment_id, 'pain-impact', 1, 'Q1', true from public.appointment;
insert into public.support_persons (patient_id, name, phone_number, access_type, users_id, status, responded_at)
  select p.patient_id, 'Kim', '+61491570007', 'questions,answers',
         (select users_id from public.users where name = 'Kim'), 'accepted', now()
    from public.patients p join public.users u using (users_id) where u.name = 'Kai';
insert into public.appointment_has_support_persons (appointment_id, support_person_id)
  select a.appointment_id, sp.support_person_id from public.appointment a, public.support_persons sp;

set local role authenticated;

-- accepted support person k2: no direct access to the patient's tables
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c2', 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.appointment), 0, 'an accepted support person reads no appointments directly');
select is((select count(*)::int from public.appointment_questions), 0, 'an accepted support person reads no questions directly');
select is((select count(*)::int from public.appointment_has_support_persons), 0,
  'an accepted support person reads no appointment links directly');
select is((select count(*)::int from public.patients), 0, 'an accepted support person reads no patients rows');
select is((select count(*)::int from public.support_persons), 0,
  'an accepted support person cannot read their own invitation row');
select ok((select count(*) = 1 and bool_and(name = 'Kim') from public.users),
  'an accepted support person sees only their own users row');
select lives_ok($$update public.appointment_questions set answer = 'sneaky'$$,
  'a direct update of the questions runs but matches no row');
select lives_ok($$update public.support_persons set access_type = 'none'$$,
  'a direct update of the invitation runs but matches no row');
select lives_ok($$update public.appointment set practitioner_name = 'Hacked'$$,
  'a direct update of the appointment runs but matches no row');

reset role;
select ok((select answer is null from public.appointment_questions)
          and (select access_type = 'questions,answers' from public.support_persons)
          and (select practitioner_name = 'Dr Lee' from public.appointment),
  'nothing was changed by the support person''s direct updates');
set local role authenticated;

-- patient k1 still reads and changes their own rows
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c1', 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.appointment), 1, 'the patient reads their own appointment');
select is((select count(*)::int from public.appointment_questions), 1, 'the patient reads their own questions');
select is((select count(*)::int from public.appointment_has_support_persons), 1, 'the patient reads their own links');
select is((select count(*)::int from public.patients), 1, 'the patient reads their own patients row only');
select is((select count(*)::int from public.support_persons), 1, 'the patient reads their own support persons');
select ok((select count(*) = 1 and bool_and(name = 'Kai') from public.users),
  'the patient sees only their own users row');
select lives_ok($$update public.appointment_questions set question = 'Q1 edited'$$,
  'the patient can change their own question');
select is((select question::text from public.appointment_questions), 'Q1 edited', 'the patient''s change is saved');

-- another patient k3 sees nothing of k1's
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c3', 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.appointment), 0, 'another patient reads no appointments of k1');

reset role;
select * from finish();
rollback;
