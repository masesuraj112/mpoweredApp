begin;
select plan(6);

-- fixtures (inserted as the superuser): two users, one assessment each, in different weeks
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.users (name, auth_id) values
  ('Test A', '00000000-0000-0000-0000-00000000000a'),
  ('Test B', '00000000-0000-0000-0000-00000000000b');
insert into public.pain_assessment
  (users_id, "date", current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level)
values
  ((select users_id from public.users where name = 'Test A'), '2026-10-02', 4, 2, 8, 5),
  ((select users_id from public.users where name = 'Test B'), '2026-10-09', 3, 1, 7, 4);

set local role authenticated;

-- user A
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.pain_assessment), 1,
  'user A sees only their own pain row');
select is((select count(*)::int from public.pain_assessment where "date" = '2026-10-09'), 0,
  'user A cannot see user B''s pain row');
select is((select count(*)::int from public.users), 1,
  'user A sees only their own users row');

-- user B (a user with no support-person link must see exactly one users row)
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.pain_assessment), 1,
  'user B sees only their own pain row');
select is((select count(*)::int from public.pain_assessment where "date" = '2026-10-02'), 0,
  'user B cannot see user A''s pain row');
select is((select count(*)::int from public.users), 1,
  'user B sees only their own users row');

reset role;
select * from finish();
rollback;
