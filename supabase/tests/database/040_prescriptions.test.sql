begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- fixtures (run as the migration/superuser role)
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000b2');
insert into public.users (name, auth_id) values
  ('Test User A', '00000000-0000-0000-0000-0000000000a1'),
  ('Test User B', '00000000-0000-0000-0000-0000000000b2');

select ok(
  not has_function_privilege('anon',
    'public.save_prescription(text,numeric,text,text,numeric,int,text,int)', 'execute'),
  'anon cannot execute save_prescription'
);
select ok(
  has_function_privilege('authenticated',
    'public.save_prescription(text,numeric,text,text,numeric,int,text,int)', 'execute'),
  'authenticated can execute save_prescription'
);
select ok(
  not has_table_privilege('authenticated', 'public.medications', 'delete'),
  'authenticated cannot hard-delete medications (deleting sets deleted_at)'
);
select ok(
  has_table_privilege('authenticated', 'public.movement_assessment', 'select')
  and has_table_privilege('authenticated', 'public.personal_care_assessment', 'select')
  and has_table_privilege('authenticated', 'public.social_health_assessment', 'select')
  and has_table_privilege('authenticated', 'public.personal_management', 'select')
  and has_table_privilege('authenticated', 'public.patient_musko_skeletal_pain', 'select'),
  'authenticated can read every table My Health shows'
);

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

-- add
select ok(
  public.save_prescription('  Amlodipine ', 5, 'mg', 'tablets', 1, 1, 'days') is not null,
  'A can add a prescription'
);
select results_eq(
  $$ select m.name, m.strength, d.amount, d.repeats_every, d.unit_of_time
       from public.medications m join public.dosage d on d.medications_id = m.medication_id $$,
  $$ values ('Amlodipine'::varchar, 5::numeric, 1::numeric, 1, 'days'::text) $$,
  'the medication (name trimmed) and its dosage are saved together'
);
select lives_ok(
  $$ select public.save_prescription('Diclofenac gel', 0.5, '%', 'patches', 0.5, 8, 'hours') $$,
  'decimal strength and amount are accepted'
);

-- edit
select is(
  public.save_prescription('Amlodipine', 10, 'mg', 'tablets', 2, 1, 'days',
    (select medication_id from public.medications where name = 'Amlodipine')),
  (select medication_id from public.medications where name = 'Amlodipine'),
  'editing returns the same medication id'
);
select results_eq(
  $$ select m.strength, d.amount from public.medications m
       join public.dosage d on d.medications_id = m.medication_id where m.name = 'Amlodipine' $$,
  $$ values (10::numeric, 2::numeric) $$,
  'editing updates the medication and its dosage, without a second dosage row'
);

-- validation
select throws_ok(
  $$ select public.save_prescription('  ', 5, 'mg', 'tablets', 1, 1, 'days') $$,
  'P0001', 'NO_NAME', 'a blank name is rejected'
);
select throws_ok(
  $$ select public.save_prescription('X', 0, 'mg', 'tablets', 1, 1, 'days') $$,
  '23514', null, 'a strength of 0 is rejected'
);
select throws_ok(
  $$ select public.save_prescription('X', 5, 'kg', 'tablets', 1, 1, 'days') $$,
  '23514', null, 'an unknown strength unit is rejected'
);

-- delete (soft)
update public.medications set deleted_at = now() where name = 'Diclofenac gel';
select is(
  (select count(*)::int from public.medications where deleted_at is null), 1,
  'a deleted prescription drops out of the current list'
);
select throws_ok(
  $$ select public.save_prescription('Diclofenac gel', 1, '%', 'patches', 1, 1, 'days',
       (select medication_id from public.medications where name = 'Diclofenac gel')) $$,
  'P0001', 'NOT_FOUND', 'a deleted prescription cannot be edited'
);

-- B cannot see or edit A's prescriptions
select set_config('test.a_medication_id',
  (select medication_id from public.medications where name = 'Amlodipine')::text, true);
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000b2', 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.medications), 0, 'B cannot see A''s prescriptions');
select throws_ok(
  $$ select public.save_prescription('Hijack', 1, 'mg', 'tablets', 1, 1, 'days',
       current_setting('test.a_medication_id')::int) $$,
  'P0001', 'NOT_FOUND', 'B cannot edit A''s prescription'
);

select * from finish();
rollback;
