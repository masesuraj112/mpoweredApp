-- Rollback:
--   alter table public.social_health_assessment drop constraint social_health_assessment_user_week_key;
--   alter table public.social_health_assessment drop column week_start, drop column created_at;

alter table public.social_health_assessment
  add column week_start date generated always as
    ("date" - (extract(isodow from "date")::int - 1)) stored,
  add column created_at timestamptz not null default now();

alter table public.social_health_assessment
  add constraint social_health_assessment_user_week_key unique (users_id, week_start);
