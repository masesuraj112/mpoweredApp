begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

-- D1 joined 35 days ago; D2 has no public.users row
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000d1'),
  ('00000000-0000-0000-0000-0000000000d2');
insert into public.users (name, auth_id, created_at)
  values ('Test D', '00000000-0000-0000-0000-0000000000d1', (current_date - 35)::timestamptz);

select has_function('public', 'save_management_assessment',
  array['date','text','text','text','boolean','text[]'], 'save_management_assessment exists');
select ok(not has_function_privilege('anon',
  'public.save_management_assessment(date,text,text,text,boolean,text[])', 'execute'),
  'anon cannot execute');
select ok(has_function_privilege('authenticated',
  'public.save_management_assessment(date,text,text,text,boolean,text[])', 'execute'),
  'authenticated can execute');

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d1', 'role', 'authenticated')::text, true);

-- validation failures
select throws_ok($$select public.save_management_assessment(current_date + 2,
  '3–4 days', null, null, false, array[]::text[])$$,
  'P0001', 'FUTURE_DATE', 'a date two days ahead is rejected');
select throws_ok($$select public.save_management_assessment(null,
  '3–4 days', null, null, false, array[]::text[])$$,
  'P0001', 'FUTURE_DATE', 'a null date is rejected');
select throws_ok($$select public.save_management_assessment(
  ((current_date - 36) - (extract(isodow from current_date - 36)::int - 1)) - 1,
  '3–4 days', null, null, false, array[]::text[])$$,
  'P0001', 'BEFORE_START', 'a date before the start week is rejected');
select throws_ok($$select public.save_management_assessment(current_date - 14,
  '   ', null, null, false, array[]::text[])$$,
  'P0001', 'MISSING_ANSWER', 'a blank exercise answer is rejected');
select throws_ok($$select public.save_management_assessment(current_date - 14,
  '3–4 days', null, null, true, array['Vitamin D3 1000 IU'])$$,
  'P0001', 'MEDICATION_CONFLICT', '"no medication" with a medication is rejected');
select throws_ok($$select public.save_management_assessment(current_date - 14,
  '3–4 days', null, null, false, array[repeat('a', 101)])$$,
  'P0001', 'VALUE_TOO_LONG', 'a 101-character medication name is rejected');

-- success: values trimmed, blanks become null, names de-duplicated
select lives_ok($$select public.save_management_assessment(current_date - 14,
  '3–4 days', '   ', '  Panadol  ', false,
  array[' Vitamin D3 1000 IU ', 'Vitamin D3 1000 IU', 'Amlodipine 5 mg', '  '])$$,
  'valid answers are saved');
select is((select count(*)::int from public.personal_management where "date" = current_date - 14),
  1, 'exactly one management row created');
select ok((select exercise = '3–4 days' and emotion is null and otc_medication = 'Panadol'
              and no_medication = false
             from public.personal_management where "date" = current_date - 14),
  'exercise stored; blank emotion is null; OTC trimmed');
select is((select week_start from public.personal_management where "date" = current_date - 14),
  (current_date - 14) - (extract(isodow from current_date - 14)::int - 1),
  'week_start is the Monday of the entry week');
select is((select count(*)::int from public.personal_management_medication_names n
             join public.personal_management pm on pm.submission_id = n.submission_id
            where pm."date" = current_date - 14),
  2, 'two medication names after trim, blank removal and de-duplication');
select throws_ok($$select public.save_management_assessment(current_date - 14,
  '7 days', null, null, false, array[]::text[])$$,
  '23505', null, 'a second submission in the same week fails with 23505');

select lives_ok($$select public.save_management_assessment(current_date - 21,
  '0 days', null, null, true, array[]::text[])$$,
  '"I didn''t take any medication" is saved');
select ok((select pm.no_medication
                  and not exists (select 1 from public.personal_management_medication_names n
                                   where n.submission_id = pm.submission_id)
             from public.personal_management pm where pm."date" = current_date - 21),
  'no_medication is true and no medication names are stored');
select lives_ok($$select public.save_management_assessment(current_date + 1,
  '3–4 days', null, null, false, array[]::text[])$$,
  'tomorrow is tolerated (timezone allowance)');
select lives_ok($$select public.save_management_assessment(
  (current_date - 36) - (extract(isodow from current_date - 36)::int - 1),
  '3–4 days', null, null, false, array[]::text[])$$,
  'the Monday of the start week is accepted');

-- atomicity: a failing name insert must leave no management row
create temp table zz_before as select count(*)::int as n from public.personal_management;

reset role;
create function public.zz_fail_pmmn() returns trigger language plpgsql as $f$
begin
  raise exception 'forced child failure';
end;
$f$;
create trigger zz_fail_pmmn before insert on public.personal_management_medication_names
  for each row execute function public.zz_fail_pmmn();
set local role authenticated;

select throws_ok($$select public.save_management_assessment(current_date - 28,
  '3–4 days', null, null, false, array['Vitamin D3 1000 IU'])$$,
  'P0001', 'forced child failure', 'a forced child failure surfaces to the caller');
select is((select count(*)::int from public.personal_management), (select n from zz_before),
  'no management row remains after the child failure');

reset role;
drop trigger zz_fail_pmmn on public.personal_management_medication_names;
drop function public.zz_fail_pmmn();
set local role authenticated;

-- user without a profile
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d2', 'role', 'authenticated')::text, true);
select throws_ok($$select public.save_management_assessment(current_date,
  '3–4 days', null, null, false, array[]::text[])$$,
  'P0001', 'NO_PROFILE', 'a user without a profile is rejected with NO_PROFILE');

reset role;
select * from finish();
rollback;
