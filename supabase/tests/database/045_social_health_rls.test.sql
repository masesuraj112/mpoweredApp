begin;
select plan(4);

-- fixtures (inserted as the superuser): two users, one submission each, in different weeks
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000c1'),
  ('00000000-0000-0000-0000-0000000000c2');
insert into public.users (name, auth_id) values
  ('Test C', '00000000-0000-0000-0000-0000000000c1'),
  ('Test D', '00000000-0000-0000-0000-0000000000c2');
insert into public.social_health_assessment
  (users_id, "date", social_life, travelling, mood, relation_with_others, enjoyment_of_life, mood_overall)
values
  ((select users_id from public.users where name = 'Test C'), '2026-10-02',
    'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
    3, 4, 5, 'I was feeling calm'),
  ((select users_id from public.users where name = 'Test D'), '2026-10-09',
    'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
    6, 7, 8, 'I was feeling sad');

set local role authenticated;

-- user C1
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c1', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.social_health_assessment), 1,
  'user C1 sees only their own social health row');
select is((select count(*)::int from public.social_health_assessment where "date" = '2026-10-09'), 0,
  'user C1 cannot see user C2''s social health row');

-- user C2
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c2', 'role', 'authenticated')::text, true);

select is((select count(*)::int from public.social_health_assessment), 1,
  'user C2 sees only their own social health row');
select is((select count(*)::int from public.social_health_assessment where "date" = '2026-10-02'), 0,
  'user C2 cannot see user C1''s social health row');

reset role;
select * from finish();
rollback;
