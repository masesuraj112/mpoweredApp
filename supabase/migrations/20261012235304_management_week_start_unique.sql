-- Rollback:
--   alter table public.personal_management drop constraint personal_management_user_week_key;
--   alter table public.personal_management drop column week_start, drop column created_at;

alter table public.personal_management
  add column week_start date generated always as
    ("date" - (extract(isodow from "date")::int - 1)) stored,
  add column created_at timestamptz not null default now();

alter table public.personal_management
  add constraint personal_management_user_week_key unique (users_id, week_start);
