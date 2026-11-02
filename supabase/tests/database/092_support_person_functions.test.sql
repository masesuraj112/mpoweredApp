-- Appendix C of docs/backend/support-person-backend-build-plan.md translated into pgTAP (section 6.4).
-- Messages marked R3 are the decisions S2 (only linked appointments) and S5 (no conditions on requests).
begin;
create extension if not exists pgtap with schema extensions;

select plan(94);

-- fixtures: A, B patients; C, D support persons (C +61491570007, D +61491570008)
insert into auth.users (id) values
 ('00000000-0000-0000-0000-00000000000a'),('00000000-0000-0000-0000-00000000000b'),
 ('00000000-0000-0000-0000-00000000000c'),('00000000-0000-0000-0000-00000000000d');
insert into public.users (name, auth_id, user_type, phone_number) values
 ('Alice','00000000-0000-0000-0000-00000000000a','patient','+61491570006'),
 ('Bob','00000000-0000-0000-0000-00000000000b','patient','+61491570009'),
 ('Cara','00000000-0000-0000-0000-00000000000c','support_person','+61491570007'),
 ('Dan','00000000-0000-0000-0000-00000000000d','support_person','+61491570008');
insert into public.patients (sex, users_id) select 'Female', users_id from public.users where user_type='patient';
insert into public.patient_musko_skeletal_pain (patient_id, disease)
 select patient_id, 'Arthritis' from public.patients p join public.users u using (users_id) where u.name='Alice';

create temp table ctx (k text primary key, v int);
grant all on ctx to authenticated;
set local role authenticated;

-- ===== A prepares an appointment, invites C (questions) and D (answers) =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
insert into ctx select 'appt', public.save_appointment_details('2026-11-05 14:30','Dr Lee','GP');
insert into ctx select 'draft', public.save_appointment_details('2026-12-05 14:30','Dr Draft','GP');
select lives_ok($$select public.save_appointment_suggestions((select v from ctx where k='appt'), current_date,
  '[{"group_key":"pain-location","question":"Q1"},{"group_key":"pain-location","question":"Q2"},{"group_key":"management","question":"Q3"}]')$$,
  'A stores three suggested questions');
select lives_ok($$select public.save_appointment_questions((select v from ctx where k='appt'),
  (select array_agg(question_id) from public.appointment_questions where question in ('Q1','Q2')))$$,
  'A puts Q1 and Q2 on the plan');
select lives_ok($$select public.save_appointment((select v from ctx where k='appt'))$$, 'A saves the appointment');
-- R3 (S2): a saved appointment nobody was added to
insert into ctx select 'unlinked', public.save_appointment_details('2026-11-20 09:00','Dr Other','GP');
select lives_ok($$select public.save_appointment((select v from ctx where k='unlinked'))$$,
  'R3 (S2): A saves a second appointment with nobody on it');
select lives_ok($$select * from public.save_appointment_support_people((select v from ctx where k='appt'),
  '[{"name":"Cara","phone":"+61491570007","access_type":"questions"},{"name":"Dan","phone":"+61491570008","access_type":"answers"}]')$$,
  'A adds C and D to the appointment');
select ok((select count(*)=2 and bool_and(status='pending' and users_id is null) from public.support_persons), 'invitations start pending and unlinked');

-- ===== C: sees the request, nothing else yet =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select ok((select count(*)=1 from public.list_my_support_requests()), 'C sees one request');
select ok((select patient_name='Alice' and can_add_questions and not can_add_answers from public.list_my_support_requests()), 'R3 (S5): request shows the name and C''s access only');
select ok((select count(*)=0 from public.list_supported_patients()), 'no supported patients before accepting');
select ok((select count(*)=0 from public.list_supported_appointments()), 'no appointments before accepting');
select ok((select count(*)=0 from public.get_supported_appointment((select v from ctx where k='appt'))), 'pending person cannot open the appointment');
select throws_ok(format('select public.save_supported_questions(%s, array[1])', (select v from ctx where k='appt')),
  'P0001', 'APPOINTMENT_NOT_FOUND', 'a pending person cannot change the questions');
-- direct table access is closed
select ok((select count(*)=0 from public.appointment), 'C reads no appointments directly');
select ok((select count(*)=0 from public.appointment_questions), 'C reads no questions directly');
select ok((select count(*)=0 from public.patients), 'C reads no patients directly');
select ok((select count(*)=0 from public.support_persons), 'C reads no support_persons rows directly');
select ok((select count(*)=1 and bool_and(name='Cara') from public.users), 'C sees only their own users row');
select lives_ok($q$do $d$ declare n int; begin
  update public.support_persons set access_type='questions,answers'; get diagnostics n = row_count;
  if n <> 0 then raise exception 'C updated % support_persons rows', n; end if; end $d$$q$,
  'C cannot change any invitation row directly');
