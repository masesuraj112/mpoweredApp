-- Rollback: alter table public.users drop column created_at;

alter table public.users
  add column created_at timestamptz not null default now();
