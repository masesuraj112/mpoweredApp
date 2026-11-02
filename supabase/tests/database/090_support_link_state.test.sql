begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- fixtures (run as the migration/superuser role)
-- h1 and h2 are patients; h3 is a support person with the phone h1 invites
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000b1'),
  ('00000000-0000-0000-0000-0000000000b2'),
  ('00000000-0000-0000-0000-0000000000b3');
insert into public.users (name, auth_id, user_type, phone_number) values
  ('Hana', '00000000-0000-0000-0000-0000000000b1', 'patient', '+61491570006'),
  ('Hugo', '00000000-0000-0000-0000-0000000000b2', 'patient', '+61491570009'),
  ('Hope', '00000000-0000-0000-0000-0000000000b3', 'support_person', '+61491570007');
insert into public.patients (users_id, sex) select users_id, 'Female' from public.users where user_type = 'patient';

create temp table ids (k text primary key, v int);
insert into ids select 'hope', users_id from public.users where name = 'Hope';
grant select on ids to authenticated;

-- columns
select has_column('public', 'support_persons', 'status', 'support_persons has status');
select has_column('public', 'support_persons', 'responded_at', 'support_persons has responded_at');

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000b1', 'role', 'authenticated')::text, true);

-- a new invitation starts pending and unlinked
select lives_ok($$select public.save_support_person('Hope', '+61491570007', null, 'questions')$$,
  'a patient invites a support person');
select ok((select status = 'pending' and users_id is null and responded_at is null
             from public.support_persons where name = 'Hope'),
  'a new invitation is pending and not linked to a login');

-- the same name and phone can be invited by another patient
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000b2', 'role', 'authenticated')::text, true);
select lives_ok($$select public.save_support_person('Hope', '+61491570007', null, 'answers')$$,
  'another patient can invite the same person');
reset role;
select is((select count(*)::int from public.support_persons where phone_number = '+61491570007'), 2,
  'each patient has their own invitation for that number');

-- the checks on status and the login link (as the superuser, so only the constraints apply)
select throws_ok($$update public.support_persons set status = 'revoked' where name = 'Hope'$$,
  '23514', null, 'a status outside pending, accepted and declined is rejected');
select throws_ok($$update public.support_persons set status = 'accepted' where name = 'Hope'$$,
  '23514', null, 'accepted without a login is rejected');
select throws_ok($$update public.support_persons set users_id = (select v from ids where k = 'hope')
                    where name = 'Hope'$$,
  '23514', null, 'a login without accepted is rejected');

-- accept h1's invitation directly (A11 adds the function that does this)
update public.support_persons sp
   set status = 'accepted', users_id = (select v from ids where k = 'hope'), responded_at = now()
  from public.patients p join public.users u using (users_id)
 where sp.patient_id = p.patient_id and u.name = 'Hana';

-- h1 edits the accepted person: same number keeps them accepted, a new number is a new invitation
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000b1', 'role', 'authenticated')::text, true);
select lives_ok($$select public.save_support_person('Hope Ng', '+61491570007', null, 'questions,answers',
                    (select support_person_id from public.support_persons where name = 'Hope'))$$,
  'the patient edits the accepted person, same number');
select ok((select status = 'accepted' and users_id is not null from public.support_persons where name = 'Hope Ng'),
  'editing without changing the number keeps them accepted');
select lives_ok($$select public.save_support_person('Hope Ng', '+61491570099', null, 'questions,answers',
                    (select support_person_id from public.support_persons where name = 'Hope Ng'))$$,
  'the patient changes the person''s number');
select ok((select status = 'pending' and users_id is null and responded_at is null
             from public.support_persons where name = 'Hope Ng'),
  'a new number resets them to a pending invitation and drops the login');

-- a declined person is invited again when the patient adds the same number
reset role;
update public.support_persons set status = 'declined', responded_at = now() where name = 'Hope Ng';
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000b1', 'role', 'authenticated')::text, true);
select lives_ok($$select public.save_support_person('Hope Ng', '+61491570099', null, 'answers')$$,
  'the patient adds the declined number again');
select ok((select status = 'pending' and responded_at is null and access_type = 'answers'
             from public.support_persons where name = 'Hope Ng'),
  're-adding a declined number invites them again with the new access');
select is((select count(*)::int from public.support_persons where name = 'Hope Ng'), 1,
  're-adding updates the same row instead of making a duplicate');

reset role;
select * from finish();
rollback;
