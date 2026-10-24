begin;
create extension if not exists pgtap with schema extensions;

select plan(12);

-- fixtures (run as the migration/superuser role)
-- A joined 35 days ago, so recent past weeks are open for saving.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000b2');
insert into public.users (name, auth_id, created_at)
  values ('Test User A', '00000000-0000-0000-0000-0000000000a1', (current_date - 35)::timestamptz);
-- b2 deliberately has no public.users row

select has_function(
  'public', 'save_movement_assessment',
  array['date','numeric','text[]','text','text','text','text','text'],
  'save_movement_assessment exists'
);

select ok(
  not has_function_privilege('anon',
    'public.save_movement_assessment(date,numeric,text[],text,text,text,text,text)', 'execute'),
  'anon cannot execute'
);

select ok(
  has_function_privilege('authenticated',
    'public.save_movement_assessment(date,numeric,text[],text,text,text,text,text)', 'execute'),
  'authenticated can execute'
);

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

-- validation failures
select throws_ok(
  $$select public.save_movement_assessment(current_date + 2, 6, array['Slow'], 'w', 'l', 's', 'st', null)$$,
  'P0001', 'FUTURE_DATE', 'date two days ahead is rejected'
);

select throws_ok(
  $$select public.save_movement_assessment(current_date - 14, 25, array['Slow'], 'w', 'l', 's', 'st', null)$$,
  'P0001', 'INVALID_HOURS', 'more than 24 hours is rejected'
);

select throws_ok(
  $$select public.save_movement_assessment(current_date - 14, 6, array[]::text[], 'w', 'l', 's', 'st', null)$$,
  'P0001', 'NO_IMPACT', 'no general impact is rejected'
);

select throws_ok(
  $$select public.save_movement_assessment(current_date - 14, 6, array['Slow'], '  ', 'l', 's', 'st', null)$$,
  'P0001', 'MISSING_ANSWER', 'a blank walking answer is rejected'
);

-- a valid save: repeated impacts collapse, a blank reflection becomes null
select ok(
  public.save_movement_assessment(
    current_date - 14, 0, array['Slow', 'Tired', 'Slow'], 'w', 'l', 's', 'st', '   ') > 0,
  'a valid submission is saved and returns its id (0 hours is allowed)'
);

select is(
  (select count(*)::int from public.movement_general_impacts),
  2,
  'repeated impacts are saved once'
);

select is(
  (select reflection from public.movement_assessment limit 1),
  null,
  'a blank reflection is stored as null'
);

-- a second submission in the same week hits the unique constraint
select throws_ok(
  $$select public.save_movement_assessment(current_date - 14, 5, array['Slow'], 'w', 'l', 's', 'st', null)$$,
  '23505', null, 'a second submission in the same week is rejected'
);

-- a login with no profile
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000b2', 'role', 'authenticated')::text, true);

select throws_ok(
  $$select public.save_movement_assessment(current_date - 14, 6, array['Slow'], 'w', 'l', 's', 'st', null)$$,
  'P0001', 'NO_PROFILE', 'a login with no profile is rejected'
);

select * from finish();
rollback;