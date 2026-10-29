begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

-- fixtures run as the superuser, so RLS does not apply here
insert into auth.users (id) values ('00000000-0000-0000-0000-00000000000a');
insert into public.users (name, auth_id)
  values ('Test A', '00000000-0000-0000-0000-00000000000a');

select lives_ok($$
  insert into public.personal_care_assessment (users_id, "date", washing_dressing, sleeping)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-02', 'a', 'b')
$$, 'a valid personal care submission is accepted');

select is(
  (select week_start from public.personal_care_assessment limit 1),
  '2026-09-28'::date,
  'personal care week_start is the Monday of the chosen date'
);

select throws_ok($$
  insert into public.personal_care_assessment (users_id, "date", washing_dressing, sleeping)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-04', 'a', 'b')
$$, '23505', null, 'a second personal care submission in the same week is rejected');

select throws_ok($$
  insert into public.personal_care_assessment (users_id, "date", washing_dressing, sleeping)
  values ((select users_id from public.users where name = 'Test A'), '2026-10-12', 'a', null)
$$, '23502', null, 'a missing sleeping answer is rejected');

select * from finish();
rollback;