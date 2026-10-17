-- Rollback:
--   alter table public.movement_assessment drop constraint chk_movement_active_hours;
--   alter table public.movement_assessment drop constraint movement_assessment_user_week_key;
--   alter table public.movement_assessment drop column week_start, drop column created_at;

alter table public.movement_assessment
  add column week_start date generated always as
    ("date" - (extract(isodow from "date")::int - 1)) stored,
  add column created_at timestamptz not null default now();

alter table public.movement_assessment
  add constraint movement_assessment_user_week_key unique (users_id, week_start);

alter table public.movement_assessment
  add constraint chk_movement_active_hours
  check (average_active_hours between 0 and 24) not valid;
alter table public.movement_assessment validate constraint chk_movement_active_hours;