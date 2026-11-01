begin;
create extension if not exists pgtap with schema extensions;

select plan(18);

-- fixtures (run as the migration/superuser role)
-- f1 patient with data, f2 another patient with data, f3 support person, f4 signed in with no profile
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000f1'),
  ('00000000-0000-0000-0000-0000000000f2'),
  ('00000000-0000-0000-0000-0000000000f3'),
  ('00000000-0000-0000-0000-0000000000f4');
insert into public.users (name, auth_id, user_type, phone_number) values
  ('Fay', '00000000-0000-0000-0000-0000000000f1', 'patient', '+61491570006'),
  ('Finn', '00000000-0000-0000-0000-0000000000f2', 'patient', '+61491570007'),
  ('Flo', '00000000-0000-0000-0000-0000000000f3', 'support_person', '+61491570008');
insert into public.patients (users_id, sex, year_of_birth)
  select users_id, 'Female', 1970 from public.users where name in ('Fay', 'Finn');
insert into public.patient_musko_skeletal_pain (patient_id, disease)
  select p.patient_id, 'Arthritis' from public.patients p join public.users u using (users_id) where u.name = 'Fay';
insert into public.pain_assessment (users_id, "date", current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level)
  select users_id, date '2026-10-26', 5, 3, 7, 5 from public.users where name in ('Fay', 'Finn');
insert into public.pain_location (pain_assessment_submission_id, pain_location)
  select a.submission_id, 'Knee' from public.pain_assessment a join public.users u using (users_id) where u.name = 'Fay';
insert into public.appointment (patient_id, date_time, health_service, practitioner_name,
                                recording_consent_at, recording_consent_signature)
  select p.patient_id, timestamp '2026-11-05 14:30', 'GP',
         case u.name when 'Fay' then 'Dr Lee' else 'Dr Other' end,
         now(), '{"w":10,"h":10,"paths":["M1 1L2 2"]}'
    from public.patients p join public.users u using (users_id);
insert into public.user_settings (users_id, assessment_every)
  select users_id, 2 from public.users where name = 'Fay';
insert into public.weekly_reflection (users_id, week_start, entry, is_complete)
  select users_id, date '2026-10-26', case name when 'Fay' then 'Fay reflection' else 'Finn reflection' end, true
    from public.users where name in ('Fay', 'Finn');

-- the exports, kept for the checks below
create temp table export_out (k text primary key, v jsonb);
grant select, insert on export_out to authenticated;

-- function and privileges
select has_function('public', 'export_my_data', array[]::text[], 'export_my_data exists');
select ok(not has_function_privilege('anon', 'public.export_my_data()', 'execute'), 'anon cannot execute');
select ok(has_function_privilege('authenticated', 'public.export_my_data()', 'execute'), 'authenticated can execute');

set local role authenticated;

-- patient f1
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000f1', 'role', 'authenticated')::text, true);
select lives_ok($$insert into export_out select 'f1', public.export_my_data()$$, 'a patient can export their data');
select ok((select v->'profile'->>'name' = 'Fay' and v->'profile'->>'user_type' = 'patient'
             from export_out where k = 'f1'),
  'the export has the profile');
select ok((select (v->'patient'->>'year_of_birth')::int = 1970 and v->'conditions' = '["Arthritis"]'::jsonb
             from export_out where k = 'f1'),
  'the export has the patient details and conditions');
select ok((select jsonb_array_length(v->'pain_assessments') = 1
              and v->'pain_assessments'->0->'locations' = '["Knee"]'::jsonb
             from export_out where k = 'f1'),
  'the export has only their own pain assessment, with its locations');
select ok((select jsonb_array_length(v->'appointments') = 1
              and v->'appointments'->0->>'practitioner_name' = 'Dr Lee'
             from export_out where k = 'f1'),
  'the export has only their own appointment');
select ok((select not (v->'appointments'->0 ? 'recording_consent_signature')
              and v->'appointments'->0->>'recording_consent_at' is not null
             from export_out where k = 'f1'),
  'the consent time is included but never the signature image');
select ok((select position('Dr Other' in v::text) = 0 and position('Finn' in v::text) = 0
             from export_out where k = 'f1'),
  'nothing from another patient is included');
select ok((select not (v->'pain_assessments'->0 ? 'users_id') and not (v->'appointments'->0 ? 'patient_id')
             from export_out where k = 'f1'),
  'internal user ids are left out');
select ok((select (v->'notification_settings'->>'assessment_every')::int = 2 from export_out where k = 'f1'),
  'the export has the notification settings');
select ok((select jsonb_array_length(v->'weekly_reflections') = 1
              and v->'weekly_reflections'->0->>'entry' = 'Fay reflection'
              and (v->'weekly_reflections'->0->>'is_complete')::boolean
              and position('Finn reflection' in v::text) = 0
             from export_out where k = 'f1'),
  'the export has their own weekly reflection and not another user''s');
select ok((select v ? 'exported_at' and jsonb_typeof(v->'support_persons') = 'array'
             from export_out where k = 'f1'),
  'the export has a timestamp and every section');

-- support person f3: profile only
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000f3', 'role', 'authenticated')::text, true);
select lives_ok($$insert into export_out select 'f3', public.export_my_data()$$, 'a support person can export their data');
select ok((select v->'profile'->>'user_type' = 'support_person'
              and jsonb_typeof(v->'patient') = 'null'
              and v->'appointments' = '[]'::jsonb and v->'pain_assessments' = '[]'::jsonb
              and jsonb_typeof(v->'notification_settings') = 'null'
             from export_out where k = 'f3'),
  'a support person gets their profile and empty patient sections');

-- no profile, no session
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000f4', 'role', 'authenticated')::text, true);
select throws_ok($$select public.export_my_data()$$, 'P0001', 'NO_PROFILE',
  'a signed-in user with no profile is rejected');
select set_config('request.jwt.claims', '{}', true);
select throws_ok($$select public.export_my_data()$$, 'P0001', 'NO_SESSION', 'a call without a session is rejected');

reset role;
select * from finish();
rollback;
