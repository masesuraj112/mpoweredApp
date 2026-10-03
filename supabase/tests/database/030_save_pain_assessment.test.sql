begin;
create extension if not exists pgtap with schema extensions;

select plan(21);

-- fixtures (run as the migration/superuser role)
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000b2');
insert into public.users (name, auth_id)
  values ('Test User A', '00000000-0000-0000-0000-0000000000a1');
-- b2 deliberately has no public.users row

select has_function(
  'public', 'save_pain_assessment',
  array['date','integer','integer','integer','integer','text[]','text[]'],
  'save_pain_assessment exists'
);

select ok(
  not has_function_privilege('anon',
    'public.save_pain_assessment(date,int,int,int,int,text[],text[])', 'execute'),
  'anon cannot execute'
);

select ok(
  has_function_privilege('authenticated',
    'public.save_pain_assessment(date,int,int,int,int,text[],text[])', 'execute'),
  'authenticated can execute'
);

select ok(
  has_table_privilege('authenticated', 'public.users', 'select'),
  'authenticated can select users (invoker function reads created_at)'
);

select ok(
  has_table_privilege('authenticated', 'public.patients', 'select'),
  'authenticated can select patients (users_select policy subqueries it)'
);

select ok(
  has_table_privilege('authenticated', 'public.pain_assessment', 'insert')
  and has_table_privilege('authenticated', 'public.pain_location', 'insert')
  and has_table_privilege('authenticated', 'public.pain_characteristics', 'insert'),
  'authenticated can insert into the three pain tables'
);

select ok(
  not has_table_privilege('authenticated', 'public.pain_assessment', 'update')
  and not has_table_privilege('authenticated', 'public.pain_assessment', 'delete'),
  'authenticated cannot update or delete pain_assessment (D13)'
);

-- user A (profile created now, so the start week is the Monday of the week containing yesterday)
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

select is(
  public.save_pain_assessment(current_date, 5, 1, 8, 4, array['Head'], array['Sharp']),
  null::int,
  'valid input passes validation (placeholder result until 3.3)'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date + 2, 5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'P0001', 'FUTURE_DATE', 'date two days ahead is rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(null, 5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'P0001', 'FUTURE_DATE', 'null date is rejected'
);

select is(
  public.save_pain_assessment(current_date + 1, 5, 1, 8, 4, array['Head'], array['Sharp']),
  null::int,
  'tomorrow is tolerated (timezone allowance)'
);

select throws_ok(
  $$select public.save_pain_assessment(
      ((current_date - 1) - (extract(isodow from current_date - 1)::int - 1)) - 1,
      5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'P0001', 'BEFORE_START', 'date before the start week is rejected'
);

select is(
  public.save_pain_assessment(
    (current_date - 1) - (extract(isodow from current_date - 1)::int - 1),
    5, 1, 8, 4, array['Head'], array['Sharp']),
  null::int,
  'the Monday of the start week is accepted'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date, 5, 1, 8, 4, array[]::text[], array['Sharp'])$$,
  'P0001', 'NO_LOCATION', 'empty locations rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date, 5, 1, 8, 4, array['  ', null, ''], array['Sharp'])$$,
  'P0001', 'NO_LOCATION', 'blank and null locations rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date, 5, 1, 8, 4, null, array['Sharp'])$$,
  'P0001', 'NO_LOCATION', 'null locations array rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date, 5, 1, 8, 4, array['Head'], array[' '])$$,
  'P0001', 'NO_CHARACTERISTIC', 'blank characteristics rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date, 5, 1, 8, 4, array[repeat('a', 46)], array['Sharp'])$$,
  'P0001', 'VALUE_TOO_LONG', '46-character location rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date, 5, 1, 8, 4, array['Head'], array[repeat('a', 46)])$$,
  'P0001', 'VALUE_TOO_LONG', '46-character characteristic rejected'
);

select is(
  public.save_pain_assessment(current_date, 5, 1, 8, 4,
    array[' ' || repeat('a', 45) || ' '], array['Sharp']),
  null::int,
  '45 characters after trimming is accepted'
);

-- user without a profile: NO_PROFILE
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000b2', 'role', 'authenticated')::text, true);

select throws_ok(
  $$select public.save_pain_assessment(current_date, 5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'P0001', 'NO_PROFILE',
  'user without a profile is rejected with NO_PROFILE'
);

select * from finish();
rollback;
