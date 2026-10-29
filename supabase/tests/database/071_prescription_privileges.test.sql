begin;
create extension if not exists pgtap with schema extensions;

select plan(3);

select ok(
  has_table_privilege('authenticated', 'public.medications', 'SELECT')
  and has_table_privilege('authenticated', 'public.medications', 'INSERT')
  and has_table_privilege('authenticated', 'public.medications', 'UPDATE')
  and has_table_privilege('authenticated', 'public.dosage', 'SELECT')
  and has_table_privilege('authenticated', 'public.dosage', 'INSERT')
  and has_table_privilege('authenticated', 'public.dosage', 'UPDATE'),
  'authenticated can select, insert and update prescriptions and dosages'
);

select ok(
  not has_table_privilege('authenticated', 'public.medications', 'DELETE')
  and not has_table_privilege('authenticated', 'public.dosage', 'DELETE'),
  'authenticated cannot hard-delete prescriptions or dosages'
);

select ok(
  not has_table_privilege('anon', 'public.medications', 'SELECT')
  and not has_table_privilege('anon', 'public.medications', 'INSERT')
  and not has_table_privilege('anon', 'public.medications', 'UPDATE')
  and not has_table_privilege('anon', 'public.medications', 'DELETE')
  and not has_table_privilege('anon', 'public.dosage', 'SELECT')
  and not has_table_privilege('anon', 'public.dosage', 'INSERT')
  and not has_table_privilege('anon', 'public.dosage', 'UPDATE')
  and not has_table_privilege('anon', 'public.dosage', 'DELETE'),
  'anon has no access to prescriptions or dosages'
);

select * from finish();
rollback;