-- patient-only functions refuse a support person
select throws_ok('select public.save_appointment_details(now()::timestamp, null, null)',
  'P0001', 'NOT_A_PATIENT', 'a support person cannot create an appointment');
select throws_ok(format('select public.save_appointment(%s)', (select v from ctx where k='appt')),
  'P0001', 'NOT_FOUND', 'a support person cannot save the patient''s appointment');
select ok((select count(*)=0 from public.list_my_appointments()), 'C has no patient appointments');
-- accept errors
select throws_ok('select * from public.accept_support_request(999999)',
  'P0001', 'REQUEST_NOT_FOUND', 'accepting an unknown request fails');
select lives_ok($$select * from public.accept_support_request((select patient_id from public.list_my_support_requests()))$$,
  'C accepts A''s request');
select ok((select count(*)=0 from public.list_my_support_requests()), 'request gone after accepting');
select ok((select count(*)=1 and bool_and(can_add_questions and not can_add_answers) from public.list_supported_patients()), 'accepted patient listed with access');
select ok((select conditions='Arthritis' from public.list_supported_patients()), 'R3 (S5): conditions appear once accepted');
select throws_ok(format('select * from public.accept_support_request(%s)', (select patient_id from public.list_supported_patients())),
  'P0001', 'REQUEST_NOT_FOUND', 'accepting the same request twice fails');

-- an accepted support person still has no direct table access (only the functions)
select ok((select count(*)=0 from public.appointment), 'accepted C reads no appointments directly');
select ok((select count(*)=0 from public.appointment_questions), 'accepted C reads no questions directly');
select ok((select count(*)=0 from public.appointment_has_support_persons), 'accepted C reads no links directly');
select ok((select count(*)=0 from public.patients), 'accepted C reads no patients directly');
select ok((select count(*)=0 from public.support_persons), 'accepted C reads no invitation rows directly');
select ok((select count(*)=1 and bool_and(name='Cara') from public.users), 'accepted C still sees only their own users row');
select lives_ok($q$do $d$ declare n int; begin
  update public.appointment_questions set answer='sneaky'; get diagnostics n = row_count;
  if n <> 0 then raise exception 'accepted C updated % question rows directly', n; end if;
  update public.support_persons set access_type='questions,answers'; get diagnostics n = row_count;
  if n <> 0 then raise exception 'accepted C updated % invitation rows directly', n; end if; end $d$$q$,
  'accepted C cannot change questions or invitations directly');

-- ===== C: appointments (saved only) =====
select ok((select count(*)=1 and bool_and(status='saved') from public.list_supported_appointments()), 'R3 (S2): C sees only the saved appointment they were added to, not the draft or the unlinked one');
select ok((select count(*)=0 from public.get_supported_appointment((select v from ctx where k='draft'))), 'draft appointment not openable');
select ok((select count(*)=0 from public.get_supported_appointment((select v from ctx where k='unlinked'))), 'R3 (S2): an appointment C was not added to is not openable');
select throws_ok(format('select public.save_supported_questions(%s, array[1])', (select v from ctx where k='unlinked')),
  'P0001', 'APPOINTMENT_NOT_FOUND', 'R3 (S2): C cannot change an appointment they were not added to');
select ok((select recording_consent_at is null and can_add_questions and not can_add_answers and practitioner_name='Dr Lee'
  from public.get_supported_appointment((select v from ctx where k='appt'))), 'details and access flags');
select ok((select count(*)=3 from public.list_supported_appointment_questions((select v from ctx where k='appt'))), 'C sees all stored questions');

-- C (questions only): can change the plan, cannot touch answers
select lives_ok($$select public.save_supported_questions((select v from ctx where k='appt'),
  (select array_agg(question_id) from public.list_supported_appointment_questions((select v from ctx where k='appt')) where question in ('Q1','Q3')))$$,
  'C changes the plan to Q1 and Q3');
select ok((select array_agg(question order by question) = array['Q1','Q3']::varchar[] from public.list_supported_appointment_questions((select v from ctx where k='appt')) where is_selected), 'C changed the plan');
select throws_ok(format('select public.save_supported_questions(%s, ''{}''::int[])', (select v from ctx where k='appt')),
  'P0001', 'NO_QUESTIONS', 'the plan cannot be left empty');
