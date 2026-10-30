begin;
create extension if not exists pgtap with schema extensions;

select plan(20);

-- fixtures (run as the migration/superuser role): e1 and e2 have profiles, e3 is a support person
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000e1'),
  ('00000000-0000-0000-0000-0000000000e2'),
  ('00000000-0000-0000-0000-0000000000e3');
insert into public.users (name, auth_id, user_type, phone_number) values
  ('Erin', '00000000-0000-0000-0000-0000000000e1', 'patient', '+61491570006'),
  ('Eli', '00000000-0000-0000-0000-0000000000e2', 'patient', '+61491570007'),
  ('Eve', '00000000-0000-0000-0000-0000000000e3', 'support_person', '+61491570008');

-- the users_id values, readable after the role switch (RLS hides other users' rows)
create temp table ctx (k text primary key, v int);
insert into ctx select 'e1', users_id from public.users where auth_id = '00000000-0000-0000-0000-0000000000e1';
insert into ctx select 'e2', users_id from public.users where auth_id = '00000000-0000-0000-0000-0000000000e2';
grant select on ctx to authenticated;

-- table, RLS and privileges
select has_table('public', 'user_settings', 'user_settings exists');
select ok((select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'user_settings'),
  'row level security is enabled');
select ok(not has_table_privilege('anon', 'public.user_settings', 'SELECT')
          and not has_table_privilege('anon', 'public.user_settings', 'INSERT')
          and not has_table_privilege('anon', 'public.user_settings', 'UPDATE')
          and not has_table_privilege('anon', 'public.user_settings', 'DELETE'),
  'anon has no access');
select ok(has_table_privilege('authenticated', 'public.user_settings', 'SELECT')
          and has_table_privilege('authenticated', 'public.user_settings', 'INSERT')
          and has_table_privilege('authenticated', 'public.user_settings', 'UPDATE'),
  'authenticated can select, insert and update');
select ok(not has_table_privilege('authenticated', 'public.user_settings', 'DELETE'),
  'authenticated cannot delete');

set local role authenticated;

-- e1 saves and changes their own settings
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000e1', 'role', 'authenticated')::text, true);
select lives_ok($$insert into public.user_settings (users_id) select v from ctx where k = 'e1'$$,
  'a user can create their own row');
select ok((select not assessment_reminders and assessment_every = 3 and assessment_unit = 'days'
              and not appointment_reminders and not appointment_day_before and not appointment_on_day
             from public.user_settings),
  'a new row has the screen defaults: off, every 3 days, off, off, off');
select lives_ok($$update public.user_settings
                     set assessment_reminders = true, assessment_every = 2, assessment_unit = 'weeks',
                         appointment_reminders = true, appointment_on_day = true$$,
  'a user can change their own row');
select ok((select assessment_reminders and assessment_every = 2 and assessment_unit = 'weeks'
              and appointment_reminders and not appointment_day_before and appointment_on_day
             from public.user_settings),
  'the changes are saved');

-- value checks
select throws_ok($$update public.user_settings set assessment_every = 8$$, '23514', null,
  'a frequency above 7 is rejected');
select throws_ok($$update public.user_settings set assessment_every = 0$$, '23514', null,
  'a frequency below 1 is rejected');
select throws_ok($$update public.user_settings set assessment_unit = 'months'$$, '23514', null,
  'an unknown unit is rejected');

-- e1 cannot write rows for anyone else, or delete
select throws_ok($$insert into public.user_settings (users_id) select v from ctx where k = 'e2'$$,
  '42501', null, 'a user cannot create a row for another user');
select throws_ok($$update public.user_settings set users_id = (select v from ctx where k = 'e2')$$,
  '42501', null, 'a user cannot move their row to another user');
select throws_ok($$delete from public.user_settings$$, '42501', null, 'a user cannot delete their row');

-- e2 cannot see or change e1's row
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000e2', 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.user_settings), 0, 'another user sees no rows');
select lives_ok($$update public.user_settings set assessment_every = 7
                   where users_id = (select v from ctx where k = 'e1')$$,
  'an update of another user''s row runs but matches no row');

-- a support person can keep settings too (the table is keyed on users, not patients)
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000e3', 'role', 'authenticated')::text, true);
select lives_ok($$insert into public.user_settings (users_id) values (public.current_users_id())$$,
  'a support person can create their own row');

reset role;
select is((select assessment_every from public.user_settings where users_id = (select v from ctx where k = 'e1')),
  2, 'e1''s row is unchanged by another user');

-- deleting the users row deletes the settings with it (account deletion relies on this)
delete from public.users where auth_id = '00000000-0000-0000-0000-0000000000e1';
select is((select count(*)::int from public.user_settings where users_id = (select v from ctx where k = 'e1')),
  0, 'settings are deleted with their users row');

select * from finish();
rollback;
