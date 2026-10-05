begin;
create extension if not exists pgtap with schema extensions;

select plan(29);

-- fixtures (run as the migration/superuser role)
-- A was created 35 days ago, so the start week is the Monday of the week containing
-- (current_date - 36) and several past weeks are open for the insert tests.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000b2');
insert into public.users (name, auth_id, created_at)
  values ('Test User A', '00000000-0000-0000-0000-0000000000a1', (current_date - 35)::timestamptz);
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

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

-- validation failures (3.2)
select throws_ok(
  $$select public.save_pain_assessment(current_date + 2, 5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'P0001', 'FUTURE_DATE', 'date two days ahead is rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(null, 5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'P0001', 'FUTURE_DATE', 'null date is rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(
      ((current_date - 36) - (extract(isodow from current_date - 36)::int - 1)) - 1,
      5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'P0001', 'BEFORE_START', 'date before the start week is rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date - 14, 5, 1, 8, 4, array[]::text[], array['Sharp'])$$,
  'P0001', 'NO_LOCATION', 'empty locations rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date - 14, 5, 1, 8, 4, array['  ', null, ''], array['Sharp'])$$,
  'P0001', 'NO_LOCATION', 'blank and null locations rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date - 14, 5, 1, 8, 4, null, array['Sharp'])$$,
  'P0001', 'NO_LOCATION', 'null locations array rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date - 14, 5, 1, 8, 4, array['Head'], array[' '])$$,
  'P0001', 'NO_CHARACTERISTIC', 'blank characteristics rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date - 14, 5, 1, 8, 4, array[repeat('a', 46)], array['Sharp'])$$,
  'P0001', 'VALUE_TOO_LONG', '46-character location rejected'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date - 14, 5, 1, 8, 4, array['Head'], array[repeat('a', 46)])$$,
  'P0001', 'VALUE_TOO_LONG', '46-character characteristic rejected'
);

-- successful insert (3.3): values are trimmed and de-duplicated
select lives_ok(
  $$select public.save_pain_assessment(current_date - 14, 5, 1, 8, 4,
      array[' Head ', 'Head', 'Neck'], array['Sharp', 'Sharp ', 'Burning'])$$,
  'valid input is saved'
);

select is(
  (select count(*)::int from public.pain_assessment where "date" = current_date - 14),
  1,
  'exactly one parent row created'
);

select ok(
  (select current_pain_level = 5 and mildest_pain_level = 1
          and worst_pain_level = 8 and average_pain_level = 4
     from public.pain_assessment where "date" = current_date - 14),
  'four pain levels stored as given'
);

select is(
  (select week_start from public.pain_assessment where "date" = current_date - 14),
  (current_date - 14) - (extract(isodow from current_date - 14)::int - 1),
  'week_start is the Monday of the entry week'
);

select is(
  (select count(*)::int from public.pain_location l
     join public.pain_assessment a on a.submission_id = l.pain_assessment_submission_id
    where a."date" = current_date - 14),
  2,
  'two location rows after trim and de-duplication'
);

select is(
  (select count(*)::int from public.pain_characteristics c
     join public.pain_assessment a on a.submission_id = c.pain_assessment_submission_id
    where a."date" = current_date - 14),
  2,
  'two characteristic rows after trim and de-duplication'
);

select throws_ok(
  $$select public.save_pain_assessment(current_date - 14, 5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  '23505', null, 'second submission in the same week fails with 23505'
);

select lives_ok(
  $$select public.save_pain_assessment(current_date + 1, 5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'tomorrow is tolerated (timezone allowance)'
);

select lives_ok(
  $$select public.save_pain_assessment(
      (current_date - 36) - (extract(isodow from current_date - 36)::int - 1),
      5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'the Monday of the start week is accepted'
);

select isnt(
  public.save_pain_assessment(current_date - 21, 5, 1, 8, 4,
    array[' ' || repeat('a', 45) || ' '], array['Sharp']),
  null::int,
  '45 characters after trimming is accepted and returns a submission_id'
);

-- atomicity: a failing child insert must leave no parent row
create temp table zz_before as select count(*)::int as n from public.pain_assessment;

reset role;
create function public.zz_fail_pain_location() returns trigger
language plpgsql as $f$
begin
  raise exception 'forced child failure';
end;
$f$;
create trigger zz_fail_pain_location before insert on public.pain_location
  for each row execute function public.zz_fail_pain_location();

set local role authenticated;

select throws_ok(
  $$select public.save_pain_assessment(current_date - 28, 5, 1, 8, 4, array['Head'], array['Sharp'])$$,
  'P0001', 'forced child failure', 'forced child failure surfaces to the caller'
);

select is(
  (select count(*)::int from public.pain_assessment),
  (select n from zz_before),
  'no parent row remains after the child failure'
);

reset role;
drop trigger zz_fail_pain_location on public.pain_location;
drop function public.zz_fail_pain_location();
set local role authenticated;

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
