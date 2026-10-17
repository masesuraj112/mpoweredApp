-- Rollback:
--   drop table public.personal_management_medication_names;

-- Medication names ticked in a management submission. Stored as text (not a link to
-- public.medications) because the prescriptions backend is not built yet (M6). The name is a
-- snapshot: it stays readable even if the prescription is later changed or archived.
create table public.personal_management_medication_names (
  medication_name varchar(100) not null,
  submission_id integer not null references public.personal_management(submission_id),
  primary key (medication_name, submission_id),
  constraint chk_pmmn_name_not_blank check (btrim(medication_name) <> '')
);

create index idx_pmmn_submission_id on public.personal_management_medication_names (submission_id);

alter table public.personal_management_medication_names enable row level security;

-- No update or delete policy: submissions cannot be edited (M3).
create policy "pmmn_select" on public.personal_management_medication_names
  for select to public
  using (exists (
    select 1 from public.personal_management pm
     where pm.submission_id = personal_management_medication_names.submission_id
       and pm.users_id = public.current_users_id()));

create policy "pmmn_insert" on public.personal_management_medication_names
  for insert to public
  with check (exists (
    select 1 from public.personal_management pm
     where pm.submission_id = personal_management_medication_names.submission_id
       and pm.users_id = public.current_users_id()));
