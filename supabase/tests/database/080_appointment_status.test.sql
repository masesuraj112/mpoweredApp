begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

-- fixtures (inserted as the superuser): one patient
insert into auth.users (id) values ('00000000-0000-0000-0000-00000000000a');
insert into public.users (name, auth_id) values ('Test A', '00000000-0000-0000-0000-00000000000a');
insert into public.patients (sex, users_id)
  values ('Female', (select users_id from public.users where name = 'Test A'));

-- columns
select has_column('public', 'appointment', 'status', 'status column exists');
select col_type_is('public', 'appointment', 'status', 'text', 'status is text');
select col_not_null('public', 'appointment', 'status', 'status is NOT NULL');
select has_column('public', 'appointment', 'saved_at', 'saved_at column exists');
select col_type_is('public', 'appointment', 'saved_at', 'timestamp with time zone',
  'saved_at is timestamptz');
select col_is_null('public', 'appointment', 'saved_at', 'saved_at is nullable');
select has_column('public', 'appointment', 'suggestions_generated_on',
  'suggestions_generated_on column exists');
select col_type_is('public', 'appointment', 'suggestions_generated_on', 'date',
  'suggestions_generated_on is a date');
select col_is_null('public', 'appointment', 'suggestions_generated_on',
  'suggestions_generated_on is nullable');

-- a new appointment is a draft and has no suggestions
select lives_ok(
  $$insert into public.appointment (patient_id, date_time)
    values ((select patient_id from public.patients limit 1), '2026-11-05 14:30')$$,
  'an appointment with only patient_id and date_time can be inserted');
select ok(
  (select status = 'draft' and saved_at is null from public.appointment),
  'a new appointment defaults to draft with no saved_at');
select ok(
  (select suggestions_generated_on is null from public.appointment),
  'a new appointment has no suggestions_generated_on');

-- status rules
select throws_ok(
  $$insert into public.appointment (patient_id, date_time, status)
    values ((select patient_id from public.patients limit 1), '2026-11-06 09:00', 'archived')$$,
  '23514', null, 'a status outside draft/saved is rejected');
select throws_ok(
  $$insert into public.appointment (patient_id, date_time, status)
    values ((select patient_id from public.patients limit 1), '2026-11-06 09:00', 'saved')$$,
  '23514', null, 'saved without saved_at is rejected');
select throws_ok(
  $$insert into public.appointment (patient_id, date_time, status, saved_at)
    values ((select patient_id from public.patients limit 1), '2026-11-06 09:00', 'draft', now())$$,
  '23514', null, 'draft with saved_at is rejected');
select lives_ok(
  $$insert into public.appointment (patient_id, date_time, status, saved_at)
    values ((select patient_id from public.patients limit 1), '2026-11-06 09:00', 'saved', now())$$,
  'saved with saved_at is accepted');
select throws_ok(
  $$update public.appointment set status = 'saved' where date_time = '2026-11-05 14:30'$$,
  '23514', null, 'marking a draft saved without saved_at is rejected');
select lives_ok(
  $$update public.appointment set status = 'saved', saved_at = now() where date_time = '2026-11-05 14:30'$$,
  'marking a draft saved together with saved_at is accepted');

select * from finish();
rollback;
