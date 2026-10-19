begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

-- fixtures run as the superuser: two users with one entry each, in different weeks
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.users (name, auth_id) values
  ('Test A', '00000000-0000-0000-0000-00000000000a'),
  ('Test B', '00000000-0000-0000-0000-00000000000b');

insert into public.personal_care_assessment (users_id, "date", washing_dressing, sleeping) values
  ((select users_id from public.users where name = 'Test A'), '2026-10-02', 'a', 'b'),
  ((select users_id from public.users where name = 'Test B'), '2026-10-09', 'a', 'b');
insert into public.personal_care_general_activities
  (activity_statement, personal_care_assessment_submission_id)
select 'Activity of ' || u.name, p.submission_id
  from public.personal_care_assessment p join public.users u using (users_id);

set local role authenticated;

-- user A
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.personal_care_assessment), 1,
  'user A sees only their own personal care row');
select is((select count(*)::int from public.personal_care_assessment where "date" = '2026-10-09'), 0,
  'user A cannot see user B''s personal care row');
select is((select count(*)::int from public.personal_care_general_activities), 1,
  'user A sees only their own personal care activities');
select throws_ok($$
  insert into public.personal_care_assessment (users_id, "date", washing_dressing, sleeping)
  values ((select users_id from public.users where name = 'Test B'), '2026-10-16', 'a', 'b')
$$, '42501', null, 'user A cannot insert a personal care row for user B');

-- user B
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.personal_care_assessment), 1,
  'user B sees only their own personal care row');
select is((select count(*)::int from public.personal_care_assessment where "date" = '2026-10-02'), 0,
  'user B cannot see user A''s personal care row');
select is((select count(*)::int from public.personal_care_general_activities), 1,
  'user B sees only their own personal care activities');
select throws_ok($$
  insert into public.personal_care_assessment (users_id, "date", washing_dressing, sleeping)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-16', 'a', 'b')
$$, '42501', null, 'user B cannot insert a personal care row for user A');

reset role;
select * from finish();
rollback;