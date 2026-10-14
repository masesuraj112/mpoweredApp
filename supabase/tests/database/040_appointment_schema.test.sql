begin;
select plan(27);

-- fixtures (inserted as the superuser): two users, each with a patient row
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.users (name, auth_id) values
  ('Test A', '00000000-0000-0000-0000-00000000000a'),
  ('Test B', '00000000-0000-0000-0000-00000000000b');
insert into public.patients (sex, users_id) values
  ('Female', (select users_id from public.users where name = 'Test A')),
  ('Female', (select users_id from public.users where name = 'Test B'));

-- columns
select has_column('public', 'appointment', 'practitioner_name', 'practitioner_name column exists');
select hasnt_column('public', 'appointment', 'practioner_name', 'misspelt practioner_name column is gone');
select col_is_null('public', 'appointment', 'practitioner_name', 'practitioner_name is nullable');
select col_is_null('public', 'appointment', 'health_service', 'health_service is nullable');
select col_not_null('public', 'appointment', 'date_time', 'date_time is NOT NULL');
select col_type_is('public', 'appointment', 'practitioner_name', 'character varying(100)',
  'practitioner_name is varchar(100)');
select has_column('public', 'appointment', 'recording_consent_at', 'recording_consent_at column exists');
select has_column('public', 'appointment', 'recording_consent_signature',
  'recording_consent_signature column exists');
select col_is_null('public', 'appointment', 'recording_consent_at', 'recording_consent_at is nullable');
select col_is_null('public', 'appointment', 'recording_consent_signature',
  'recording_consent_signature is nullable');

-- optional doctor and service
select lives_ok(
  $$insert into public.appointment (patient_id, date_time)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), '2026-11-01 09:30')$$,
  'an appointment with only patient_id and date_time can be inserted');
select throws_ok(
  $$insert into public.appointment (patient_id, date_time, practitioner_name)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), '2026-11-02 09:30', '')$$,
  '23514', null, 'an empty practitioner_name is rejected');
select throws_ok(
  $$insert into public.appointment (patient_id, date_time, practitioner_name)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), '2026-11-02 09:30', '   ')$$,
  '23514', null, 'a whitespace-only practitioner_name is rejected');
select throws_ok(
  $$insert into public.appointment (patient_id, date_time, health_service)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), '2026-11-02 09:30', '')$$,
  '23514', null, 'an empty health_service is rejected');
select throws_ok(
  $$insert into public.appointment (patient_id, date_time, health_service)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), '2026-11-02 09:30', '   ')$$,
  '23514', null, 'a whitespace-only health_service is rejected');

-- a signature needs a consent time
select throws_ok(
  $$insert into public.appointment (patient_id, date_time, recording_consent_signature)
    values ((select p.patient_id from public.patients p join public.users u using (users_id)
             where u.name = 'Test A'), '2026-11-02 09:30', 'data:image/svg+xml;base64,AAAA')$$,
  '23514', null, 'a signature without recording_consent_at is rejected');

-- privileges
select ok(has_table_privilege('authenticated', 'public.appointment', 'SELECT'),
  'authenticated can select appointment');
select ok(has_table_privilege('authenticated', 'public.appointment', 'INSERT'),
  'authenticated can insert appointment');
select ok(has_table_privilege('authenticated', 'public.appointment', 'UPDATE'),
  'authenticated can update appointment');
select ok(not has_table_privilege('authenticated', 'public.appointment', 'DELETE'),
  'authenticated cannot delete appointment');
select ok(not has_table_privilege('authenticated', 'public.appointment', 'TRUNCATE'),
  'authenticated cannot truncate appointment');
select ok(not has_table_privilege('authenticated', 'public.appointment', 'TRIGGER'),
  'authenticated cannot create triggers on appointment');
select ok(not has_table_privilege('authenticated', 'public.appointment', 'REFERENCES'),
  'authenticated cannot reference appointment');
select ok(
  not has_table_privilege('anon', 'public.appointment', 'SELECT')
  and not has_table_privilege('anon', 'public.appointment', 'INSERT')
  and not has_table_privilege('anon', 'public.appointment', 'UPDATE')
  and not has_table_privilege('anon', 'public.appointment', 'DELETE')
  and not has_table_privilege('anon', 'public.appointment', 'TRUNCATE')
  and not has_table_privilege('anon', 'public.appointment', 'TRIGGER')
  and not has_table_privilege('anon', 'public.appointment', 'REFERENCES'),
  'anon has no privileges on appointment');

-- RLS
set local role authenticated;

-- user A updates their own appointment
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

with updated as (
  update public.appointment
  set recording_consent_at = '2026-11-01 09:00+11',
      recording_consent_signature = 'data:image/svg+xml;base64,AAAA'
  returning 1
)
select is((select count(*)::int from updated), 1,
  'user A can record consent and signature on their own appointment');

-- user B cannot see or change user A's appointment
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.appointment), 0,
  'user B cannot see user A''s appointment');

with updated as (
  update public.appointment
  set recording_consent_at = null, recording_consent_signature = null
  returning 1
)
select is((select count(*)::int from updated), 0,
  'user B updating user A''s appointment affects 0 rows');

reset role;
select * from finish();
rollback;
