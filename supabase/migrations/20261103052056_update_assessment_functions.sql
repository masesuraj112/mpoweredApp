-- Rollback:
--   drop function public.update_pain_assessment(date, int, int, int, int, text[], text[]);
--   drop function public.update_movement_assessment(date, numeric, text[], text, text, text, text, text);
--   drop function public.update_personal_care_assessment(date, text[], text, text, text);
--   drop function public.update_social_health_assessment(date, text, text, int, int, int, text, text);
--   drop function public.update_management_assessment(date, text, text, text, boolean, text[]);

-- Lets a user change the answers of an assessment they have already saved, one function per
-- assessment. Each replaces the answers of the caller's entry for the week starting p_week_start:
-- the parent row is updated in place (its submission_id and date are kept, so health_report and
-- movement_condition links stay valid) and the child list rows are replaced.
--
-- SECURITY DEFINER on purpose (approved): the tables stay read/insert-only for authenticated
-- (tests 042, 046, 066), so the only way to change a saved entry is through these validated
-- functions. Running as the owner bypasses RLS, so EVERY statement filters on v_users_id, which
-- comes from current_users_id() (auth.uid()), never from an argument.
--
-- Validation repeats the matching save_* function (same message codes). Check constraints
-- (slider ranges, mood_overall: 23514 / 23502) still apply to the update. No entry for that
-- week, or someone else's entry, raises NOT_FOUND.

