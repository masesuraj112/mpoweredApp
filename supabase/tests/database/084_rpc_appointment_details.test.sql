begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

-- fixtures (inserted as the superuser): A and B are patients, C is a support person, D has no profile
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

create temp table ctx (k text primary key, v int);
grant all on ctx to authenticated;

-- function privileges
select has_function('public', 'save_appointment_details',
  array['timestamp without time zone', 'text', 'text', 'integer'],
  'save_appointment_details exists');
select has_function('public', 'list_my_appointments', 'list_my_appointments exists');
select ok(
  not has_function_privilege('anon',
    'public.save_appointment_details(timestamp,text,text,int)', 'execute'),
  'anon cannot execute save_appointment_details');
select ok(
  not has_function_privilege('anon', 'public.list_my_appointments()', 'execute'),
  'anon cannot execute list_my_appointments');
select ok(
  has_function_privilege('authenticated',
    'public.save_appointment_details(timestamp,text,text,int)', 'execute')
  and has_function_privilege('authenticated', 'public.list_my_appointments()', 'execute'),
  'authenticated can execute both functions');

-- ===== patient A =====
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

insert into ctx select 'appt', public.save_appointment_details('2026-11-05 14:30', '  Dr Lee ', 'GP');

select ok(
  (select date_time = '2026-11-05 14:30' and practitioner_name = 'Dr Lee'
      and health_service = 'GP' and status = 'draft'
     from public.appointment where appointment_id = (select v from ctx where k = 'appt')),
  'details are created as a draft, trimmed');
select ok(
  (select date_time::text = '2026-11-05 14:30:00'
     from public.appointment where appointment_id = (select v from ctx where k = 'appt')),
  'the local time is kept exactly (no time zone shift)');
select ok((select count(*) = 0 from public.list_my_appointments()), 'a draft is not listed');

select throws_ok($$select public.save_appointment_details(null, 'x', 'GP')$$,
  'P0001', 'NO_DATE_TIME', 'a missing date and time is rejected');
select throws_ok(
  format('select public.save_appointment_details(''2026-11-05 14:30'', %L, ''GP'')', repeat('x', 101)),
  'P0001', 'VALUE_TOO_LONG', 'a practitioner name over 100 characters is rejected');
select throws_ok(
  format('select public.save_appointment_details(''2026-11-05 14:30'', ''Dr Lee'', %L)', repeat('x', 101)),
  'P0001', 'VALUE_TOO_LONG', 'a health service over 100 characters is rejected');
select lives_ok(
  format('select public.save_appointment_details(''2026-11-07 10:00'', %L, ''GP'')', repeat('x', 100)),
  'a practitioner name of exactly 100 characters is accepted');

select lives_ok(
  format('select public.save_appointment_details(''2026-11-06 09:00'', '''', null, %s)',
    (select v from ctx where k = 'appt')),
  'an appointment can be edited');
select ok(
  (select date_time = '2026-11-06 09:00' and practitioner_name is null and health_service is null
     from public.appointment where appointment_id = (select v from ctx where k = 'appt')),
  'an edit changes the time and stores blank values as NULL');
select throws_ok(
  $$select public.save_appointment_details('2026-11-06 09:00', null, null, 99999)$$,
  'P0001', 'NOT_FOUND', 'editing an appointment that does not exist is rejected');

-- the list shows saved appointments only
reset role;
update public.appointment set status = 'saved', saved_at = now()
 where appointment_id = (select v from ctx where k = 'appt');
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);
select ok(
  (select count(*) = 1 and bool_and(status = 'saved') from public.list_my_appointments()),
  'the list shows the saved appointment and not the other drafts');
select ok(
  (select date_time = '2026-11-06 09:00' from public.list_my_appointments()),
  'the list keeps the local time');

-- ===== patient B: cannot touch A's appointment =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);
select ok((select count(*) = 0 from public.list_my_appointments()), 'patient B''s list is empty');
select throws_ok(
  format('select public.save_appointment_details(''2026-12-25 10:00'', ''Hacker'', null, %s)',
    (select v from ctx where k = 'appt')),
  'P0001', 'NOT_FOUND', 'patient B cannot edit patient A''s appointment');

-- ===== C: a support person =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000c', 'role', 'authenticated')::text, true);
select throws_ok($$select public.save_appointment_details('2026-11-06 09:00', null, null)$$,
  'P0001', 'NOT_A_PATIENT', 'a support person cannot create an appointment');
select ok((select count(*) = 0 from public.list_my_appointments()),
  'a support person has no patient appointments');

-- ===== D: signed in but no profile =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000d', 'role', 'authenticated')::text, true);
select throws_ok($$select public.save_appointment_details('2026-11-06 09:00', null, null)$$,
  'P0001', 'NO_PROFILE', 'an account without a profile is rejected');

reset role;
select ok(
  (select date_time = '2026-11-06 09:00' and practitioner_name is null
     from public.appointment where appointment_id = (select v from ctx where k = 'appt')),
  'patient A''s appointment was not changed by anyone else');

select * from finish();
rollback;
