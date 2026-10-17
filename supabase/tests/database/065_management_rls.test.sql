begin;
select plan(4);

-- fixtures (inserted as the superuser): two users, one submission and one medication name each,
-- in different weeks
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000d1'),
  ('00000000-0000-0000-0000-0000000000d2');
insert into public.users (name, auth_id) values
  ('Test D', '00000000-0000-0000-0000-0000000000d1'),
  ('Test E', '00000000-0000-0000-0000-0000000000d2');
insert into public.personal_management (users_id, "date", exercise) values
  ((select users_id from public.users where name = 'Test D'), '2026-10-02', '3–4 days'),
  ((select users_id from public.users where name = 'Test E'), '2026-10-09', '7 days');
insert into public.personal_management_medication_names (medication_name, submission_id) values
  ('Vitamin D3 1000 IU', (select submission_id from public.personal_management where "date" = '2026-10-02')),
  ('Amlodipine 5 mg', (select submission_id from public.personal_management where "date" = '2026-10-09'));

set local role authenticated;

-- user D1
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d1', 'role', 'authenticated')::text, true);

select ok(
  (select count(*) = 1 and bool_and("date" = '2026-10-02') from public.personal_management),
  'user D1 sees only their own management row');
select ok(
  (select count(*) = 1 and bool_and(medication_name = 'Vitamin D3 1000 IU')
     from public.personal_management_medication_names),
  'user D1 sees only their own medication name');

-- user D2
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000d2', 'role', 'authenticated')::text, true);

select ok(
  (select count(*) = 1 and bool_and("date" = '2026-10-09') from public.personal_management),
  'user D2 sees only their own management row');
select ok(
  (select count(*) = 1 and bool_and(medication_name = 'Amlodipine 5 mg')
     from public.personal_management_medication_names),
  'user D2 sees only their own medication name');

reset role;
select * from finish();
rollback;
