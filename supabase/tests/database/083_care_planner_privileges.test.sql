begin;
create extension if not exists pgtap with schema extensions;
select plan(35);

-- fixtures (inserted as the superuser): patients A and B; A has two appointments and three support people
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.users (name, auth_id) values
  ('Test A', '00000000-0000-0000-0000-00000000000a'),
  ('Test B', '00000000-0000-0000-0000-00000000000b');
insert into public.patients (sex, users_id) values
  ('Female', (select users_id from public.users where name = 'Test A')),
  ('Female', (select users_id from public.users where name = 'Test B'));
insert into public.appointment (patient_id, date_time) values
  ((select p.patient_id from public.patients p join public.users u using (users_id) where u.name = 'Test A'),
   '2026-11-05 14:30'),
  ((select p.patient_id from public.patients p join public.users u using (users_id) where u.name = 'Test A'),
   '2026-11-06 09:00');
insert into public.support_persons (patient_id, name, access_type)
  select p.patient_id, n.name, 'none'
    from public.patients p
    join public.users u using (users_id)
    cross join (values ('Bron'), ('Sam'), ('Alex')) as n(name)
   where u.name = 'Test A';

-- appointment_questions: read, create and update, but never delete
select ok(has_table_privilege('authenticated', 'public.appointment_questions', 'SELECT'),
  'authenticated can select appointment_questions');
select ok(has_table_privilege('authenticated', 'public.appointment_questions', 'INSERT'),
  'authenticated can insert appointment_questions');
select ok(has_table_privilege('authenticated', 'public.appointment_questions', 'UPDATE'),
  'authenticated can update appointment_questions');
select ok(not has_table_privilege('authenticated', 'public.appointment_questions', 'DELETE'),
  'authenticated cannot delete appointment_questions');
select ok(not has_table_privilege('authenticated', 'public.appointment_questions', 'TRUNCATE'),
  'authenticated cannot truncate appointment_questions');
select ok(not has_table_privilege('authenticated', 'public.appointment_questions', 'TRIGGER'),
  'authenticated cannot create triggers on appointment_questions');
select ok(not has_table_privilege('authenticated', 'public.appointment_questions', 'REFERENCES'),
  'authenticated cannot reference appointment_questions');

-- support_persons: patients add, edit and remove their own
select ok(has_table_privilege('authenticated', 'public.support_persons', 'SELECT'),
  'authenticated can select support_persons');
select ok(has_table_privilege('authenticated', 'public.support_persons', 'INSERT'),
  'authenticated can insert support_persons');
select ok(has_table_privilege('authenticated', 'public.support_persons', 'UPDATE'),
  'authenticated can update support_persons');
select ok(has_table_privilege('authenticated', 'public.support_persons', 'DELETE'),
  'authenticated can delete support_persons');
select ok(not has_table_privilege('authenticated', 'public.support_persons', 'TRUNCATE'),
  'authenticated cannot truncate support_persons');
select ok(not has_table_privilege('authenticated', 'public.support_persons', 'TRIGGER'),
  'authenticated cannot create triggers on support_persons');
select ok(not has_table_privilege('authenticated', 'public.support_persons', 'REFERENCES'),
  'authenticated cannot reference support_persons');

-- appointment_has_support_persons: links are added and removed, never edited
select ok(has_table_privilege('authenticated', 'public.appointment_has_support_persons', 'SELECT'),
  'authenticated can select appointment_has_support_persons');
select ok(has_table_privilege('authenticated', 'public.appointment_has_support_persons', 'INSERT'),
  'authenticated can insert appointment_has_support_persons');
select ok(has_table_privilege('authenticated', 'public.appointment_has_support_persons', 'DELETE'),
  'authenticated can delete appointment_has_support_persons');
select ok(not has_table_privilege('authenticated', 'public.appointment_has_support_persons', 'UPDATE'),
  'authenticated cannot update appointment_has_support_persons');
select ok(not has_table_privilege('authenticated', 'public.appointment_has_support_persons', 'TRUNCATE'),
  'authenticated cannot truncate appointment_has_support_persons');
