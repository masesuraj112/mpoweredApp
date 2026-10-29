begin;
create extension if not exists pgtap with schema extensions;

select plan(20);

-- fixtures (run as the migration/superuser role)
-- C1 was created 35 days ago, so the start week is the Monday of the week containing
-- (current_date - 36) and several past weeks are open for the insert tests.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000c1'),
  ('00000000-0000-0000-0000-0000000000c2');
insert into public.users (name, auth_id, created_at)
  values ('Test C', '00000000-0000-0000-0000-0000000000c1', (current_date - 35)::timestamptz);
-- c2 deliberately has no public.users row

select has_function(
  'public', 'save_social_health_assessment',
  array['date','text','text','integer','integer','integer','text','text'],
  'save_social_health_assessment exists'
);

select ok(
  not has_function_privilege('anon',
    'public.save_social_health_assessment(date,text,text,int,int,int,text,text)', 'execute'),
  'anon cannot execute'
);

select ok(
  has_function_privilege('authenticated',
    'public.save_social_health_assessment(date,text,text,int,int,int,text,text)', 'execute'),
  'authenticated can execute'
);

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c1', 'role', 'authenticated')::text, true);

-- validation failures
select throws_ok($$select public.save_social_health_assessment(current_date + 2,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', null)$$,
  'P0001', 'FUTURE_DATE', 'a date two days ahead is rejected');
select throws_ok($$select public.save_social_health_assessment(null,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', null)$$,
  'P0001', 'FUTURE_DATE', 'a null date is rejected');
select throws_ok($$select public.save_social_health_assessment(
  ((current_date - 36) - (extract(isodow from current_date - 36)::int - 1)) - 1,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', null)$$,
  'P0001', 'BEFORE_START', 'a date before the start week is rejected');
select throws_ok($$select public.save_social_health_assessment(current_date - 14,
  '   ', 'I can travel anywhere without pain', 3, 4, 5, 'I was feeling calm', null)$$,
  'P0001', 'MISSING_ANSWER', 'a blank social life answer is rejected');
select throws_ok($$select public.save_social_health_assessment(current_date - 14,
  'My social life is normal and gives me no extra pain', null, 3, 4, 5, 'I was feeling calm', null)$$,
  'P0001', 'MISSING_ANSWER', 'a missing travelling answer is rejected');
select throws_ok($$select public.save_social_health_assessment(current_date - 7,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  11, 4, 5, 'I was feeling calm', null)$$,
  '23514', null, 'a slider above 10 is rejected');
select throws_ok($$select public.save_social_health_assessment(current_date - 7,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'frustrated', null)$$,
  '23514', null, 'the short mood word is rejected');

-- success
select lives_ok($$select public.save_social_health_assessment(current_date - 14,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', '  Work was busy  ')$$,
  'valid answers are saved');
select is((select count(*)::int from public.social_health_assessment where "date" = current_date - 14),
  1, 'exactly one row created');
select ok((select social_life = 'My social life is normal and gives me no extra pain'
              and travelling = 'I can travel anywhere without pain'
              and mood = 3 and relation_with_others = 4 and enjoyment_of_life = 5
              and mood_overall = 'I was feeling calm' and reflection = 'Work was busy'
             from public.social_health_assessment where "date" = current_date - 14),
  'answers stored as given, reflection trimmed');
select is((select week_start from public.social_health_assessment where "date" = current_date - 14),
  (current_date - 14) - (extract(isodow from current_date - 14)::int - 1),
  'week_start is the Monday of the entry week');
select throws_ok($$select public.save_social_health_assessment(current_date - 14,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', null)$$,
  '23505', null, 'a second submission in the same week fails with 23505');

select lives_ok($$select public.save_social_health_assessment(current_date - 21,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', '   ')$$,
  'a blank reflection is accepted');
select ok((select reflection is null from public.social_health_assessment where "date" = current_date - 21),
  'a blank reflection is stored as NULL');
select lives_ok($$select public.save_social_health_assessment(current_date + 1,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', null)$$,
  'tomorrow is tolerated (timezone allowance)');
select lives_ok($$select public.save_social_health_assessment(
  (current_date - 36) - (extract(isodow from current_date - 36)::int - 1),
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', null)$$,
  'the Monday of the start week is accepted');

-- user without a profile
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c2', 'role', 'authenticated')::text, true);
select throws_ok($$select public.save_social_health_assessment(current_date,
  'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
  3, 4, 5, 'I was feeling calm', null)$$,
  'P0001', 'NO_PROFILE', 'a user without a profile is rejected with NO_PROFILE');

reset role;
select * from finish();
rollback;
