begin;
create extension if not exists pgtap with schema extensions;
select plan(45);

-- fixtures (inserted as the superuser): A and B are patients with one appointment each,
-- C is a support person, D has no profile
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
  select p.patient_id, '2026-11-05 14:30'
    from public.patients p;

create temp table ctx (k text primary key, v int);
grant all on ctx to authenticated;
insert into ctx
  select 'a1', a.appointment_id
    from public.appointment a
    join public.patients p using (patient_id)
    join public.users u using (users_id)
   where u.name = 'Test A';
insert into ctx
  select 'b1', a.appointment_id
    from public.appointment a
    join public.patients p using (patient_id)
    join public.users u using (users_id)
   where u.name = 'Test B';

-- function privileges
select has_function('public', 'save_support_person',
  array['text', 'text', 'text', 'text', 'integer'], 'save_support_person exists');
select has_function('public', 'save_appointment_support_people',
  array['integer', 'jsonb'], 'save_appointment_support_people exists');
select has_function('public', 'list_my_support_persons', 'list_my_support_persons exists');
select ok(
  not has_function_privilege('anon', 'public.save_support_person(text,text,text,text,int)', 'execute'),
  'anon cannot execute save_support_person');
select ok(
  not has_function_privilege('anon', 'public.save_appointment_support_people(int,jsonb)', 'execute'),
  'anon cannot execute save_appointment_support_people');
select ok(
  not has_function_privilege('anon', 'public.list_my_support_persons()', 'execute'),
  'anon cannot execute list_my_support_persons');
select ok(
  has_function_privilege('authenticated', 'public.save_support_person(text,text,text,text,int)', 'execute')
  and has_function_privilege('authenticated', 'public.save_appointment_support_people(int,jsonb)', 'execute')
  and has_function_privilege('authenticated', 'public.list_my_support_persons()', 'execute'),
  'authenticated can execute all three functions');

-- ===== patient A =====
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

-- validation
select throws_ok($$select public.save_support_person('x', '0411111111', null, 'none')$$,
  'P0001', 'INVALID_PHONE', 'a local-format phone number is rejected');
select throws_ok($$select public.save_support_person('x', '+61411111111', null, 'everything')$$,
  'P0001', 'INVALID_ACCESS_TYPE', 'an unknown access type is rejected');
select throws_ok($$select public.save_support_person('  ', '+61411111111', null, 'none')$$,
  'P0001', 'INVALID_SUPPORT_PERSON', 'a blank name is rejected');
select throws_ok(format('select public.save_support_person(%L, null, null, ''none'')', repeat('n', 101)),
  'P0001', 'VALUE_TOO_LONG', 'a name over 100 characters is rejected');
select throws_ok(
  format('select public.save_support_person(''x'', null, %L, ''none'')', repeat('e', 255)),
  'P0001', 'VALUE_TOO_LONG', 'an email over 254 characters is rejected');
select throws_ok($$select public.save_appointment_support_people(null, '[]')$$,
  'P0001', 'NOT_FOUND', 'a missing appointment id is rejected');
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, ''{}'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SUPPORT_PERSON', 'people that are not an array are rejected');
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, ''[1]'')', (select v from ctx where k = 'a1')),
  'P0001', 'INVALID_SUPPORT_PERSON', 'a person that is not an object is rejected');

-- a third person is refused and nothing is stored (all or nothing)
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, ''[{"name":"a","phone":"+61411111111","access_type":"none"},{"name":"b","phone":"+61422222222","access_type":"none"},{"name":"c","phone":"+61433333333","access_type":"none"}]'')',
    (select v from ctx where k = 'a1')),
  'P0001', 'TOO_MANY_SUPPORT_PEOPLE', 'three support people on one appointment are rejected');
select ok((select count(*) = 0 from public.support_persons),
  'a rejected save created no support people');

-- two support people can be linked
select ok(
  (select count(*) = 2 from public.save_appointment_support_people(
    (select v from ctx where k = 'a1'),
    '[{"name":"Bron","phone":"+61411111111","email":"b@example.com","access_type":"questions"},{"name":"Sam","phone":"+61422222222","access_type":"answers"}]')),
  'two new support people are created and linked');
select ok(
  (select count(*) = 2
      and bool_or(name = 'Bron' and phone_number = '+61411111111' and access_type = 'questions')
      and bool_or(name = 'Sam' and access_type = 'answers')
     from public.support_persons),
  'they are stored with E.164 phones and their access types');

-- replacing the list keeps the person who stays and only unlinks the other
select ok(
  (select count(*) = 1 from public.save_appointment_support_people(
    (select v from ctx where k = 'a1'),
    jsonb_build_array(jsonb_build_object('support_person_id',
      (select support_person_id from public.support_persons where name = 'Bron'))))),
  'replacing the list with one existing person leaves one');
select ok((select count(*) = 2 from public.support_persons),
  'the unlinked person is still a support person for the patient');
