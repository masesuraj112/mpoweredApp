begin;
create extension if not exists pgtap with schema extensions;

select plan(29);

-- fixtures (run as the migration/superuser role): no users rows; create_profile makes them
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000c1'),
  ('00000000-0000-0000-0000-0000000000c2'),
  ('00000000-0000-0000-0000-0000000000c3'),
  ('00000000-0000-0000-0000-0000000000c4'),
  ('00000000-0000-0000-0000-0000000000c5');

select has_function(
  'public', 'create_profile',
  array['text','text','text','integer','text[]','text','text'],
  'create_profile exists'
);
select ok(
  not has_function_privilege('anon',
    'public.create_profile(text,text,text,int,text[],text,text)', 'execute'),
  'anon cannot execute'
);
select ok(
  has_function_privilege('authenticated',
    'public.create_profile(text,text,text,int,text[],text,text)', 'execute'),
  'authenticated can execute'
);

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c4', 'role', 'authenticated')::text, true);

-- validation failures (c4 never gets a profile in this file)
select throws_ok($$select public.create_profile('   ', 'patient', 'Female', 1980, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'INVALID_NAME', 'a blank name is rejected');
select throws_ok($$select public.create_profile(repeat('a', 46), 'patient', 'Female', 1980, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'INVALID_NAME', 'a name longer than 45 is rejected');
select throws_ok($$select public.create_profile('Sam', 'doctor', 'Female', 1980, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'INVALID_USER_TYPE', 'an unknown user type is rejected');
select throws_ok($$select public.create_profile('Sam', 'patient', 'Female', 1980, array['Arthritis'], null, '0491570006')$$,
  'P0001', 'INVALID_PHONE', 'a local-format phone number is rejected');
select throws_ok($$select public.create_profile('Sam', 'patient', null, 1980, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'INVALID_SEX', 'a patient without sex is rejected');
select throws_ok($$select public.create_profile('Sam', 'patient', 'Other', 1980, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'INVALID_SEX', 'a sex value outside the allowed list is rejected');
select throws_ok($$select public.create_profile('Sam', 'patient', 'Female', 1899, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'INVALID_YEAR', 'year 1899 is rejected');
select throws_ok($$select public.create_profile('Sam', 'patient', 'Female', extract(year from current_date)::int + 1, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'INVALID_YEAR', 'a future year is rejected');
select throws_ok($$select public.create_profile('Sam', 'patient', 'Female', 1980, array['Arthritis', '  '], null, '+61491570006')$$,
  'P0001', 'INVALID_CONDITION', 'a blank condition is rejected');
select throws_ok($$select public.create_profile('Sam', 'patient', 'Female', 1980, array['Arthritis', repeat('a', 46)], null, '+61491570006')$$,
  'P0001', 'INVALID_CONDITION', 'a condition longer than 45 is rejected');
select is((select count(*)::int from public.users where auth_id = '00000000-0000-0000-0000-0000000000c4'),
  0, 'rejected calls leave no users row (atomic)');

-- success: patient with messy input
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c1', 'role', 'authenticated')::text, true);
select lives_ok($$select public.create_profile('  Sam  ', 'patient', 'Female', 1980,
  array['Arthritis', 'Arthritis', ' Gout '], '  stiff in the morning  ', '+61491570006')$$,
  'a valid patient profile is created');
select ok((select name = 'Sam' and phone_number = '+61491570006' and user_type = 'patient'
             from public.users where auth_id = '00000000-0000-0000-0000-0000000000c1'),
  'users row has the trimmed name, E.164 phone and patient type');
select ok((select sex = 'Female' and year_of_birth = 1980 and other_conditions = 'stiff in the morning'
             from public.patients p join public.users u on u.users_id = p.users_id
            where u.auth_id = '00000000-0000-0000-0000-0000000000c1'),
  'patients row has DB-cased sex, year and trimmed other conditions');
select is((select array_agg(m.disease::text order by m.disease)
             from public.patient_musko_skeletal_pain m
             join public.patients p on p.patient_id = m.patient_id
             join public.users u on u.users_id = p.users_id
            where u.auth_id = '00000000-0000-0000-0000-0000000000c1'),
  array['Arthritis', 'Gout'], 'conditions are trimmed and de-duplicated');
select throws_ok($$select public.create_profile('Sam', 'patient', 'Female', 1980, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'PROFILE_EXISTS', 'a second call for the same user is rejected');

-- success: patient with blank other conditions, no year, no conditions
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c5', 'role', 'authenticated')::text, true);
select lives_ok($$select public.create_profile('Alex', 'patient', 'Prefer not to say', null, array[]::text[], '   ', '+61491570007')$$,
  'a patient with no year and no conditions is created');
select ok((select other_conditions is null and year_of_birth is null
             from public.patients p join public.users u on u.users_id = p.users_id
            where u.auth_id = '00000000-0000-0000-0000-0000000000c5'),
  'blank other conditions and a missing year are stored as NULL');
select is((select count(*)::int from public.patient_musko_skeletal_pain), 0, 'no condition rows are created');

-- success: support person gets a users row only
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c3', 'role', 'authenticated')::text, true);
select lives_ok($$select public.create_profile('Pat', 'support_person', null, null, null::text[], null, '+61491570008')$$,
  'a support person profile is created');
select is((select user_type from public.users where auth_id = '00000000-0000-0000-0000-0000000000c3'),
  'support_person', 'the user type is stored');
select is((select count(*)::int from public.patients), 0, 'no patients row is created for a support person');

-- isolation: c2 has no profile and cannot see anyone else's rows
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c2', 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.users), 0, 'a user cannot see other users rows');
select is((select count(*)::int from public.patients), 0, 'a user cannot see other patients rows');
select is((select count(*)::int from public.patient_musko_skeletal_pain), 0,
  'a user cannot see other conditions rows');

-- no session
select set_config('request.jwt.claims', '{}', true);
select throws_ok($$select public.create_profile('Sam', 'patient', 'Female', 1980, array['Arthritis'], null, '+61491570006')$$,
  'P0001', 'NO_SESSION', 'a call without a session is rejected with NO_SESSION');

reset role;
select * from finish();
rollback;
