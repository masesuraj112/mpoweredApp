begin;
create extension if not exists pgtap with schema extensions;

select plan(5);

-- RLS only limits which rows a user can touch; the role also needs table privileges.
select ok(
  has_table_privilege('authenticated', 'public.movement_assessment', 'SELECT')
  and has_table_privilege('authenticated', 'public.movement_general_impacts', 'SELECT'),
  'authenticated can select the movement tables'
);

select ok(
  has_table_privilege('authenticated', 'public.movement_assessment', 'INSERT')
  and has_table_privilege('authenticated', 'public.movement_general_impacts', 'INSERT'),
  'authenticated can insert into the movement tables'
);

select ok(
  not has_table_privilege('authenticated', 'public.movement_assessment', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.movement_general_impacts', 'UPDATE'),
  'authenticated cannot update the movement tables (no editing after submission)'
);

select ok(
  not has_table_privilege('authenticated', 'public.movement_assessment', 'DELETE')
  and not has_table_privilege('authenticated', 'public.movement_general_impacts', 'DELETE'),
  'authenticated cannot delete from the movement tables'
);

select ok(
  not has_table_privilege('anon', 'public.movement_assessment', 'SELECT')
  and not has_table_privilege('anon', 'public.movement_general_impacts', 'SELECT')
  and not has_table_privilege('anon', 'public.movement_assessment', 'INSERT'),
  'anon cannot read or insert into the movement tables'
);

select * from finish();
rollback;