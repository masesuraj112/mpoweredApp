begin;
create extension if not exists pgtap with schema extensions;
select plan(25);

-- R1 joined 35 days ago; R2 has no public.users row; R3 is another user
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000e1'),
  ('00000000-0000-0000-0000-0000000000e2'),
  ('00000000-0000-0000-0000-0000000000e3');
insert into public.users (name, auth_id, created_at) values
  ('Test R1', '00000000-0000-0000-0000-0000000000e1', (current_date - 35)::timestamptz),
  ('Test R3', '00000000-0000-0000-0000-0000000000e3', now());
select set_config('test.r1_users_id',
  (select users_id::text from public.users where auth_id = '00000000-0000-0000-0000-0000000000e1'),
  true);

-- table, RLS and privileges
select has_table('public', 'weekly_reflection', 'weekly_reflection exists');
select ok((select relrowsecurity from pg_class where oid = 'public.weekly_reflection'::regclass),
  'RLS is enabled on weekly_reflection');
select ok(has_table_privilege('authenticated', 'public.weekly_reflection', 'SELECT')
      and has_table_privilege('authenticated', 'public.weekly_reflection', 'INSERT')
      and has_table_privilege('authenticated', 'public.weekly_reflection', 'UPDATE'),
  'authenticated can select, insert and update');
select ok(not has_table_privilege('authenticated', 'public.weekly_reflection', 'DELETE')
      and not has_table_privilege('authenticated', 'public.weekly_reflection', 'TRUNCATE'),
  'authenticated cannot delete or truncate');
select ok(not has_table_privilege('anon', 'public.weekly_reflection', 'SELECT')
      and not has_table_privilege('anon', 'public.weekly_reflection', 'INSERT'),
  'anon has no access');

select has_function('public', 'save_weekly_reflection', array['date','text','boolean'],
  'save_weekly_reflection exists');
select ok(not has_function_privilege('anon', 'public.save_weekly_reflection(date,text,boolean)', 'execute'),
  'anon cannot execute');
select ok(has_function_privilege('authenticated', 'public.save_weekly_reflection(date,text,boolean)', 'execute'),
  'authenticated can execute');

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000e1', 'role', 'authenticated')::text, true);

-- validation failures
select throws_ok($$select public.save_weekly_reflection(current_date + 2, 'Felt better', true)$$,
  'P0001', 'FUTURE_DATE', 'a date two days ahead is rejected');
select throws_ok($$select public.save_weekly_reflection(null, 'Felt better', true)$$,
  'P0001', 'FUTURE_DATE', 'a null date is rejected');
select throws_ok($$select public.save_weekly_reflection(
  ((current_date - 36) - (extract(isodow from current_date - 36)::int - 1)) - 1, 'Felt better', true)$$,
  'P0001', 'BEFORE_START', 'a date before the start week is rejected');
select throws_ok($$select public.save_weekly_reflection(current_date - 14, '   ', true)$$,
  'P0001', 'MISSING_ANSWER', 'a blank reflection is rejected');
select throws_ok($$select public.save_weekly_reflection(current_date - 14, repeat('word ', 201), true)$$,
  'P0001', 'VALUE_TOO_LONG', 'a 201-word reflection is rejected');

-- draft, finish, then edit in the same week
select lives_ok($$select public.save_weekly_reflection(current_date - 14, '  First draft  ', false)$$,
  'a draft is saved');
select ok((select entry = 'First draft' and not is_complete
                  and week_start = (current_date - 14) - (extract(isodow from current_date - 14)::int - 1)
             from public.weekly_reflection),
  'the draft is trimmed, not complete, and filed under the Monday of its week');
select lives_ok($$select public.save_weekly_reflection(current_date - 14, 'Finished text', true)$$,
  'saving again in the same week succeeds');
select ok((select count(*) = 1 and bool_and(entry = 'Finished text' and is_complete)
             from public.weekly_reflection),
  'the same row is updated and marked complete');
select lives_ok($$select public.save_weekly_reflection(current_date - 14, 'Edited later', false)$$,
  'a later draft save after finishing succeeds');
select ok((select entry = 'Edited later' and is_complete from public.weekly_reflection),
  'the text is replaced and the reflection stays complete');

select lives_ok($$select public.save_weekly_reflection(current_date - 21, btrim(repeat('word ', 200)), true)$$,
  'a 200-word reflection is accepted');
select lives_ok($$select public.save_weekly_reflection(current_date + 1, 'Tomorrow', true)$$,
  'tomorrow is tolerated (timezone allowance)');

-- another user cannot see, change or write R1's reflections
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000e3', 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.weekly_reflection), 0,
  'another user sees none of R1''s reflections');
update public.weekly_reflection set entry = 'Hijacked';
select throws_ok(format($$insert into public.weekly_reflection (users_id, week_start, entry)
  values (%s, (current_date - extract(isodow from current_date)::int + 1), 'Hijacked')$$,
  current_setting('test.r1_users_id')),
  '42501', null, 'another user cannot insert a reflection for R1');

-- user without a profile
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000e2', 'role', 'authenticated')::text, true);
select throws_ok($$select public.save_weekly_reflection(current_date, 'Felt better', true)$$,
  'P0001', 'NO_PROFILE', 'a user without a profile is rejected with NO_PROFILE');

reset role;
select ok(not exists (select 1 from public.weekly_reflection where entry = 'Hijacked'),
  'another user''s update changed nothing');

select * from finish();
rollback;
