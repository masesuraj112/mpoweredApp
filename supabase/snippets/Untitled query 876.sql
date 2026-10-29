insert into public.users (name, auth_id)
select 'Test User', id from auth.users where email = 'test@example.com';
