-- Rollback:
--   drop index public.idx_support_persons_phone;
--   alter table public.support_persons
--     drop constraint chk_support_persons_status,
--     drop constraint chk_support_persons_link,
--     drop column responded_at,
--     drop column status;
--   (then restore save_support_person from the previous migration)

-- A patient's invitation to a support person has three states. The person sees an invitation
-- ("request") while it is pending and the patient's data only once they accept.
alter table public.support_persons
  add column status text not null default 'pending',
  add column responded_at timestamptz;

update public.support_persons
   set status = case when users_id is not null then 'accepted' else 'pending' end;

alter table public.support_persons
  add constraint chk_support_persons_status check (status in ('pending', 'accepted', 'declined')),
  -- accepted means linked to a login, and only then
  add constraint chk_support_persons_link check ((status = 'accepted') = (users_id is not null));

-- Invitations are found by the signed-in person's phone number.
create index idx_support_persons_phone on public.support_persons (phone_number)
  where phone_number is not null;

-- The patient adds or edits a support person. Adding someone who declined invites them again.
-- Changing an accepted person's phone number makes it a new invitation (a different person).
create or replace function public.save_support_person(
  p_name text,
  p_phone text,
  p_email text,
  p_access_type text,
  p_support_person_id int default null
)
returns public.support_persons
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
  v_name text := btrim(p_name);
  v_phone text := nullif(btrim(p_phone), '');
  v_email text := nullif(btrim(p_email), '');
  v_row public.support_persons;
begin
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_patient_id is null then
    raise exception 'NOT_A_PATIENT' using errcode = 'P0001';
  end if;
  if v_name is null or v_name = '' then
    raise exception 'INVALID_SUPPORT_PERSON' using errcode = 'P0001';
  end if;
  if char_length(v_name) > 100 or char_length(v_email) > 254 then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;
  if v_phone is not null and v_phone !~ '^\+614[0-9]{8}$' then
    raise exception 'INVALID_PHONE' using errcode = 'P0001';
  end if;
  if p_access_type is null
     or p_access_type not in ('none', 'questions', 'answers', 'questions,answers') then
    raise exception 'INVALID_ACCESS_TYPE' using errcode = 'P0001';
  end if;

  if p_support_person_id is null then
    insert into public.support_persons (patient_id, name, phone_number, email, access_type)
    values (v_patient_id, v_name, v_phone, v_email, p_access_type)
    on conflict (patient_id, phone_number) where phone_number is not null
    do update set name = excluded.name,
                  email = excluded.email,
                  access_type = excluded.access_type,
                  status = case when public.support_persons.status = 'declined'
                                then 'pending' else public.support_persons.status end,
                  responded_at = case when public.support_persons.status = 'declined'
                                      then null else public.support_persons.responded_at end
    returning * into v_row;
  else
    if v_phone is not null and exists (
      select 1 from public.support_persons
       where patient_id = v_patient_id
         and phone_number = v_phone
         and support_person_id <> p_support_person_id
    ) then
      raise exception 'DUPLICATE_SUPPORT_PERSON' using errcode = 'P0001';
    end if;
    update public.support_persons sp
       set name = v_name,
           phone_number = v_phone,
           email = v_email,
           access_type = p_access_type,
           -- a new number is a different person: invite again, and drop the old login link
           status = case when sp.phone_number is distinct from v_phone then 'pending' else sp.status end,
           users_id = case when sp.phone_number is distinct from v_phone then null else sp.users_id end,
           responded_at = case when sp.phone_number is distinct from v_phone then null else sp.responded_at end
     where sp.support_person_id = p_support_person_id
       and sp.patient_id = v_patient_id
    returning * into v_row;
    if not found then
      raise exception 'NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  return v_row;
end;
$$;
