-- Rollback: alter table public.pain_assessment drop constraint chk_pain_ordering;

alter table public.pain_assessment
  add constraint chk_pain_ordering check (
        mildest_pain_level <= current_pain_level
    and current_pain_level <= worst_pain_level
    and average_pain_level between mildest_pain_level and worst_pain_level
  ) not valid;
alter table public.pain_assessment validate constraint chk_pain_ordering;
