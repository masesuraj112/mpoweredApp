begin;
create extension if not exists pgtap with schema extensions;

select plan(19);

-- fixtures (run as the migration/superuser role)
-- g1 patient being deleted, g2 another patient with the same kinds of data, g3 a support person
-- linked to both patients' appointments
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-0000000000a3');
insert into public.users (name, auth_id, user_type, phone_number) values
  ('Gia', '00000000-0000-0000-0000-0000000000a1', 'patient', '+61491570006'),
  ('Gus', '00000000-0000-0000-0000-0000000000a2', 'patient', '+61491570007'),
  ('Gem', '00000000-0000-0000-0000-0000000000a3', 'support_person', '+61491570008');
insert into public.patients (users_id, sex) select users_id, 'Female' from public.users where name in ('Gia', 'Gus');

create temp table ids (k text primary key, v int);
insert into ids select 'g1', users_id from public.users where name = 'Gia';
insert into ids select 'g2', users_id from public.users where name = 'Gus';
insert into ids select 'g3', users_id from public.users where name = 'Gem';
insert into ids select 'p1', patient_id from public.patients where users_id = (select v from ids where k = 'g1');
insert into ids select 'p2', patient_id from public.patients where users_id = (select v from ids where k = 'g2');
grant select on ids to service_role;

-- the same data for both patients
insert into public.patient_musko_skeletal_pain (patient_id, disease)
  select v, 'Arthritis' from ids where k in ('p1', 'p2');
insert into public.pain_assessment (users_id, "date", current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level)
  select v, date '2026-10-26', 5, 3, 7, 5 from ids where k in ('g1', 'g2');
insert into public.pain_location (pain_assessment_submission_id, pain_location)
  select submission_id, 'Knee' from public.pain_assessment;
insert into public.medications (users_id, name, form, strength_unit, strength)
  select v, 'Ibuprofen', 'tablets', 'mg', 200 from ids where k in ('g1', 'g2');
insert into public.dosage (medications_id, amount, unit_of_time, repeats_every)
  select medication_id, 1, 'days', 1 from public.medications;
insert into public.appointment (patient_id, date_time, health_service, practitioner_name)
  select v, timestamp '2026-11-05 14:30', 'GP', 'Dr Lee' from ids where k in ('p1', 'p2');
insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
  select appointment_id, 'pain-impact', 1, 'How long will recovery take?', true from public.appointment;
insert into public.support_persons (patient_id, name, phone_number, access_type, users_id)
  select v, 'Gem', '+61491570008', 'questions', (select v from ids where k = 'g3') from ids where k in ('p1', 'p2');
insert into public.appointment_has_support_persons (appointment_id, support_person_id)
  select a.appointment_id, sp.support_person_id
    from public.appointment a join public.support_persons sp on sp.patient_id = a.patient_id;
insert into public.user_settings (users_id) select v from ids where k in ('g1', 'g2', 'g3');
insert into public.weekly_reflection (users_id, week_start, entry, is_complete)
  select v, date '2026-10-26', 'Felt better this week', true from ids where k in ('g1', 'g2');

-- function and privileges
select has_function('public', 'delete_account', array['integer'], 'delete_account exists');
select ok(not has_function_privilege('anon', 'public.delete_account(int)', 'execute'), 'anon cannot execute');
select ok(not has_function_privilege('authenticated', 'public.delete_account(int)', 'execute'),
  'authenticated cannot execute (only the Edge Function may)');
select ok(has_function_privilege('service_role', 'public.delete_account(int)', 'execute'),
  'service_role can execute');

set local role service_role;
select throws_ok($$select public.delete_account(999999)$$, 'P0001', 'NOT_FOUND', 'an unknown user is rejected');

-- delete patient g1
select lives_ok($$select public.delete_account((select v from ids where k = 'g1'))$$, 'a patient account is deleted');
reset role;

select ok(not exists (select 1 from public.users where users_id = (select v from ids where k = 'g1'))
          and not exists (select 1 from public.patients where users_id = (select v from ids where k = 'g1')),
  'the users and patients rows are gone');
select ok(not exists (select 1 from public.patient_musko_skeletal_pain where patient_id = (select v from ids where k = 'p1')),
  'the conditions are gone');
select ok(not exists (select 1 from public.pain_assessment where users_id = (select v from ids where k = 'g1'))
          and (select count(*) from public.pain_location) = 1,
  'the pain assessment and its locations are gone');
select ok(not exists (select 1 from public.medications where users_id = (select v from ids where k = 'g1'))
          and (select count(*) from public.dosage) = 1,
  'the medications and their dosages are gone');
select ok(not exists (select 1 from public.appointment where patient_id = (select v from ids where k = 'p1'))
          and (select count(*) from public.appointment_questions) = 1,
  'the appointments and their questions are gone');
select ok(not exists (select 1 from public.support_persons where patient_id = (select v from ids where k = 'p1')),
  'the patient''s support persons are gone');
select ok(not exists (select 1 from public.user_settings where users_id = (select v from ids where k = 'g1')),
  'the notification settings are gone');
select ok(not exists (select 1 from public.weekly_reflection where users_id = (select v from ids where k = 'g1'))
          and exists (select 1 from public.weekly_reflection where users_id = (select v from ids where k = 'g2')),
  'the weekly reflection is gone and the other patient''s stays');
select ok((select count(*) from public.pain_assessment where users_id = (select v from ids where k = 'g2')) = 1
          and (select count(*) from public.appointment where patient_id = (select v from ids where k = 'p2')) = 1
          and (select count(*) from public.support_persons where patient_id = (select v from ids where k = 'p2')) = 1,
  'the other patient''s data is untouched');

-- delete support person g3
set local role service_role;
select lives_ok($$select public.delete_account((select v from ids where k = 'g3'))$$, 'a support person account is deleted');
reset role;

select ok(not exists (select 1 from public.users where users_id = (select v from ids where k = 'g3')),
  'the support person''s users row is gone');
select ok((select users_id is null and name = 'Gem' from public.support_persons
            where patient_id = (select v from ids where k = 'p2')),
  'the patient''s support person row stays, unlinked from the deleted login');
select ok(not exists (select 1 from public.appointment_has_support_persons)
          and exists (select 1 from public.appointment where patient_id = (select v from ids where k = 'p2')),
  'the support person is taken off the patient''s appointments, and the appointment stays');

select * from finish();
rollback;
