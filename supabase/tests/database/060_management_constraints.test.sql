begin;
select plan(6);

insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000d1');
insert into public.users (name, auth_id) values ('Test D', '00000000-0000-0000-0000-0000000000d1');

select lives_ok($$
  insert into public.personal_management (users_id, "date", exercise)
  values ((select users_id from public.users where name = 'Test D'), '2026-10-02', '3–4 days')
$$, 'a valid submission is accepted');

select ok(
  (select week_start = '2026-09-28'::date and no_medication = false and otc_medication is null
     from public.personal_management
    where users_id = (select users_id from public.users where name = 'Test D')),
  'week_start is the Monday; no_medication defaults to false; otc_medication defaults to null'
);

select throws_ok($$
  insert into public.personal_management (users_id, "date", exercise)
  values ((select users_id from public.users where name = 'Test D'), '2026-10-04', '7 days')
$$, '23505', null, 'a second submission in the same week is rejected');

select throws_ok($$
  insert into public.personal_management (users_id, "date", exercise)
  values ((select users_id from public.users where name = 'Test D'), '2026-10-12', null)
$$, '23502', null, 'a missing exercise answer is rejected');

select lives_ok($$
  insert into public.personal_management_medication_names (medication_name, submission_id)
  values ('Vitamin D3 1000 IU', (select submission_id from public.personal_management
    where users_id = (select users_id from public.users where name = 'Test D')))
$$, 'a medication name can be linked to the submission');

select throws_ok($$
  insert into public.personal_management_medication_names (medication_name, submission_id)
  values ('   ', (select submission_id from public.personal_management
    where users_id = (select users_id from public.users where name = 'Test D')))
$$, '23514', null, 'a blank medication name is rejected');

select * from finish();
rollback;
