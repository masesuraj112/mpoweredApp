begin;
create extension if not exists pgtap with schema extensions;

select plan(9);

-- fixtures (run as the migration/superuser role)
-- m1 patient who support person m2 has ACCEPTED; m3 patient whose invitation to m2 is still PENDING
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000e7'),
  ('00000000-0000-0000-0000-0000000000e8'),
  ('00000000-0000-0000-0000-0000000000e9');
insert into public.users (name, auth_id, user_type, phone_number) values
  ('Mia', '00000000-0000-0000-0000-0000000000e7', 'patient', '+61491570006'),
  ('Max', '00000000-0000-0000-0000-0000000000e8', 'support_person', '+61491570007'),
  ('Meg', '00000000-0000-0000-0000-0000000000e9', 'patient', '+61491570009');
insert into public.patients (users_id, sex) select users_id, 'Female' from public.users where user_type = 'patient';
insert into public.patient_musko_skeletal_pain (patient_id, disease)
  select p.patient_id, 'Arthritis' from public.patients p join public.users u using (users_id) where u.name = 'Mia';
insert into public.support_persons (patient_id, name, phone_number, access_type, users_id, status, responded_at)
  select p.patient_id, 'Max', '+61491570007', 'questions', (select users_id from public.users where name = 'Max'),
         'accepted', now()
    from public.patients p join public.users u using (users_id) where u.name = 'Mia';
insert into public.support_persons (patient_id, name, phone_number, access_type)
  select p.patient_id, 'Max', '+61491570007', 'answers'
    from public.patients p join public.users u using (users_id) where u.name = 'Meg';

create temp table export_out (k text primary key, v jsonb);
grant select, insert on export_out to authenticated;

select ok(not has_function_privilege('anon', 'public.export_my_data()', 'execute'), 'anon still cannot export');

set local role authenticated;

-- support person m2
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000e8', 'role', 'authenticated')::text, true);
select lives_ok($$insert into export_out select 'max', public.export_my_data()$$, 'a support person can export');
select is((select jsonb_array_length(v->'supported_patients') from export_out where k = 'max'), 1,
  'the export lists the one patient they accepted');
select ok((select v->'supported_patients'->0->>'patient_name' = 'Mia'
              and v->'supported_patients'->0->>'conditions' = 'Arthritis'
              and (v->'supported_patients'->0->>'can_add_questions')::boolean
             from export_out where k = 'max'),
  'each supported patient has their name, conditions and the access given');
select ok((select position('Meg' in v::text) = 0 from export_out where k = 'max'),
  'a pending invitation never appears in the export');

-- patient m1
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000e7', 'role', 'authenticated')::text, true);
select lives_ok($$insert into export_out select 'mia', public.export_my_data()$$, 'a patient can export');
select is((select v->'supported_patients' from export_out where k = 'mia'), '[]'::jsonb,
  'a patient''s export has an empty supported_patients list');
select ok((select v->'profile'->>'name' = 'Mia' and v->'conditions' = '["Arthritis"]'::jsonb
              and jsonb_array_length(v->'support_persons') = 1
             from export_out where k = 'mia'),
  'a patient''s other sections are unchanged');
select ok((select jsonb_typeof(v->'support_persons'->0->'status') = 'string' from export_out where k = 'mia'),
  'a patient''s support persons now include their invitation status');

reset role;
select * from finish();
rollback;
