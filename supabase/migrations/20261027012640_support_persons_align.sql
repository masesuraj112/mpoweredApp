-- Rollback (set not null fails if rows now hold nulls):
--   alter table public.appointment_has_support_persons
--     drop constraint appointment_has_support_persons_support_person_id_fkey,
--     add constraint appointment_has_support_persons_support_person_id_fkey
--       foreign key (support_person_id) references public.support_persons(support_person_id);
--   drop index public.uq_support_persons_patient_phone;
--   alter table public.support_persons
--     drop constraint chk_support_persons_access_type,
--     drop constraint chk_support_persons_phone,
--     drop constraint chk_support_persons_name_not_blank;
--   alter table public.support_persons
--     alter column email type varchar(45),
--     alter column name type varchar(45),
--     alter column email set not null,
--     alter column phone_number set not null;

-- Phone and email are optional in the app; the name is the only required detail.
-- Widen name and email (real addresses are longer than 45 characters).
alter table public.support_persons
  alter column phone_number drop not null,
  alter column email drop not null,
  alter column name type varchar(100),
  alter column email type varchar(254);

-- Tidy existing (development) rows so the new constraints can be added.
update public.support_persons set email = null where email is not null and btrim(email) = '';
update public.support_persons set phone_number = null
 where phone_number is not null and phone_number !~ '^\+614[0-9]{8}$';
update public.support_persons set access_type = 'none'
 where access_type not in ('none', 'questions', 'answers', 'questions,answers');

-- Phone numbers are stored in E.164 as Australian mobiles (+614...), the only numbers the app signs in
-- by SMS. A support person's own login is matched to this
-- number later, and users.phone_number is also E.164.
-- access_type is a comma-separated list of tokens; is_support_person_for_patient matches a
-- required token with LIKE, so the tokens must not contain each other or LIKE wildcards.
alter table public.support_persons
  add constraint chk_support_persons_name_not_blank check (length(btrim(name)) > 0),
  add constraint chk_support_persons_phone check (phone_number is null or phone_number ~ '^\+614[0-9]{8}$'),
  add constraint chk_support_persons_access_type
    check (access_type in ('none', 'questions', 'answers', 'questions,answers'));

-- The same person is not added twice for one patient.
create unique index uq_support_persons_patient_phone
  on public.support_persons (patient_id, phone_number)
  where phone_number is not null;

-- Removing a support person also removes their appointment links.
alter table public.appointment_has_support_persons
  drop constraint appointment_has_support_persons_support_person_id_fkey,
  add constraint appointment_has_support_persons_support_person_id_fkey
    foreign key (support_person_id) references public.support_persons(support_person_id)
    on delete cascade;