-- Pain ---------------------------------------------------------------------------------------
create function public.update_pain_assessment(
  p_week_start date,
  p_current int,
  p_mildest int,
  p_worst int,
  p_average int,
  p_locations text[],
  p_characteristics text[]
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_users_id integer;
  v_locations text[];
  v_characteristics text[];
  v_submission_id integer;
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_locations
    from (select btrim(x) as t from unnest(p_locations) as x) s
   where t is not null and t <> '';
  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_characteristics
    from (select btrim(x) as t from unnest(p_characteristics) as x) s
   where t is not null and t <> '';

  if cardinality(v_locations) = 0 then
    raise exception 'NO_LOCATION' using errcode = 'P0001';
  end if;
  if cardinality(v_characteristics) = 0 then
    raise exception 'NO_CHARACTERISTIC' using errcode = 'P0001';
  end if;
  if exists (select 1 from unnest(v_locations) x where char_length(x) > 45)
     or exists (select 1 from unnest(v_characteristics) x where char_length(x) > 45) then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  update public.pain_assessment
     set current_pain_level = p_current,
         mildest_pain_level = p_mildest,
         worst_pain_level = p_worst,
         average_pain_level = p_average
   where users_id = v_users_id
     and week_start = p_week_start
  returning submission_id into v_submission_id;
  if v_submission_id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  delete from public.pain_location where pain_assessment_submission_id = v_submission_id;
  delete from public.pain_characteristics where pain_assessment_submission_id = v_submission_id;

  insert into public.pain_location (pain_location, pain_assessment_submission_id)
  select x, v_submission_id from unnest(v_locations) as x;
  insert into public.pain_characteristics (pain_characteristic, pain_assessment_submission_id)
  select x, v_submission_id from unnest(v_characteristics) as x;

  return v_submission_id;
end;
$$;

revoke all on function public.update_pain_assessment(date, int, int, int, int, text[], text[])
  from public, anon;
grant execute on function public.update_pain_assessment(date, int, int, int, int, text[], text[])
  to authenticated;

-- Movement -----------------------------------------------------------------------------------
create function public.update_movement_assessment(
  p_week_start date,
  p_active_hours numeric,
  p_general_impacts text[],
  p_walking text,
  p_lifting text,
  p_sitting text,
  p_standing text,
  p_reflection text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_users_id integer;
  v_impacts text[];
  v_walking text := btrim(p_walking);
  v_lifting text := btrim(p_lifting);
  v_sitting text := btrim(p_sitting);
  v_standing text := btrim(p_standing);
  v_reflection text := nullif(btrim(p_reflection), '');
  v_submission_id integer;
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  if p_active_hours is null or p_active_hours < 0 or p_active_hours > 24 then
    raise exception 'INVALID_HOURS' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_impacts
    from (select btrim(x) as t from unnest(p_general_impacts) as x) s
   where t is not null and t <> '';
  if cardinality(v_impacts) = 0 then
    raise exception 'NO_IMPACT' using errcode = 'P0001';
  end if;
  if exists (select 1 from unnest(v_impacts) x where char_length(x) > 100) then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  if v_walking is null or v_walking = ''
     or v_lifting is null or v_lifting = ''
     or v_sitting is null or v_sitting = ''
     or v_standing is null or v_standing = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;

  update public.movement_assessment
     set average_active_hours = p_active_hours,
         walking_impact = v_walking,
         lifting_impact = v_lifting,
         sitting_impact = v_sitting,
         standing_impact = v_standing,
         reflection = v_reflection
   where users_id = v_users_id
     and week_start = p_week_start
  returning submission_id into v_submission_id;
  if v_submission_id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  delete from public.movement_general_impacts
   where movement_assessment_submission_id = v_submission_id;
  insert into public.movement_general_impacts (impact_statement, movement_assessment_submission_id)
  select x, v_submission_id from unnest(v_impacts) as x;

  return v_submission_id;
end;
$$;

revoke all on function public.update_movement_assessment(date, numeric, text[], text, text, text, text, text)
  from public, anon;
grant execute on function public.update_movement_assessment(date, numeric, text[], text, text, text, text, text)
  to authenticated;

-- Personal care ------------------------------------------------------------------------------
create function public.update_personal_care_assessment(
  p_week_start date,
  p_general_activities text[],
  p_washing_dressing text,
  p_sleeping text,
  p_reflection text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_users_id integer;
  v_activities text[];
  v_washing text := btrim(p_washing_dressing);
  v_sleeping text := btrim(p_sleeping);
  v_reflection text := nullif(btrim(p_reflection), '');
  v_submission_id integer;
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_activities
    from (select btrim(x) as t from unnest(p_general_activities) as x) s
   where t is not null and t <> '';
  if cardinality(v_activities) = 0 then
    raise exception 'NO_ACTIVITY' using errcode = 'P0001';
  end if;
  if exists (select 1 from unnest(v_activities) x where char_length(x) > 100) then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  if v_washing is null or v_washing = '' or v_sleeping is null or v_sleeping = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;

  update public.personal_care_assessment
     set washing_dressing = v_washing,
         sleeping = v_sleeping,
         reflection = v_reflection
   where users_id = v_users_id
     and week_start = p_week_start
  returning submission_id into v_submission_id;
  if v_submission_id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  delete from public.personal_care_general_activities
   where personal_care_assessment_submission_id = v_submission_id;
  insert into public.personal_care_general_activities (
    activity_statement, personal_care_assessment_submission_id
  )
  select x, v_submission_id from unnest(v_activities) as x;

  return v_submission_id;
end;
$$;

revoke all on function public.update_personal_care_assessment(date, text[], text, text, text)
  from public, anon;
grant execute on function public.update_personal_care_assessment(date, text[], text, text, text)
  to authenticated;

-- Social health (no child rows) --------------------------------------------------------------
create function public.update_social_health_assessment(
  p_week_start date,
  p_social_life text,
  p_travelling text,
  p_mood int,
  p_relation_with_others int,
  p_enjoyment_of_life int,
  p_mood_overall text,
  p_reflection text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_users_id integer;
  v_social_life text := btrim(p_social_life);
  v_travelling text := btrim(p_travelling);
  v_reflection text := nullif(btrim(p_reflection), '');
  v_submission_id integer;
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  if v_social_life is null or v_social_life = ''
     or v_travelling is null or v_travelling = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;

  update public.social_health_assessment
     set social_life = v_social_life,
         travelling = v_travelling,
         mood = p_mood,
         relation_with_others = p_relation_with_others,
         enjoyment_of_life = p_enjoyment_of_life,
         mood_overall = p_mood_overall,
         reflection = v_reflection
   where users_id = v_users_id
     and week_start = p_week_start
  returning submission_id into v_submission_id;
  if v_submission_id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  return v_submission_id;
end;
$$;

revoke all on function public.update_social_health_assessment(date, text, text, int, int, int, text, text)
  from public, anon;
grant execute on function public.update_social_health_assessment(date, text, text, int, int, int, text, text)
  to authenticated;

-- Management ---------------------------------------------------------------------------------
create function public.update_management_assessment(
  p_week_start date,
  p_exercise text,
  p_emotion text,
  p_otc_medication text,
  p_no_medication boolean,
  p_medications text[]
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_users_id integer;
  v_exercise text := btrim(p_exercise);
  v_emotion text := nullif(btrim(p_emotion), '');
  v_otc text := nullif(btrim(p_otc_medication), '');
  v_no_medication boolean := coalesce(p_no_medication, false);
  v_medications text[];
  v_submission_id integer;
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  if v_exercise is null or v_exercise = '' then
    raise exception 'MISSING_ANSWER' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(distinct t), '{}'::text[])
    into v_medications
    from (select btrim(x) as t from unnest(p_medications) as x) s
   where t is not null and t <> '';
  if v_no_medication and cardinality(v_medications) > 0 then
    raise exception 'MEDICATION_CONFLICT' using errcode = 'P0001';
  end if;
  if exists (select 1 from unnest(v_medications) x where char_length(x) > 100) then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  update public.personal_management
     set exercise = v_exercise,
         emotion = v_emotion,
         otc_medication = v_otc,
         no_medication = v_no_medication
   where users_id = v_users_id
     and week_start = p_week_start
  returning submission_id into v_submission_id;
  if v_submission_id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  delete from public.personal_management_medication_names where submission_id = v_submission_id;
  insert into public.personal_management_medication_names (medication_name, submission_id)
  select x, v_submission_id from unnest(v_medications) as x;

  return v_submission_id;
end;
$$;

revoke all on function public.update_management_assessment(date, text, text, text, boolean, text[])
  from public, anon;
grant execute on function public.update_management_assessment(date, text, text, text, boolean, text[])
  to authenticated;
