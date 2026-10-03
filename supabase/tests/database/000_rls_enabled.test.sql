begin;
select plan(1);

-- Guard: any table added to public later is covered automatically.
-- Do not allow-list a table here without a comment explaining why RLS is off.
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'every table in public has row level security enabled'
);

select * from finish();
rollback;