select throws_ok(format('select public.save_supported_questions(%s, array[999999])', (select v from ctx where k='appt')),
  'P0001', 'UNKNOWN_QUESTION', 'an unknown question is refused');
select throws_ok(format('select public.save_supported_answers(%s, ''[{"question_id":1,"answer_text":"x"}]'')', (select v from ctx where k='appt')),
  'P0001', 'NO_ANSWERS_PERMISSION', 'C has no permission to add answers');

-- ===== D: not yet accepted; B (patient) and others cannot use support functions =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000b"}',true);
select throws_ok('select * from public.accept_support_request(1)',
  'P0001', 'NOT_A_SUPPORT_PERSON', 'a patient cannot accept a request');
select ok((select count(*)=0 from public.list_supported_patients()), 'a patient supports nobody');
select ok((select count(*)=0 from public.list_my_support_requests()), 'a patient has no requests');

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select ok((select count(*)=1 and bool_and(can_add_answers and not can_add_questions) from public.list_my_support_requests()), 'D sees own request with own access');
select lives_ok($$select * from public.accept_support_request((select patient_id from public.list_my_support_requests()))$$,
  'D accepts A''s request');

-- D (answers only): consent first, then answers; no question changes
select throws_ok(format('select public.save_supported_questions(%s, array[1])', (select v from ctx where k='appt')),
  'P0001', 'NO_QUESTIONS_PERMISSION', 'D has no permission to change questions');
select throws_ok(format('select public.save_supported_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'',(select question_id from public.list_supported_appointment_questions(%s) where question=''Q1''),''answer_text'',''hi'')))', (select v from ctx where k='appt'), (select v from ctx where k='appt')),
  'P0001', 'CONSENT_REQUIRED', 'an answer needs recording consent first');

-- A signs consent
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select lives_ok($$select public.save_recording_consent((select v from ctx where k='appt'), '{"w":10,"h":10,"paths":["M1 1L2 2"]}')$$,
  'A records the doctor''s consent');

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select ok((select recording_consent_at is not null from public.get_supported_appointment((select v from ctx where k='appt'))), 'D sees that consent was given');
select throws_ok(format('select public.save_supported_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'',(select question_id from public.list_supported_appointment_questions(%s) where question=''Q2''),''answer_text'',''no'')))', (select v from ctx where k='appt'), (select v from ctx where k='appt')),
  'P0001', 'QUESTION_NOT_ON_PLAN', 'an answer to a question off the plan is refused');
select lives_ok($$select public.save_supported_answers((select v from ctx where k='appt'), jsonb_build_array(jsonb_build_object('question_id',(select question_id from public.list_supported_appointment_questions((select v from ctx where k='appt')) where question='Q1'),'answer_text','  Rest  ')))$$,
  'D saves an answer to Q1');
select ok((select answer='Rest' from public.list_supported_appointment_questions((select v from ctx where k='appt')) where question='Q1'), 'D saved an answer');

-- C (questions only) cannot remove an answered question; can remove an unanswered one
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select throws_ok(format('select public.save_supported_questions(%s, (select array_agg(question_id) from public.list_supported_appointment_questions(%s) where question=''Q3''))', (select v from ctx where k='appt'), (select v from ctx where k='appt')),
  'P0001', 'NO_ANSWERS_PERMISSION', 'removing an answered question needs the answers permission');
select ok((select answer='Rest' from public.list_supported_appointment_questions((select v from ctx where k='appt')) where question='Q1'), 'blocked change kept the answer');

-- A patient sees what supporters added; B cannot see any of it
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select ok((select answer='Rest' from public.appointment_questions where question='Q1'), 'patient sees the answer D added');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000b"}',true);
select ok((select count(*)=0 from public.appointment_questions), 'B sees no questions');
select throws_ok(format('select public.save_supported_questions(%s, array[1])', (select v from ctx where k='appt')),
  'P0001', 'APPOINTMENT_NOT_FOUND', 'another patient cannot use the support functions on A''s appointment');

-- ===== A changes access: effective immediately =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select lives_ok($$select public.save_support_person('Cara','+61491570007',null,'none',(select support_person_id from public.support_persons where name='Cara'))$$,
  'A takes away C''s access');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select throws_ok(format('select public.save_supported_questions(%s, (select array_agg(question_id) from public.list_supported_appointment_questions(%s) where question in (''Q1'',''Q3'')))', (select v from ctx where k='appt'), (select v from ctx where k='appt')),
  'P0001', 'NO_QUESTIONS_PERMISSION', 'the change of access applies at once');
