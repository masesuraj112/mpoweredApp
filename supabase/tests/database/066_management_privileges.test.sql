begin;
select plan(5);

select ok(has_table_privilege('authenticated', 'public.personal_management', 'SELECT')
      and has_table_privilege('authenticated', 'public.personal_management', 'INSERT'),
  'authenticated can select and insert personal_management');
select ok(has_table_privilege('authenticated', 'public.personal_management_medication_names', 'SELECT')
      and has_table_privilege('authenticated', 'public.personal_management_medication_names', 'INSERT'),
  'authenticated can select and insert medication names');
select ok(not has_table_privilege('authenticated', 'public.personal_management', 'UPDATE')
      and not has_table_privilege('authenticated', 'public.personal_management', 'DELETE'),
  'authenticated cannot update or delete a management submission');
select ok(not has_table_privilege('authenticated', 'public.personal_management_medication_names', 'UPDATE')
      and not has_table_privilege('authenticated', 'public.personal_management_medication_names', 'DELETE'),
  'authenticated cannot update or delete medication names');
select ok(not has_table_privilege('anon', 'public.personal_management', 'SELECT')
      and not has_table_privilege('anon', 'public.personal_management_medication_names', 'SELECT'),
  'anon has no access to management tables');

select * from finish();
rollback;
