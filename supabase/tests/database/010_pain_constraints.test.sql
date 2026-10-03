begin;
select plan(5);

-- fixtures run as the superuser, so RLS does not apply here
insert into auth.users (id) values ('00000000-0000-0000-0000-00000000000a');
insert into public.users (name, auth_id)
  values ('Test A', '00000000-0000-0000-0000-00000000000a');

select lives_ok($$
  insert into public.pain_assessment
    (users_id, "date", current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-02', 4, 2, 8, 5)
$$, 'a valid submission is accepted');

select is(
  (select week_start from public.pain_assessment limit 1),
  '2026-09-28'::date,
  'week_start is the Monday of the chosen date'
);

select throws_ok($$
  insert into public.pain_assessment
    (users_id, "date", current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-04', 3, 1, 7, 4)
$$, '23505', null, 'a second submission in the same week is rejected');

select throws_ok($$
  insert into public.pain_assessment
    (users_id, "date", current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-12', 9, 2, 5, 4)
$$, '23514', null, 'a worst level below the current level is rejected');

select throws_ok($$
  insert into public.pain_assessment
    (users_id, "date", current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-19', 4, null, 8, 5)
$$, '23502', null, 'a missing pain level is rejected');

select * from finish();
rollback;
