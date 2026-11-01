begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

-- fixtures run as the superuser. User A was created 35 days ago, so several past weeks
-- are open. b2 deliberately has no public.users row.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000b2');
insert into public.users (name, auth_id, created_at)
  values ('Test User A', '00000000-0000-0000-0000-0000000000a1', (current_date - 35)::timestamptz);

select has_function(
  'public', 'save_personal_care_assessment',
  array['date','text[]','text','text','text'],
  'save_personal_care_assessment exists'
);

select ok(
  not has_function_privilege('anon',
    'public.save_personal_care_assessment(date,text[],text,text,text)', 'execute'),
  'anon cannot execute'
);

select ok(
  has_function_privilege('authenticated',
    'public.save_personal_care_assessment(date,text[],text,text,text)', 'execute'),
  'authenticated can execute'
);

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

select throws_ok(
  $$select public.save_personal_care_assessment(current_date + 2, array['Slow'], 'wash', 'sleep', null)$$,
  'P0001', 'FUTURE_DATE', 'date two days ahead is rejected'
);

select throws_ok(
  $$select public.save_personal_care_assessment(current_date - 14, array[]::text[], 'wash', 'sleep', null)$$,
  'P0001', 'NO_ACTIVITY', 'empty activities are rejected'
);

select throws_ok(
  $$select public.save_personal_care_assessment(current_date - 14, array[repeat('a', 101)], 'wash', 'sleep', null)$$,
  'P0001', 'VALUE_TOO_LONG', 'a 101-character activity is rejected'
);

select throws_ok(
  $$select public.save_personal_care_assessment(current_date - 14, array['Slow'], 'wash', null, null)$$,
  'P0001', 'MISSING_ANSWER', 'a missing sleeping answer is rejected'
);

-- valid save: values are trimmed and de-duplicated
select lives_ok(
  $$select public.save_personal_care_assessment(current_date - 14,
      array[' Slow ', 'Slow', 'Irritable'], ' wash ', ' sleep ', '  felt low  ')$$,
  'valid input is saved'
);

select is(
  (select count(*)::int from public.personal_care_assessment where "date" = current_date - 14),
  1,
  'exactly one parent row is created'
);

select is(
  (select count(*)::int from public.personal_care_general_activities g
     join public.personal_care_assessment a on a.submission_id = g.personal_care_assessment_submission_id
    where a."date" = current_date - 14),
  2,
  'two activity rows after trim and de-duplication'
);

select throws_ok(
  $$select public.save_personal_care_assessment(current_date - 14, array['Slow'], 'wash', 'sleep', null)$$,
  '23505', null, 'a second submission in the same week fails with 23505'
);

select lives_ok(
  $$select public.save_personal_care_assessment(current_date - 21, array['Slow'], 'wash', 'sleep', '   ')$$,
  'a blank reflection is accepted'
);

select is(
  (select reflection from public.personal_care_assessment where "date" = current_date - 21),
  null::text,
  'a blank reflection is stored as null'
);

-- a user with no profile row
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000b2', 'role', 'authenticated')::text, true);

select throws_ok(
  $$select public.save_personal_care_assessment(current_date, array['Slow'], 'wash', 'sleep', null)$$,
  'P0001', 'NO_PROFILE', 'a user without a profile is rejected with NO_PROFILE'
);

select * from finish();
rollback;