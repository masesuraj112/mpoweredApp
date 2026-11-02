-- Rollback (restores the baseline privileges):
--   grant references, trigger, truncate on public.doctors, public.health_report,
--     public.movement_condition, public.patient_reflection,
--     public.personal_management_medications to anon, authenticated;

-- The baseline schema gave anon and authenticated REFERENCES, TRIGGER and TRUNCATE on these
-- five tables. The app and the tests never use these tables as anon, and TRUNCATE is not
-- limited by RLS, so remove what is not needed. RLS stays enabled (already is on all five).
-- service_role keeps its privileges.
revoke all on public.doctors, public.health_report, public.movement_condition,
  public.patient_reflection, public.personal_management_medications
  from anon;

revoke references, trigger, truncate on public.doctors, public.health_report,
  public.movement_condition, public.patient_reflection, public.personal_management_medications
  from authenticated;
