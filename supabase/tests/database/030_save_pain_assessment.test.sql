begin;
create extension if not exists pgtap with schema extensions;

select plan(5);

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

-- user with a profile: placeholder returns null
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

select is(
  public.save_pain_assessment(current_date, 5, 1, 8, 4, array['Head'], array['Sharp']),
  null::int,
  'user with a profile gets the placeholder result'
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
