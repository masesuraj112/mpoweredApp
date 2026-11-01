-- Rollback:
--   alter table public.personal_care_assessment drop constraint personal_care_assessment_user_week_key;
--   alter table public.personal_care_assessment drop column week_start, drop column created_at;
--
-- Same rule as pain_assessment: one submission per user per Monday-to-Sunday week.
-- This fails if a user already has two personal care entries in one week; clean those up first.

alter table public.personal_care_assessment
  add column week_start date generated always as
    ("date" - (extract(isodow from "date")::int - 1)) stored,
  add column created_at timestamptz not null default now();

alter table public.personal_care_assessment
  add constraint personal_care_assessment_user_week_key unique (users_id, week_start);