select ok(not has_table_privilege('authenticated', 'public.appointment_has_support_persons', 'TRIGGER'),
  'authenticated cannot create triggers on appointment_has_support_persons');
select ok(not has_table_privilege('authenticated', 'public.appointment_has_support_persons', 'REFERENCES'),
  'authenticated cannot reference appointment_has_support_persons');

-- anon has nothing on any of the three
select ok(
  not (has_table_privilege('anon', 'public.appointment_questions', 'SELECT')
    or has_table_privilege('anon', 'public.appointment_questions', 'INSERT')
    or has_table_privilege('anon', 'public.appointment_questions', 'UPDATE')
    or has_table_privilege('anon', 'public.appointment_questions', 'DELETE')),
  'anon has no access to appointment_questions');
select ok(
  not (has_table_privilege('anon', 'public.support_persons', 'SELECT')
    or has_table_privilege('anon', 'public.support_persons', 'INSERT')
    or has_table_privilege('anon', 'public.support_persons', 'UPDATE')
    or has_table_privilege('anon', 'public.support_persons', 'DELETE')),
  'anon has no access to support_persons');
select ok(
  not (has_table_privilege('anon', 'public.appointment_has_support_persons', 'SELECT')
    or has_table_privilege('anon', 'public.appointment_has_support_persons', 'INSERT')
    or has_table_privilege('anon', 'public.appointment_has_support_persons', 'UPDATE')
    or has_table_privilege('anon', 'public.appointment_has_support_persons', 'DELETE')),
  'anon has no access to appointment_has_support_persons');

-- the delete policy and the two-person trigger exist
select ok(
  exists (select 1 from pg_policies
           where schemaname = 'public' and tablename = 'appointment_has_support_persons'
             and policyname = 'ahsp_delete' and cmd = 'DELETE'),
  'the ahsp_delete policy exists');
select has_trigger('public', 'appointment_has_support_persons', 'ahsp_limit_two',
  'the two-support-people trigger exists');

-- at most two support people per appointment
select lives_ok(
  $$insert into public.appointment_has_support_persons (appointment_id, support_person_id)
    values ((select min(appointment_id) from public.appointment),
            (select support_person_id from public.support_persons where name = 'Bron'))$$,
  'the first support person can be linked');
select lives_ok(
  $$insert into public.appointment_has_support_persons (appointment_id, support_person_id)
    values ((select min(appointment_id) from public.appointment),
            (select support_person_id from public.support_persons where name = 'Sam'))$$,
  'the second support person can be linked');
select throws_ok(
  $$insert into public.appointment_has_support_persons (appointment_id, support_person_id)
    values ((select min(appointment_id) from public.appointment),
            (select support_person_id from public.support_persons where name = 'Alex'))$$,
  'P0001', 'TOO_MANY_SUPPORT_PEOPLE', 'a third support person on one appointment is rejected');
select lives_ok(
  $$insert into public.appointment_has_support_persons (appointment_id, support_person_id)
    values ((select max(appointment_id) from public.appointment),
            (select support_person_id from public.support_persons where name = 'Alex'))$$,
  'the limit is per appointment: another appointment can still link someone');

-- patient B cannot see or remove patient A's links
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);
select ok(
  (select count(*) = 0 from public.appointment_has_support_persons),
  'patient B sees none of patient A''s links');
select lives_ok(
  $$delete from public.appointment_has_support_persons$$,
  'patient B deleting links runs but removes nothing');
reset role;
select ok(
  (select count(*) = 3 from public.appointment_has_support_persons),
  'all three of patient A''s links are still there');

-- patient A can unlink their own support person
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);
select lives_ok(
  $$delete from public.appointment_has_support_persons
     where support_person_id = (select support_person_id from public.support_persons where name = 'Bron')$$,
  'patient A can unlink their own support person');
select ok(
  (select count(*) = 2 from public.appointment_has_support_persons),
  'only that link was removed');
reset role;

select * from finish();
rollback;
