begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

-- fixtures (inserted as the superuser): patients A and B, each with one appointment.
-- A has support people Bron and Sam; B has Bea.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.users (name, auth_id, user_type) values
  ('Test A', '00000000-0000-0000-0000-00000000000a', 'patient'),
  ('Test B', '00000000-0000-0000-0000-00000000000b', 'patient');
insert into public.patients (sex, users_id)
  select 'Female', users_id from public.users;
insert into public.appointment (patient_id, date_time)
  select patient_id, '2026-11-05 14:30' from public.patients;
insert into public.support_persons (patient_id, name, access_type)
  select p.patient_id, n.name, 'none'
    from public.patients p
    join public.users u using (users_id)
    join (values ('Test A', 'Bron'), ('Test A', 'Sam'), ('Test B', 'Bea')) as n(owner, name)
      on n.owner = u.name;

create temp table ctx (k text primary key, v int);
grant all on ctx to authenticated;
insert into ctx
  select 'a1', a.appointment_id from public.appointment a
    join public.patients p using (patient_id) join public.users u using (users_id)
   where u.name = 'Test A';
insert into ctx
  select 'b1', a.appointment_id from public.appointment a
    join public.patients p using (patient_id) join public.users u using (users_id)
   where u.name = 'Test B';
insert into ctx select 'bron', support_person_id from public.support_persons where name = 'Bron';
insert into ctx select 'sam', support_person_id from public.support_persons where name = 'Sam';
insert into ctx select 'bea', support_person_id from public.support_persons where name = 'Bea';

-- ===== patient A =====
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

-- saving the same two people again works (it used to fail with TOO_MANY_SUPPORT_PEOPLE)
select lives_ok(
  format('select * from public.save_appointment_support_people(%s, jsonb_build_array(jsonb_build_object(''support_person_id'', %s), jsonb_build_object(''support_person_id'', %s)))',
    (select v from ctx where k = 'a1'), (select v from ctx where k = 'bron'), (select v from ctx where k = 'sam')),
  'two existing people can be linked');
select ok((select count(*) = 2 from public.appointment_has_support_persons),
  'both are linked');
select lives_ok(
  format('select * from public.save_appointment_support_people(%s, jsonb_build_array(jsonb_build_object(''support_person_id'', %s), jsonb_build_object(''support_person_id'', %s)))',
    (select v from ctx where k = 'a1'), (select v from ctx where k = 'bron'), (select v from ctx where k = 'sam')),
  'saving the same two people again is accepted');
select ok((select count(*) = 2 from public.appointment_has_support_persons),
  'there are still exactly two links');

-- replacing and restoring the list
select lives_ok(
  format('select * from public.save_appointment_support_people(%s, jsonb_build_array(jsonb_build_object(''support_person_id'', %s)))',
    (select v from ctx where k = 'a1'), (select v from ctx where k = 'bron')),
  'the list can be cut back to one person');
select ok(
  (select count(*) = 1 and bool_and(support_person_id = (select v from ctx where k = 'bron'))
     from public.appointment_has_support_persons),
  'only Bron is linked');
select lives_ok(
  format('select * from public.save_appointment_support_people(%s, jsonb_build_array(jsonb_build_object(''support_person_id'', %s), jsonb_build_object(''support_person_id'', %s)))',
    (select v from ctx where k = 'a1'), (select v from ctx where k = 'bron'), (select v from ctx where k = 'sam')),
  'the second person can be added back');
select ok((select count(*) = 2 from public.appointment_has_support_persons),
  'both are linked again');
select lives_ok(
  format('select * from public.save_appointment_support_people(%s, ''[]'')', (select v from ctx where k = 'a1')),
  'the list can be emptied');
select ok((select count(*) = 0 from public.appointment_has_support_persons),
  'nobody is linked');

-- a link must join the patient's own appointment to the patient's own support person
select lives_ok(
  format('insert into public.appointment_has_support_persons (appointment_id, support_person_id) values (%s, %s)',
    (select v from ctx where k = 'a1'), (select v from ctx where k = 'bron')),
  'a patient can link their own support person to their own appointment directly');
select throws_ok(
  format('insert into public.appointment_has_support_persons (appointment_id, support_person_id) values (%s, %s)',
    (select v from ctx where k = 'a1'), (select v from ctx where k = 'bea')),
  '42501', null, 'a patient cannot link another patient''s support person');

-- ===== patient B =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);
select throws_ok(
  format('insert into public.appointment_has_support_persons (appointment_id, support_person_id) values (%s, %s)',
    (select v from ctx where k = 'b1'), (select v from ctx where k = 'bron')),
  '42501', null, 'patient B cannot link patient A''s support person to their own appointment');
select lives_ok(
  format('insert into public.appointment_has_support_persons (appointment_id, support_person_id) values (%s, %s)',
    (select v from ctx where k = 'b1'), (select v from ctx where k = 'bea')),
  'patient B can link their own support person');
select throws_ok(
  format('insert into public.appointment_has_support_persons (appointment_id, support_person_id) values (%s, %s)',
    (select v from ctx where k = 'a1'), (select v from ctx where k = 'bea')),
  '42501', null, 'patient B cannot link anyone to patient A''s appointment');

select * from finish();
rollback;
