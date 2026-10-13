begin;
select plan(6);

-- fixtures run as the superuser, so RLS does not apply here
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000c1');
insert into public.users (name, auth_id)
  values ('Test C', '00000000-0000-0000-0000-0000000000c1');

select lives_ok($$
  insert into public.social_health_assessment
    (users_id, "date", social_life, travelling, mood, relation_with_others, enjoyment_of_life, mood_overall)
  values ((select users_id from public.users where name = 'Test C'), '2026-10-02',
    'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
    3, 4, 5, 'I was feeling calm')
$$, 'a valid submission is accepted');

select is(
  (select week_start from public.social_health_assessment
    where users_id = (select users_id from public.users where name = 'Test C')),
  '2026-09-28'::date,
  'week_start is the Monday of the chosen date'
);

select throws_ok($$
  insert into public.social_health_assessment
    (users_id, "date", social_life, travelling, mood, relation_with_others, enjoyment_of_life, mood_overall)
  values ((select users_id from public.users where name = 'Test C'), '2026-10-04',
    'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
    3, 4, 5, 'I was feeling calm')
$$, '23505', null, 'a second submission in the same week is rejected');

select throws_ok($$
  insert into public.social_health_assessment
    (users_id, "date", social_life, travelling, mood, relation_with_others, enjoyment_of_life, mood_overall)
  values ((select users_id from public.users where name = 'Test C'), '2026-10-12',
    'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
    11, 4, 5, 'I was feeling calm')
$$, '23514', null, 'a slider value above 10 is rejected');

select throws_ok($$
  insert into public.social_health_assessment
    (users_id, "date", social_life, travelling, mood, relation_with_others, enjoyment_of_life, mood_overall)
  values ((select users_id from public.users where name = 'Test C'), '2026-10-19',
    'My social life is normal and gives me no extra pain', 'I can travel anywhere without pain',
    3, 4, 5, 'frustrated')
$$, '23514', null, 'the short mood word is rejected, so the app must send the full sentence');

select throws_ok($$
  insert into public.social_health_assessment
    (users_id, "date", social_life, travelling, mood, relation_with_others, enjoyment_of_life, mood_overall)
  values ((select users_id from public.users where name = 'Test C'), '2026-10-26',
    null, 'I can travel anywhere without pain', 3, 4, 5, 'I was feeling calm')
$$, '23502', null, 'a missing social life answer is rejected');

select * from finish();
rollback;
