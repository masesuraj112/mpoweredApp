begin;
create extension if not exists pgtap with schema extensions;

select plan(8);

-- fixtures (inserted as the superuser): two users, one movement entry each, in different weeks
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.users (name, auth_id) values
  ('Test A', '00000000-0000-0000-0000-00000000000a'),
  ('Test B', '00000000-0000-0000-0000-00000000000b');

insert into public.movement_assessment
  (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
values
  ((select users_id from public.users where name = 'Test A'), '2026-10-02', 6, 'a', 'b', 'c', 'd'),
  ((select users_id from public.users where name = 'Test B'), '2026-10-09', 7, 'a', 'b', 'c', 'd');
insert into public.movement_general_impacts
  (impact_statement, movement_assessment_submission_id)
select 'Impact of ' || u.name, m.submission_id
  from public.movement_assessment m join public.users u using (users_id);

set local role authenticated;

-- user A
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.movement_assessment), 1,
  'user A sees only their own movement row');
select is((select count(*)::int from public.movement_assessment where "date" = '2026-10-09'), 0,
  'user A cannot see user B''s movement row');
select is((select count(*)::int from public.movement_general_impacts), 1,
  'user A sees only their own movement impacts');
select throws_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test B'), '2026-10-16', 6, 'a', 'b', 'c', 'd')
$$, '42501', null, 'user A cannot insert a movement row for user B');

-- user B
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000000b', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.movement_assessment), 1,
  'user B sees only their own movement row');
select is((select count(*)::int from public.movement_assessment where "date" = '2026-10-02'), 0,
  'user B cannot see user A''s movement row');
select is((select count(*)::int from public.movement_general_impacts), 1,
  'user B sees only their own movement impacts');
select throws_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-16', 6, 'a', 'b', 'c', 'd')
$$, '42501', null, 'user B cannot insert a movement row for user A');

reset role;
select * from finish();
rollback;