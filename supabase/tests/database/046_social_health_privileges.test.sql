begin;
select plan(5);

select ok(has_table_privilege('authenticated', 'public.social_health_assessment', 'SELECT'),
  'authenticated can select social_health_assessment (RLS still limits rows)');
select ok(has_table_privilege('authenticated', 'public.social_health_assessment', 'INSERT'),
  'authenticated can insert social_health_assessment');
select ok(not has_table_privilege('authenticated', 'public.social_health_assessment', 'UPDATE')
      and not has_table_privilege('authenticated', 'public.social_health_assessment', 'DELETE'),
  'authenticated cannot update or delete a submission (no editing after submission)');
select ok(not has_table_privilege('anon', 'public.social_health_assessment', 'SELECT'),
  'anon cannot select social_health_assessment');
select ok(not has_table_privilege('anon', 'public.social_health_assessment', 'INSERT'),
  'anon cannot insert social_health_assessment');

select * from finish();
rollback;
