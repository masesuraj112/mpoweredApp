begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

-- RLS only limits which rows a user can touch; the role also needs table privileges.
select ok(
  has_table_privilege('authenticated', 'public.personal_care_assessment', 'SELECT')
  and has_table_privilege('authenticated', 'public.personal_care_general_activities', 'SELECT'),
  'authenticated can select the personal care tables'
);

select ok(
  has_table_privilege('authenticated', 'public.personal_care_assessment', 'INSERT')
  and has_table_privilege('authenticated', 'public.personal_care_general_activities', 'INSERT'),
  'authenticated can insert into the personal care tables'
);

select ok(
  not has_table_privilege('authenticated', 'public.personal_care_assessment', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.personal_care_general_activities', 'UPDATE'),
  'authenticated cannot update the personal care tables'
);

select ok(
  not has_table_privilege('authenticated', 'public.personal_care_assessment', 'DELETE')
  and not has_table_privilege('authenticated', 'public.personal_care_general_activities', 'DELETE'),
  'authenticated cannot delete from the personal care tables'
);

select ok(
  not has_table_privilege('anon', 'public.personal_care_assessment', 'SELECT')
  and not has_table_privilege('anon', 'public.personal_care_general_activities', 'SELECT'),
  'anon cannot read the personal care tables'
);

select ok(
  not has_table_privilege('anon', 'public.personal_care_assessment', 'INSERT'),
  'anon cannot insert into personal care assessments'
);

select * from finish();
rollback;