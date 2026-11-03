begin;
select plan(3);

select ok(not exists (
  select 1
  from unnest(array['doctors','health_report','movement_condition','patient_reflection',
                    'personal_management_medications']) as t,
       unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) as p
  where has_table_privilege('anon', 'public.' || t, p)
), 'anon has no privileges on the five leftover tables');

select ok(not exists (
  select 1
  from unnest(array['doctors','health_report','movement_condition','patient_reflection',
                    'personal_management_medications']) as t,
       unnest(array['TRUNCATE','REFERENCES','TRIGGER']) as p
  where has_table_privilege('authenticated', 'public.' || t, p)
), 'authenticated cannot truncate, reference or add triggers on the five leftover tables');

select ok(has_table_privilege('service_role', 'public.doctors', 'TRUNCATE'),
  'service_role keeps its privileges');

select * from finish();
rollback;