select ok((select count(*) = 1 from public.appointment_has_support_persons),
  'one link is left on the appointment');

-- adding the same number again updates the person
select lives_ok(
  $$select public.save_support_person('Bron R', '+61411111111', null, 'questions,answers')$$,
  'saving a number the patient already has works');
select ok(
  (select count(*) = 2 and bool_or(name = 'Bron R' and access_type = 'questions,answers')
     from public.support_persons),
  'it updated that person instead of adding a duplicate');
select throws_ok(
  format('select public.save_support_person(''Sam'', ''+61411111111'', null, ''none'', %s)',
    (select support_person_id from public.support_persons where name = 'Sam')),
  'P0001', 'DUPLICATE_SUPPORT_PERSON', 'changing a person''s number to one already used is rejected');

-- editing by id
select lives_ok(
  format('select public.save_support_person(''Sam S'', ''+61422222222'', null, ''answers'', %s)',
    (select support_person_id from public.support_persons where name = 'Sam')),
  'a support person can be edited by id');
select ok((select count(*) = 1 from public.support_persons where name = 'Sam S'),
  'the edit changed the name');
select throws_ok(
  $$select public.save_support_person('Nobody', null, null, 'none', 99999)$$,
  'P0001', 'NOT_FOUND', 'editing a support person that does not exist is rejected');

-- an empty list means no support person; the people themselves are kept
select lives_ok(
  format('select * from public.save_appointment_support_people(%s, ''[]'')', (select v from ctx where k = 'a1')),
  'an empty list is accepted');
select ok((select count(*) = 0 from public.appointment_has_support_persons),
  'an empty list unlinks everyone');
select ok((select count(*) = 2 from public.list_my_support_persons()),
  'the patient''s support people are listed');

-- the same person twice in one list counts once
select ok(
  (select count(*) = 1 from public.save_appointment_support_people(
    (select v from ctx where k = 'a1'),
    jsonb_build_array(
      jsonb_build_object('support_person_id', (select support_person_id from public.support_persons where name = 'Bron R')),
      jsonb_build_object('support_person_id', (select support_person_id from public.support_persons where name = 'Bron R'))))),
  'the same person listed twice is linked once');

-- a new person with no access given gets none
select ok(
  (select count(*) = 1 and bool_and(name = 'Zed' and access_type = 'none')
     from public.save_appointment_support_people(
       (select v from ctx where k = 'a1'), '[{"name":"Zed","phone":"+61433333333"}]')),
  'a new person without an access type gets none and replaces the list');
select ok(
  (select count(*) = 3 from public.support_persons)
  and (select count(*) = 1 from public.appointment_has_support_persons),
  'the earlier people were kept and only Zed is linked');

-- ===== patient B =====
reset role;
insert into ctx select 'zed', support_person_id from public.support_persons where name = 'Zed';
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);
select ok((select count(*) = 0 from public.list_my_support_persons()),
  'patient B has no support people of their own yet');
select ok((select count(*) = 0 from public.support_persons),
  'patient B sees none of patient A''s support people');
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, ''[]'')', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'patient B cannot change the support people on patient A''s appointment');
select ok(
  (select count(*) = 1 from public.save_appointment_support_people(
    (select v from ctx where k = 'b1'), '[{"name":"Bea","phone":"+61444444444","access_type":"none"}]')),
  'patient B can add their own support person');
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, jsonb_build_array(jsonb_build_object(''support_person_id'', %s)))',
    (select v from ctx where k = 'b1'), (select v from ctx where k = 'zed')),
  'P0001', 'NOT_FOUND', 'patient B cannot link patient A''s support person');
select throws_ok(
  format('select public.save_support_person(''Hacked'', ''+61455555555'', null, ''none'', %s)',
    (select v from ctx where k = 'zed')),
  'P0001', 'NOT_FOUND', 'patient B cannot edit patient A''s support person');

-- ===== C: a support person =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000c', 'role', 'authenticated')::text, true);
select throws_ok($$select public.save_support_person('X', null, null, 'none')$$,
  'P0001', 'NOT_A_PATIENT', 'a support person cannot create support people');
select throws_ok(
  format('select * from public.save_appointment_support_people(%s, ''[]'')', (select v from ctx where k = 'a1')),
  'P0001', 'NOT_FOUND', 'a support person cannot change a patient''s appointment');
select ok((select count(*) = 0 from public.list_my_support_persons()),
  'a support person has no support people of their own');

-- ===== D: no profile =====
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000d', 'role', 'authenticated')::text, true);
select throws_ok($$select public.save_support_person('X', null, null, 'none')$$,
  'P0001', 'NO_PROFILE', 'an account without a profile is rejected');

reset role;
select ok(
  (select count(*) = 3 and bool_or(name = 'Zed') and not bool_or(name = 'Hacked')
     from public.support_persons
    where patient_id = (select patient_id from public.appointment where appointment_id = (select v from ctx where k = 'a1'))),
  'patient A''s support people were not changed by anyone else');

select * from finish();
rollback;
