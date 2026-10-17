begin;
select plan(8);

-- fixtures run as the superuser, so RLS does not apply here
insert into auth.users (id) values ('00000000-0000-0000-0000-00000000000a');
insert into public.users (name, auth_id)
  values ('Test A', '00000000-0000-0000-0000-00000000000a');

select lives_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-02', 6, 'a', 'b', 'c', 'd')
$$, 'a valid movement submission is accepted');

select is(
  (select week_start from public.movement_assessment limit 1),
  '2026-09-28'::date,
  'movement week_start is the Monday of the chosen date'
);

select throws_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-04', 6, 'a', 'b', 'c', 'd')
$$, '23505', null, 'a second movement submission in the same week is rejected');

select lives_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-12', 0, 'a', 'b', 'c', 'd')
$$, '0 active hours is a real answer and is accepted');

select lives_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-19', 24, 'a', 'b', 'c', 'd')
$$, '24 active hours is accepted');

select throws_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-26', 25, 'a', 'b', 'c', 'd')
$$, '23514', null, 'more than 24 active hours is rejected');

select throws_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test A'), '2026-11-02', -1, 'a', 'b', 'c', 'd')
$$, '23514', null, 'negative active hours are rejected');

select throws_ok($$
  insert into public.movement_assessment
    (users_id, "date", average_active_hours, walking_impact, lifting_impact, sitting_impact, standing_impact)
  values ((select users_id from public.users where name = 'Test A'), '2026-11-09', null, 'a', 'b', 'c', 'd')
$$, '23502', null, 'missing active hours are rejected');

select * from finish();
rollback;