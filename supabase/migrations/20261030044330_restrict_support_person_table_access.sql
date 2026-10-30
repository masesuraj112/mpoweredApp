-- Rollback: recreate each policy below with can_access_patient(...) (or, for users_select, its
-- previous is_support_person_for_patient clause) as in the 20260902 remote_schema migration.

-- Support persons do not read or write tables directly. They use the functions in the next
-- migration, which return only what the Care Planner needs and check the patient's permissions.
-- Until now these policies let any linked support person read the patient's whole appointment,
-- questions, patient row and user row (including phone number) whatever access they were given.

drop policy appointment_select on public.appointment;
create policy appointment_select on public.appointment
  for select to authenticated using (public.is_own_patient_record(patient_id));

drop policy ahsp_select on public.appointment_has_support_persons;
create policy ahsp_select on public.appointment_has_support_persons
  for select to authenticated using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_has_support_persons.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy aq_select on public.appointment_questions;
create policy aq_select on public.appointment_questions
  for select to authenticated using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy aq_insert on public.appointment_questions;
create policy aq_insert on public.appointment_questions
  for insert to authenticated with check (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy aq_update on public.appointment_questions;
create policy aq_update on public.appointment_questions
  for update to authenticated
  using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)))
  with check (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy aq_delete on public.appointment_questions;
create policy aq_delete on public.appointment_questions
  for delete to authenticated using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy patients_select on public.patients;
create policy patients_select on public.patients
  for select to authenticated using (public.is_own_patient_record(patient_id));

drop policy users_select on public.users;
create policy users_select on public.users
  for select to authenticated using (auth_id = auth.uid());

-- A support person must not read or change the patient's invitation row (it holds the access
-- they were given). They answer an invitation through the functions in the next migration.
drop policy support_persons_select on public.support_persons;
create policy support_persons_select on public.support_persons
  for select to authenticated using (public.is_own_patient_record(patient_id));

drop policy support_persons_update on public.support_persons;
create policy support_persons_update on public.support_persons
  for update to authenticated
  using (public.is_own_patient_record(patient_id))
  with check (public.is_own_patient_record(patient_id));
