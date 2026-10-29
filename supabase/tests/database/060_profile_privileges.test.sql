begin;
select plan(8);

select ok(has_table_privilege('authenticated', 'public.users', 'INSERT'),
  'authenticated can insert users');
select ok(has_table_privilege('authenticated', 'public.patients', 'INSERT'),
  'authenticated can insert patients');
select ok(has_table_privilege('authenticated', 'public.patient_musko_skeletal_pain', 'INSERT'),
  'authenticated can insert patient_musko_skeletal_pain');
select ok(has_table_privilege('authenticated', 'public.patient_musko_skeletal_pain', 'SELECT'),
  'authenticated can select patient_musko_skeletal_pain (RLS still limits rows)');
select ok(
  not has_table_privilege('authenticated', 'public.users', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.users', 'DELETE')
  and not has_table_privilege('authenticated', 'public.patients', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.patients', 'DELETE')
  and not has_table_privilege('authenticated', 'public.patient_musko_skeletal_pain', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.patient_musko_skeletal_pain', 'DELETE'),
  'authenticated cannot update or delete the profile tables');
select ok(
  not has_table_privilege('anon', 'public.users', 'SELECT')
  and not has_table_privilege('anon', 'public.users', 'INSERT')
  and not has_table_privilege('anon', 'public.patients', 'SELECT')
  and not has_table_privilege('anon', 'public.patients', 'INSERT')
  and not has_table_privilege('anon', 'public.patient_musko_skeletal_pain', 'SELECT')
  and not has_table_privilege('anon', 'public.patient_musko_skeletal_pain', 'INSERT'),
  'anon cannot select or insert the profile tables');
select ok(
  not has_function_privilege('anon',
    'public.create_profile(text,text,text,int,text[],text,text)', 'execute'),
  'anon cannot execute create_profile');
select ok(
  has_function_privilege('authenticated',
    'public.create_profile(text,text,text,int,text[],text,text)', 'execute'),
  'authenticated can execute create_profile');

select * from finish();
rollback;
