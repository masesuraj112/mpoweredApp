begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

-- fixtures (inserted as the superuser): one patient with one appointment
insert into auth.users (id) values ('00000000-0000-0000-0000-00000000000a');
insert into public.users (name, auth_id) values ('Test A', '00000000-0000-0000-0000-00000000000a');
insert into public.patients (sex, users_id)
  values ('Female', (select users_id from public.users where name = 'Test A'));
-- consent is recorded, so answers can be stored (answers without consent are refused by a trigger)
insert into public.appointment (patient_id, date_time, recording_consent_at)
  values ((select patient_id from public.patients limit 1), '2026-11-05 14:30', now());

-- columns
select has_column('public', 'appointment_questions', 'group_key', 'group_key column exists');
select col_type_is('public', 'appointment_questions', 'group_key', 'text', 'group_key is text');
select col_not_null('public', 'appointment_questions', 'group_key', 'group_key is NOT NULL');
select has_column('public', 'appointment_questions', 'sort_order', 'sort_order column exists');
select col_type_is('public', 'appointment_questions', 'sort_order', 'smallint', 'sort_order is smallint');
select col_not_null('public', 'appointment_questions', 'sort_order', 'sort_order is NOT NULL');
select has_column('public', 'appointment_questions', 'is_selected', 'is_selected column exists');
select col_type_is('public', 'appointment_questions', 'is_selected', 'boolean', 'is_selected is boolean');
select col_not_null('public', 'appointment_questions', 'is_selected', 'is_selected is NOT NULL');

-- valid rows
select lives_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected, answer)
    values ((select appointment_id from public.appointment limit 1), 'pain-location', 1, 'Q1', true, 'Take rest')$$,
  'a selected question with an answer can be inserted');
select lives_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
    values ((select appointment_id from public.appointment limit 1), 'pain-location', 2, 'Q2', false)$$,
  'an unselected question without an answer can be inserted');
select lives_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
    values ((select appointment_id from public.appointment limit 1), 'management', 1, 'Q3', true)$$,
  'the same sort_order in a different group is allowed');

-- question text
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
    values ((select appointment_id from public.appointment limit 1), 'management', 2, '   ', true)$$,
  '23514', null, 'a blank question is rejected');
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
    values ((select appointment_id from public.appointment limit 1), 'management', 2, repeat('x', 201), true)$$,
  '22001', null, 'a question over 200 characters is rejected');

-- group key shape
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
    values ((select appointment_id from public.appointment limit 1), 'Bad Key', 5, 'Q', true)$$,
  '23514', null, 'a group_key with capitals and a space is rejected');
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
    values ((select appointment_id from public.appointment limit 1), 'pain_location', 5, 'Q', true)$$,
  '23514', null, 'a group_key with an underscore is rejected');
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, sort_order, question, is_selected)
    values ((select appointment_id from public.appointment limit 1), 5, 'Q', true)$$,
  '23502', null, 'a question without a group_key is rejected (no default)');

-- one position per group
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected)
    values ((select appointment_id from public.appointment limit 1), 'pain-location', 1, 'Duplicate', true)$$,
  '23505', null, 'a duplicate (appointment_id, group_key, sort_order) is rejected');

-- answers
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected, answer)
    values ((select appointment_id from public.appointment limit 1), 'management', 3, 'Q', true, '   ')$$,
  '23514', null, 'a blank answer is rejected');
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected, answer)
    values ((select appointment_id from public.appointment limit 1), 'management', 3, 'Q', true, repeat('x', 4001))$$,
  '23514', null, 'an answer over 4000 characters is rejected');
select lives_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected, answer)
    values ((select appointment_id from public.appointment limit 1), 'management', 3, 'Q', true, repeat('x', 4000))$$,
  'an answer of exactly 4000 characters is accepted');
select throws_ok(
  $$insert into public.appointment_questions (appointment_id, group_key, sort_order, question, is_selected, answer)
    values ((select appointment_id from public.appointment limit 1), 'management', 4, 'Q', false, 'x')$$,
  '23514', null, 'an answer on an unselected question is rejected');
select throws_ok(
  $$update public.appointment_questions set answer = 'x' where question = 'Q2'$$,
  '23514', null, 'adding an answer to an unselected question is rejected');

select * from finish();
rollback;
