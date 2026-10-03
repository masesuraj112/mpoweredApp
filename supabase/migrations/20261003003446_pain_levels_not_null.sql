-- Rollback:
--   alter table public.pain_assessment
--     alter column mildest_pain_level drop not null,
--     alter column worst_pain_level   drop not null,
--     alter column average_pain_level drop not null;

alter table public.pain_assessment
  alter column mildest_pain_level set not null,
  alter column worst_pain_level   set not null,
  alter column average_pain_level set not null;
