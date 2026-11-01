-- Rollback:
--   drop function public.export_my_data();

-- Everything the signed-in user can read about themselves, as one JSON document (Settings >
-- Privacy/Data and Legal > Export my data). Security invoker, so RLS limits every read to the
-- caller's own rows. Leaves out doctors, health_report, patient_reflection and movement_condition
-- (authenticated has no select on them) and the recording consent signature image.
create function public.export_my_data()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
begin
  if auth.uid() is null then
    raise exception 'NO_SESSION' using errcode = 'P0001';
  end if;
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'exported_at', now(),
    'profile', (select jsonb_build_object('name', u.name, 'phone_number', u.phone_number,
                                          'user_type', u.user_type, 'created_at', u.created_at)
                  from public.users u where u.users_id = v_users_id),
    'patient', (select jsonb_build_object('sex', p.sex, 'year_of_birth', p.year_of_birth,
                                          'other_conditions', p.other_conditions)
                  from public.patients p where p.patient_id = v_patient_id),
    'conditions', coalesce((select jsonb_agg(m.disease order by m.disease)
                              from public.patient_musko_skeletal_pain m where m.patient_id = v_patient_id), '[]'),
    'pain_assessments', coalesce((
      select jsonb_agg(to_jsonb(a) - 'users_id'
               || jsonb_build_object(
                    'locations', coalesce((select jsonb_agg(l.pain_location) from public.pain_location l
                                            where l.pain_assessment_submission_id = a.submission_id), '[]'),
                    'characteristics', coalesce((select jsonb_agg(c.pain_characteristic) from public.pain_characteristics c
                                                  where c.pain_assessment_submission_id = a.submission_id), '[]'))
               order by a.date)
        from public.pain_assessment a where a.users_id = v_users_id), '[]'),
    'social_health_assessments', coalesce((
      select jsonb_agg(to_jsonb(s) - 'users_id' order by s.date)
        from public.social_health_assessment s where s.users_id = v_users_id), '[]'),
    'movement_assessments', coalesce((
      select jsonb_agg(to_jsonb(mv) - 'users_id'
               || jsonb_build_object('general_impacts', coalesce((
                    select jsonb_agg(g.impact_statement) from public.movement_general_impacts g
                     where g.movement_assessment_submission_id = mv.submission_id), '[]'))
               order by mv.date)
        from public.movement_assessment mv where mv.users_id = v_users_id), '[]'),
    'personal_care_assessments', coalesce((
      select jsonb_agg(to_jsonb(pc) - 'users_id'
               || jsonb_build_object('general_activities', coalesce((
                    select jsonb_agg(ga.activity_statement) from public.personal_care_general_activities ga
                     where ga.personal_care_assessment_submission_id = pc.submission_id), '[]'))
               order by pc.date)
        from public.personal_care_assessment pc where pc.users_id = v_users_id), '[]'),
    'management_assessments', coalesce((
      select jsonb_agg(to_jsonb(pm) - 'users_id'
               || jsonb_build_object(
                    'medication_names', coalesce((select jsonb_agg(n.medication_name)
                                                   from public.personal_management_medication_names n
                                                  where n.submission_id = pm.submission_id), '[]'),
                    'medication_ids', coalesce((select jsonb_agg(pmm.medication_id)
                                                 from public.personal_management_medications pmm
                                                where pmm.submission_id = pm.submission_id), '[]'))
               order by pm.date)
        from public.personal_management pm where pm.users_id = v_users_id), '[]'),
    'medications', coalesce((
      select jsonb_agg(to_jsonb(md) - 'users_id'
               || jsonb_build_object('dosages', coalesce((
                    select jsonb_agg(to_jsonb(d) - 'medications_id') from public.dosage d
                     where d.medications_id = md.medication_id), '[]'))
               order by md.medication_id)
        from public.medications md where md.users_id = v_users_id), '[]'),
    'appointments', coalesce((
      select jsonb_agg(to_jsonb(ap) - 'recording_consent_signature' - 'patient_id'
               || jsonb_build_object(
                    'questions', coalesce((select jsonb_agg(to_jsonb(q) - 'appointment_id'
                                                            order by q.group_key, q.sort_order)
                                             from public.appointment_questions q
                                            where q.appointment_id = ap.appointment_id), '[]'),
                    'support_person_ids', coalesce((select jsonb_agg(l.support_person_id)
                                                     from public.appointment_has_support_persons l
                                                    where l.appointment_id = ap.appointment_id), '[]'))
               order by ap.date_time)
        from public.appointment ap where ap.patient_id = v_patient_id), '[]'),
    'support_persons', coalesce((
      select jsonb_agg(to_jsonb(sp) - 'patient_id' - 'users_id' order by sp.support_person_id)
        from public.support_persons sp where sp.patient_id = v_patient_id), '[]'),
    'notification_settings', (select to_jsonb(us) - 'users_id' from public.user_settings us
                                where us.users_id = v_users_id)
  );
end;
$$;

revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;
