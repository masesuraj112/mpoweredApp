begin;
create extension if not exists pgtap with schema extensions;

select plan(28);

-- fixtures (run as the migration/superuser role)
-- A and C joined 35 days ago, so recent past weeks are open for saving.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000c3');
insert into public.users (name, auth_id, created_at) values
  ('Test User A', '00000000-0000-0000-0000-0000000000a1', (current_date - 35)::timestamptz),
  ('Test User C', '00000000-0000-0000-0000-0000000000c3', (current_date - 35)::timestamptz);

-- privileges: authenticated only, and all five run as the owner (tables stay read/insert-only)
select ok(
  not has_function_privilege('anon', 'public.update_pain_assessment(date,int,int,int,int,text[],text[])', 'execute')
  and not has_function_privilege('anon', 'public.update_movement_assessment(date,numeric,text[],text,text,text,text,text)', 'execute')
  and not has_function_privilege('anon', 'public.update_personal_care_assessment(date,text[],text,text,text)', 'execute')
  and not has_function_privilege('anon', 'public.update_social_health_assessment(date,text,text,int,int,int,text,text)', 'execute')
  and not has_function_privilege('anon', 'public.update_management_assessment(date,text,text,text,boolean,text[])', 'execute'),
  'anon cannot execute any update function'
);

select ok(
  has_function_privilege('authenticated', 'public.update_pain_assessment(date,int,int,int,int,text[],text[])', 'execute')
  and has_function_privilege('authenticated', 'public.update_movement_assessment(date,numeric,text[],text,text,text,text,text)', 'execute')
  and has_function_privilege('authenticated', 'public.update_personal_care_assessment(date,text[],text,text,text)', 'execute')
  and has_function_privilege('authenticated', 'public.update_social_health_assessment(date,text,text,int,int,int,text,text)', 'execute')
  and has_function_privilege('authenticated', 'public.update_management_assessment(date,text,text,text,boolean,text[])', 'execute'),
  'authenticated can execute every update function'
);

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
      and p.proname in ('update_pain_assessment', 'update_movement_assessment',
        'update_personal_care_assessment', 'update_social_health_assessment',
        'update_management_assessment')),
  5,
  'all five update functions are security definer'
);

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

-- A saves one of each, two weeks ago
select lives_ok($$
  select public.save_pain_assessment(current_date - 14, 3, 1, 5, 2,
    array['Lower back', 'Neck'], array['Aching'])$$,
  'A saves a pain entry');
select lives_ok($$
  select public.save_movement_assessment(current_date - 14, 4, array['Slow', 'Tired'],
    'w', 'l', 's', 'st', 'first')$$,
  'A saves a movement entry');
select lives_ok($$
  select public.save_personal_care_assessment(current_date - 14, array['Shower'], 'wash', 'sleep', 'first')$$,
  'A saves a personal care entry');
select lives_ok($$
  select public.save_social_health_assessment(current_date - 14, 'social', 'travel',
    3, 4, 5, 'I was feeling calm', 'first')$$,
  'A saves a social health entry');
select lives_ok($$
  select public.save_management_assessment(current_date - 14, '3–4 days', null, null, false,
    array['Panadol', 'Amlodipine 5 mg'])$$,
  'A saves a management entry');

-- errors
select throws_ok(
  $$select public.update_pain_assessment(date_trunc('week', current_date - 7)::date, 3, 1, 5, 2,
    array['Neck'], array['Aching'])$$,
  'P0001', 'NOT_FOUND', 'a week with no entry raises NOT_FOUND'
);
select throws_ok(
  $$select public.update_pain_assessment(date_trunc('week', current_date - 14)::date, 3, 1, 5, 2,
    array['  '], array['Aching'])$$,
  'P0001', 'NO_LOCATION', 'the save validation still applies (no location)'
);
select throws_ok(
  $$select public.update_management_assessment(date_trunc('week', current_date - 14)::date,
    '0 days', null, null, true, array['Panadol'])$$,
  'P0001', 'MEDICATION_CONFLICT', 'the save validation still applies (medication conflict)'
);

