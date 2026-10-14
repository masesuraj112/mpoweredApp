-- Rollback (set not null and the width reduction fail if rows now hold nulls or names over 45 characters):
--   alter table public.appointment
--     drop constraint appointment_recording_consent_signature_check,
--     drop constraint appointment_health_service_not_blank,
--     drop constraint appointment_practitioner_name_not_blank;
--   alter table public.appointment
--     drop column recording_consent_signature,
--     drop column recording_consent_at;
--   alter table public.appointment alter column health_service set not null;
--   alter table public.appointment alter column practitioner_name set not null;
--   alter table public.appointment alter column practitioner_name type varchar(45);
--   alter table public.appointment rename column practitioner_name to practioner_name;
--   -- restores the Supabase local default of full access; only needed on a local database:
--   grant all on public.appointment to anon, authenticated;

-- 1. Fix the column name typo (rename, so existing rows keep their data) and widen it.
alter table public.appointment
  rename column practioner_name to practitioner_name;
alter table public.appointment
  alter column practitioner_name type varchar(100);

-- 2. Doctor and service are optional in Plan My Appointment; only the date and time is required.
-- A blank string must not be stored in place of null.
alter table public.appointment
  alter column practitioner_name drop not null,
  alter column health_service drop not null;
alter table public.appointment
  add constraint appointment_practitioner_name_not_blank
    check (practitioner_name is null or length(btrim(practitioner_name)) > 0),
  add constraint appointment_health_service_not_blank
    check (health_service is null or length(btrim(health_service)) > 0);

-- 3. Recording consent. Null means consent was not obtained, so there is no separate boolean.
alter table public.appointment
  add column recording_consent_at timestamptz null,
  add column recording_consent_signature text null,
  add constraint appointment_recording_consent_signature_check
    check (recording_consent_signature is null or recording_consent_at is not null);
comment on column public.appointment.recording_consent_at is
  'When the patient consented to recording this appointment. Null means consent was not obtained.';
comment on column public.appointment.recording_consent_signature is
  'The signature drawn as consent, stored as an SVG string or base64 data URI. Requires recording_consent_at.';

-- 4. Supabase local default privileges give anon and authenticated full access to every new
-- table, while the hosted project does not. Make the privileges explicit so local and
-- hosted match: logged-in users can read, create and update appointments but not delete
-- them, and anon has no access. RLS still limits which rows are visible.
revoke all on public.appointment from anon, authenticated;
grant select, insert, update on public.appointment to authenticated;
