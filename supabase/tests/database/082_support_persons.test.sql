begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

-- fixtures (inserted as the superuser): two patients, one appointment for Test A
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.users (name, auth_id) values
  ('Test A', '00000000-0000-0000-0000-00000000000a'),
  ('Test B', '00000000-0000-0000-0000-00000000000b');
insert into public.patients (sex, users_id) values
  ('Female', (select users_id from public.users where name = 'Test A')),
  ('Female', (select users_id from public.users where name = 'Test B'));
insert into public.appointment (patient_id, date_time)
  values ((select p.patient_id from public.patients p join public.users u using (users_id)
           where u.name = 'Test A'), '2026-11-05 14:30');

-- columns
select col_is_null('public', 'support_persons', 'phone_number', 'phone_number is nullable');
select col_is_null('public', 'support_persons', 'email', 'email is nullable');
select col_type_is('public', 'support_persons', 'name', 'character varying(100)',
  'name is varchar(100)');
select col_type_is('public', 'support_persons', 'email', 'character varying(254)',
  'email is varchar(254)');

-- a name is the only required detail
select lives_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Bron', 'none')$$,
  'a support person with only a name and access type can be inserted');
select lives_ok(
  $$insert into public.support_persons (patient_id, name, phone_number, email, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Sam', '+61411111111', 's@example.com', 'questions,answers')$$,
  'a support person with a mobile number, email and both permissions can be inserted');
select lives_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Alex', 'none')$$,
  'several support people without a phone number are allowed');
select lives_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Quinn', 'questions')$$,
  'access_type questions is accepted');
select lives_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Ari', 'answers')$$,
  'access_type answers is accepted');

-- phone rule: Australian mobile in E.164
select throws_ok(
  $$insert into public.support_persons (patient_id, name, phone_number, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Land', '+61291234567', 'none')$$,
  '23514', null, 'a landline number is rejected');
select throws_ok(
  $$insert into public.support_persons (patient_id, name, phone_number, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Local', '0411111112', 'none')$$,
  '23514', null, 'a local-format number is rejected');
select throws_ok(
  $$insert into public.support_persons (patient_id, name, phone_number, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Spaced', '+61 41111111', 'none')$$,
  '23514', null, 'a number with a space is rejected (12 characters, so it fits the column)');

-- access type rule
select throws_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Odd', 'everything')$$,
  '23514', null, 'an unknown access_type is rejected');
select throws_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Odd', 'questions, answers')$$,
  '23514', null, 'access_type with a space after the comma is rejected');
select throws_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Odd', 'answers,questions')$$,
  '23514', null, 'access_type with the tokens in another order is rejected');

-- name rule
select throws_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), '   ', 'none')$$,
  '23514', null, 'a blank name is rejected');
select throws_ok(
  $$insert into public.support_persons (patient_id, name, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), repeat('n', 101), 'none')$$,
  '22001', null, 'a name over 100 characters is rejected');

-- the same person is not added twice for one patient, but another patient may add them
select throws_ok(
  $$insert into public.support_persons (patient_id, name, phone_number, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), 'Sam again', '+61411111111', 'none')$$,
  '23505', null, 'the same phone number twice for one patient is rejected');
select lives_ok(
  $$insert into public.support_persons (patient_id, name, phone_number, access_type)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test B'), 'Sam', '+61411111111', 'none')$$,
  'another patient can add the same phone number');

-- deleting a person removes their appointment links
select lives_ok(
  $$insert into public.appointment_has_support_persons (appointment_id, support_person_id)
    values ((select appointment_id from public.appointment limit 1),
            (select support_person_id from public.support_persons
              where name = 'Sam' and patient_id = (select patient_id from public.appointment limit 1)))$$,
  'a support person can be linked to an appointment');
select lives_ok(
  $$delete from public.support_persons
     where name = 'Sam' and patient_id = (select patient_id from public.appointment limit 1)$$,
  'a linked support person can be deleted');
select ok(
  (select count(*) = 0 from public.appointment_has_support_persons),
  'deleting a support person removed their appointment links');

select * from finish();
rollback;
