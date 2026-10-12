-- Rollback:
--   alter table public.personal_management drop column otc_medication, drop column no_medication;

-- otc_medication: the over the counter medication as typed (trimmed); blank is NULL.
-- no_medication: an explicit "I didn't take any medication", so "none" and "skipped" differ.
alter table public.personal_management
  add column otc_medication text,
  add column no_medication boolean not null default false;
