begin;
create extension if not exists pgtap with schema extensions;

select plan(32);

-- fixtures (run as the migration/superuser role): profiles are made with create_profile below
-- d1 patient, d2 support person, d3 another patient, d4 signed in with no profile
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000d1'),
  ('00000000-0000-0000-0000-0000000000d2'),
  ('00000000-0000-0000-0000-0000000000d3'),
  ('00000000-0000-0000-0000-0000000000d4');

-- function and privileges
select has_function('public', 'update_profile', array['text','integer'], 'update_profile exists');
select ok(not has_function_privilege('anon', 'public.update_profile(text,int)', 'execute'),
  'anon cannot execute');
select ok(has_function_privilege('authenticated', 'public.update_profile(text,int)', 'execute'),
  'authenticated can execute');
select ok(has_column_privilege('authenticated', 'public.users', 'name', 'UPDATE'),
  'authenticated can update users.name');
select ok(not has_column_privilege('authenticated', 'public.users', 'user_type', 'UPDATE'),
  'authenticated cannot update users.user_type');
select ok(not has_column_privilege('authenticated', 'public.users', 'phone_number', 'UPDATE'),
  'authenticated cannot update users.phone_number');
select ok(not has_column_privilege('authenticated', 'public.users', 'auth_id', 'UPDATE'),
  'authenticated cannot update users.auth_id');
select ok(has_column_privilege('authenticated', 'public.patients', 'year_of_birth', 'UPDATE'),
  'authenticated can update patients.year_of_birth');
select ok(not has_column_privilege('authenticated', 'public.patients', 'sex', 'UPDATE'),
  'authenticated cannot update patients.sex');
select ok(not has_table_privilege('anon', 'public.users', 'UPDATE')
          and not has_any_column_privilege('anon', 'public.users', 'UPDATE')
          and not has_any_column_privilege('anon', 'public.patients', 'UPDATE'),
  'anon cannot update users or patients');

set local role authenticated;

-- profiles
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d1', 'role', 'authenticated')::text, true);
select lives_ok($$select public.create_profile('Sam', 'patient', 'Female', 1980, array[]::text[], null, '+61491570006')$$,
  'patient d1 is created');
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d2', 'role', 'authenticated')::text, true);
select lives_ok($$select public.create_profile('Pat', 'support_person', null, null, null::text[], null, '+61491570007')$$,
  'support person d2 is created');
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d3', 'role', 'authenticated')::text, true);
select lives_ok($$select public.create_profile('Olive', 'patient', 'Male', 1960, array[]::text[], null, '+61491570008')$$,
  'patient d3 is created');

-- patient d1 edits their details
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d1', 'role', 'authenticated')::text, true);
select lives_ok($$select public.update_profile('  Sam Lee  ', 1975)$$, 'a patient can change name and year');
select ok((select u.name = 'Sam Lee' and p.year_of_birth = 1975
             from public.users u join public.patients p on p.users_id = u.users_id
            where u.auth_id = '00000000-0000-0000-0000-0000000000d1'),
  'the name is trimmed and the year is saved');
select lives_ok($$select public.update_profile('Sam Lee', null)$$, 'a patient can clear their year');
select ok((select p.year_of_birth is null
             from public.users u join public.patients p on p.users_id = u.users_id
            where u.auth_id = '00000000-0000-0000-0000-0000000000d1'),
  'a cleared year is stored as NULL');

-- validation
select throws_ok($$select public.update_profile('   ', 1975)$$, 'P0001', 'INVALID_NAME', 'a blank name is rejected');
select throws_ok($$select public.update_profile(repeat('a', 46), 1975)$$, 'P0001', 'INVALID_NAME',
  'a name longer than 45 is rejected');
select throws_ok($$select public.update_profile('Sam Lee', 1899)$$, 'P0001', 'INVALID_YEAR', 'year 1899 is rejected');
select throws_ok($$select public.update_profile('Sam Lee', extract(year from current_date)::int + 1)$$,
  'P0001', 'INVALID_YEAR', 'a future year is rejected');
select is((select name::text from public.users where auth_id = '00000000-0000-0000-0000-0000000000d1'),
  'Sam Lee', 'rejected calls change nothing');

-- direct writes to columns that must not change
select throws_ok($$update public.users set user_type = 'support_person'
                   where auth_id = '00000000-0000-0000-0000-0000000000d1'$$,
  '42501', null, 'a user cannot change their user type directly');
select throws_ok($$update public.users set phone_number = '+61491570009'
                   where auth_id = '00000000-0000-0000-0000-0000000000d1'$$,
  '42501', null, 'a user cannot change their phone number directly');

-- support person d2: name only; no patients row appears
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d2', 'role', 'authenticated')::text, true);
select lives_ok($$select public.update_profile('  Pat Ng  ', null)$$, 'a support person can change their name');
select is((select name::text from public.users where auth_id = '00000000-0000-0000-0000-0000000000d2'),
  'Pat Ng', 'the support person name is saved');
select is((select count(*)::int from public.patients p join public.users u on u.users_id = p.users_id
            where u.auth_id = '00000000-0000-0000-0000-0000000000d2'),
  0, 'no patients row is created for a support person');

-- patient d3 cannot change d1, through the function or directly
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d3', 'role', 'authenticated')::text, true);
select lives_ok($$select public.update_profile('Olive', 1961)$$, 'another patient changes only their own details');
select lives_ok($$update public.users set name = 'Hacked' where auth_id = '00000000-0000-0000-0000-0000000000d1'$$,
  'a direct update of another user runs but matches no row');
reset role;
select ok((select u.name = 'Sam Lee' and p.year_of_birth is null
             from public.users u join public.patients p on p.users_id = u.users_id
            where u.auth_id = '00000000-0000-0000-0000-0000000000d1'),
  'patient d1 is unchanged by another user');
set local role authenticated;

-- no profile, no session
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d4', 'role', 'authenticated')::text, true);
select throws_ok($$select public.update_profile('Nobody', null)$$, 'P0001', 'NO_PROFILE',
  'a signed-in user with no profile is rejected');
select set_config('request.jwt.claims', '{}', true);
select throws_ok($$select public.update_profile('Nobody', null)$$, 'P0001', 'NO_SESSION',
  'a call without a session is rejected');

reset role;
select * from finish();
rollback;
