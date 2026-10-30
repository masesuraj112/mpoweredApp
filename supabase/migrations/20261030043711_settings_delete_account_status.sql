-- Rollback:
--   re-create public.delete_account exactly as in 20261029121213_delete_account.sql.

-- 20261030041743_support_link_state says a support person row has a login (users_id) exactly when
-- it is 'accepted'. Deleting a support person's account now does what unpair_from_patient will: the
-- patient's row becomes 'declined' with no login, and its appointment links go (Settings Q5). The
-- patient part is unchanged. Same signature, still security definer and service_role only;
-- create or replace keeps the grants.
create or replace function public.delete_account(p_users_id int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id integer;
begin
  perform 1 from public.users where users_id = p_users_id for update;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  select patient_id into v_patient_id from public.patients where users_id = p_users_id;

  -- As a support person: unlink from every patient's appointments, then from the patient.
  delete from public.appointment_has_support_persons l
   using public.support_persons sp
   where sp.support_person_id = l.support_person_id and sp.users_id = p_users_id;
  update public.support_persons
     set status = 'declined', users_id = null, responded_at = now()
   where users_id = p_users_id;

  if v_patient_id is not null then
    -- Appointments (support person links cascade when support_persons rows go).
    delete from public.appointment_has_support_persons l
     using public.appointment a
     where a.appointment_id = l.appointment_id and a.patient_id = v_patient_id;
    delete from public.appointment_questions q
     using public.appointment a
     where a.appointment_id = q.appointment_id and a.patient_id = v_patient_id;
    delete from public.appointment where patient_id = v_patient_id;
    delete from public.support_persons where patient_id = v_patient_id;
    delete from public.doctors where patient_id = v_patient_id;
    delete from public.patient_reflection where patients_patient_id = v_patient_id;
    delete from public.patient_musko_skeletal_pain where patient_id = v_patient_id;
  end if;

  -- Assessments, children first. health_report points at all five kinds.
  delete from public.health_report h
   where h.pain_assessment_submission_id in (select submission_id from public.pain_assessment where users_id = p_users_id)
      or h.social_health_assessment_submission_id in (select submission_id from public.social_health_assessment where users_id = p_users_id)
      or h.movement_assessment_submission_id in (select submission_id from public.movement_assessment where users_id = p_users_id)
      or h.personal_care_assessment_submission_id in (select submission_id from public.personal_care_assessment where users_id = p_users_id)
      or h.personal_management_submission_id in (select submission_id from public.personal_management where users_id = p_users_id);
  delete from public.pain_location l using public.pain_assessment a
   where a.submission_id = l.pain_assessment_submission_id and a.users_id = p_users_id;
  delete from public.pain_characteristics c using public.pain_assessment a
   where a.submission_id = c.pain_assessment_submission_id and a.users_id = p_users_id;
  delete from public.pain_assessment where users_id = p_users_id;
  delete from public.social_health_assessment where users_id = p_users_id;
  delete from public.movement_condition c using public.movement_assessment m
   where m.submission_id = c.movementassessment_submission_id and m.users_id = p_users_id;
  delete from public.movement_general_impacts g using public.movement_assessment m
   where m.submission_id = g.movement_assessment_submission_id and m.users_id = p_users_id;
  delete from public.movement_assessment where users_id = p_users_id;
  delete from public.personal_care_general_activities g using public.personal_care_assessment p
   where p.submission_id = g.personal_care_assessment_submission_id and p.users_id = p_users_id;
  delete from public.personal_care_assessment where users_id = p_users_id;
  delete from public.personal_management_medication_names n using public.personal_management p
   where p.submission_id = n.submission_id and p.users_id = p_users_id;
  delete from public.personal_management_medications pm
   where pm.submission_id in (select submission_id from public.personal_management where users_id = p_users_id)
      or pm.medication_id in (select medication_id from public.medications where users_id = p_users_id);
  delete from public.personal_management where users_id = p_users_id;
  delete from public.dosage d using public.medications m
   where m.medication_id = d.medications_id and m.users_id = p_users_id;
  delete from public.medications where users_id = p_users_id;

  delete from public.patients where users_id = p_users_id;
  -- user_settings goes with the users row (on delete cascade).
  delete from public.users where users_id = p_users_id;
end;
$$;

revoke all on function public.delete_account(int) from public, anon, authenticated;
grant execute on function public.delete_account(int) to service_role;