-- pain: answers change in place, child lists are replaced
select is(
  public.update_pain_assessment(date_trunc('week', current_date - 14)::date, 6, 2, 9, 5,
    array['Knee', 'Knee '], array['Sharp']),
  (select submission_id from public.pain_assessment),
  'pain update keeps the submission id'
);
select is(
  (select array[current_pain_level, mildest_pain_level, worst_pain_level, average_pain_level]
     from public.pain_assessment),
  array[6, 2, 9, 5],
  'pain levels are updated'
);
select is(
  array(select pain_location::text from public.pain_location order by 1),
  array['Knee'],
  'pain locations are replaced (and de-duplicated)'
);
select is(
  array(select pain_characteristic::text from public.pain_characteristics order by 1),
  array['Sharp'],
  'pain characteristics are replaced'
);
select is(
  (select "date" from public.pain_assessment),
  current_date - 14,
  'the original date is kept'
);

-- movement
select is(
  public.update_movement_assessment(date_trunc('week', current_date - 14)::date, 7.5,
    array['Stiff'], 'w2', 'l2', 's2', 'st2', '  '),
  (select submission_id from public.movement_assessment),
  'movement update keeps the submission id'
);
select ok(
  (select average_active_hours = 7.5 and walking_impact = 'w2' and standing_impact = 'st2'
      and reflection is null
     from public.movement_assessment),
  'movement answers are updated and a blank reflection becomes null'
);
select is(
  array(select impact_statement::text from public.movement_general_impacts order by 1),
  array['Stiff'],
  'movement impacts are replaced'
);

-- personal care
select is(
  public.update_personal_care_assessment(date_trunc('week', current_date - 14)::date,
    array['Dressing', 'Cooking'], 'wash2', 'sleep2', 'second'),
  (select submission_id from public.personal_care_assessment),
  'personal care update keeps the submission id'
);
select ok(
  (select washing_dressing = 'wash2' and sleeping = 'sleep2' and reflection = 'second'
     from public.personal_care_assessment),
  'personal care answers are updated'
);
select is(
  array(select activity_statement::text from public.personal_care_general_activities order by 1),
  array['Cooking', 'Dressing'],
  'personal care activities are replaced'
);

-- social health (no child rows)
select is(
  public.update_social_health_assessment(date_trunc('week', current_date - 14)::date,
    'social2', 'travel2', 7, 8, 9, 'I was feeling okay', null),
  (select submission_id from public.social_health_assessment),
  'social health update keeps the submission id'
);
select ok(
  (select social_life = 'social2' and travelling = 'travel2' and mood = 7
      and relation_with_others = 8 and enjoyment_of_life = 9
      and mood_overall = 'I was feeling okay' and reflection is null
     from public.social_health_assessment),
  'social health answers are updated'
);

-- management
select is(
  public.update_management_assessment(date_trunc('week', current_date - 14)::date,
    '0 days', ' tired ', null, true, array[]::text[]),
  (select submission_id from public.personal_management),
  'management update keeps the submission id'
);
select ok(
  (select exercise = '0 days' and emotion = 'tired' and otc_medication is null and no_medication
     from public.personal_management)
  and not exists (select 1 from public.personal_management_medication_names),
  'management answers are updated and the medication names are replaced'
);

-- another user cannot change A's entry
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000c3', 'role', 'authenticated')::text, true);
select throws_ok(
  $$select public.update_pain_assessment(date_trunc('week', current_date - 14)::date, 0, 0, 0, 0,
    array['Hip'], array['Dull'])$$,
  'P0001', 'NOT_FOUND', 'another user updating the same week gets NOT_FOUND'
);

reset role;
select is(
  (select worst_pain_level from public.pain_assessment),
  9,
  'A''s pain entry is unchanged by the other user'
);

select * from finish();
rollback;
