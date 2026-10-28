-- Rollback:
--   alter table public.appointment
--     drop constraint chk_appointment_saved_at,
--     drop constraint chk_appointment_status,
--     drop column suggestions_generated_on,
--     drop column saved_at,
--     drop column status;

-- A plan is a draft while the person is still in the Plan My Appointment wizard, and saved once
-- they press Save on the review screen. Only saved appointments are listed.
alter table public.appointment
  add column status text not null default 'draft',
  add column saved_at timestamptz,
  add column suggestions_generated_on date;

-- Rows that exist before drafts were introduced were complete plans.
update public.appointment set status = 'saved', saved_at = now();

alter table public.appointment
  add constraint chk_appointment_status check (status in ('draft', 'saved')),
  add constraint chk_appointment_saved_at check ((status = 'saved') = (saved_at is not null));

comment on column public.appointment.status is
  'draft while the plan is being created in the wizard, saved once confirmed on the review screen.';
comment on column public.appointment.suggestions_generated_on is
  'Local calendar date the suggested questions were generated for this appointment. Null means none were generated.';