select ok((select not can_add_questions from public.list_supported_patients()), 'listing reflects new access');

-- R3 (S2): taking C off the appointment ends access to it at once
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select lives_ok($$select * from public.save_appointment_support_people((select v from ctx where k='appt'),
  jsonb_build_array(jsonb_build_object('support_person_id',(select support_person_id from public.support_persons where name='Dan'))))$$,
  'R3 (S2): A takes C off the appointment');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select ok((select count(*)=0 from public.list_supported_appointments()), 'R3 (S2): C off the appointment sees no appointments');
select ok((select count(*)=0 from public.get_supported_appointment((select v from ctx where k='appt'))), 'R3 (S2): C off the appointment cannot open it');
select ok((select count(*)=1 from public.list_supported_patients()), 'R3 (S2): C still supports the patient');

-- ===== unpair: access gone, links removed, patient can re-invite =====
select lives_ok($$select public.unpair_from_patient((select patient_id from public.list_supported_patients()))$$,
  'C unpairs from A');
select ok((select count(*)=0 from public.list_supported_patients()) and (select count(*)=0 from public.list_supported_appointments()), 'C has no access after unpairing');
select throws_ok(format('select public.save_supported_answers(%s, ''[{"question_id":1,"answer_text":"x"}]'')', (select v from ctx where k='appt')),
  'P0001', 'APPOINTMENT_NOT_FOUND', 'C cannot save answers after unpairing');
select throws_ok('select public.unpair_from_patient(1)',
  'P0001', 'PATIENT_NOT_FOUND', 'unpairing a patient you do not support fails');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select ok((select status='declined' and users_id is null from public.support_persons where name='Cara'), 'patient record kept as declined');
select ok((select count(*)=1 from public.appointment_has_support_persons), 'only the other supporter stays linked to the appointment');
select lives_ok($$select public.save_support_person('Cara','+61491570007',null,'questions')$$, 'A adds C again');
select ok((select status='pending' and access_type='questions' from public.support_persons where name='Cara'), 're-adding a declined person invites again');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select lives_ok($$select public.reject_support_request((select patient_id from public.list_my_support_requests()))$$,
  'C rejects the new request');
select ok((select count(*)=0 from public.list_my_support_requests()), 'rejected invitation disappears');
select throws_ok('select public.reject_support_request(1)',
  'P0001', 'REQUEST_NOT_FOUND', 'rejecting an unknown request fails');

-- ===== phone change resets an accepted link; delete revokes at once =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select lives_ok($$select public.save_support_person('Dan','+61491570099',null,'answers',(select support_person_id from public.support_persons where name='Dan'))$$,
  'A changes D''s number');
select ok((select status='pending' and users_id is null from public.support_persons where name='Dan'), 'a new number resets Dan to a pending invitation');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select ok((select count(*)=0 from public.list_supported_patients()), 'D lost access when the number changed');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select lives_ok($$select public.save_support_person('Dan','+61491570008',null,'answers',(select support_person_id from public.support_persons where name='Dan'))$$,
  'A changes D''s number back');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select lives_ok($$select * from public.accept_support_request((select patient_id from public.list_my_support_requests()))$$,
  'D accepts again');
select ok((select count(*)=1 from public.list_supported_patients()), 'D accepted again');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
delete from public.support_persons where name='Dan';
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select ok((select count(*)=0 from public.list_supported_patients()), 'deleting the person revokes access immediately');

-- ===== anon and helper privileges =====
reset role;
select ok(not has_function_privilege('anon','public.accept_support_request(int)','execute'), 'anon cannot accept');
select ok(not has_function_privilege('anon','public.list_supported_patients()','execute'), 'anon cannot list');
select ok(not has_function_privilege('authenticated','public.support_access(int,text)','execute'), 'helper is not callable by the app');
select ok(not has_function_privilege('authenticated','public.supports_appointment(int)','execute'), 'R3 (S2): appointment helper is not callable by the app');
select ok(not exists (select 1 from pg_proc p cross join unnest(p.proargnames) n
  where p.proname = 'list_my_support_requests' and n = 'conditions'), 'R3 (S5): requests never return conditions');
select ok(has_function_privilege('authenticated','public.save_supported_answers(int,jsonb)','execute'), 'authenticated can save answers');
-- the link and status constraints
select throws_ok($$update public.support_persons set status='accepted' where users_id is null$$,
  '23514', null, 'accepted without a login is rejected');

select * from finish();
rollback;
