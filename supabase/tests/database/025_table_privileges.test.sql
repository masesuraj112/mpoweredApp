begin;
select plan(4);

-- RLS only limits which rows a user can touch; the role also needs table privileges.
select ok(has_table_privilege('authenticated', 'public.users', 'SELECT'),
  'authenticated can select users (RLS still limits rows)');
select ok(has_table_privilege('authenticated', 'public.pain_assessment', 'INSERT'),
  'authenticated can insert pain_assessment');
select ok(has_table_privilege('authenticated', 'public.pain_location', 'INSERT'),
  'authenticated can insert pain_location');
select ok(has_table_privilege('authenticated', 'public.pain_characteristics', 'INSERT'),
  'authenticated can insert pain_characteristics');

select * from finish();
rollback;
