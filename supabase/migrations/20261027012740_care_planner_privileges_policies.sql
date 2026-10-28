-- Rollback:
--   drop trigger ahsp_limit_two on public.appointment_has_support_persons;
--   drop function public.limit_appointment_support_people();
--   drop policy ahsp_delete on public.appointment_has_support_persons;
--   -- restores the Supabase local default of full access; only needed on a local database:
--   grant all on public.appointment_questions, public.support_persons,
--     public.appointment_has_support_persons to anon, authenticated;

-- RLS only filters rows; the role also needs table privileges, and the hosted project grants
-- none by default while local Supabase grants everything. Make both match.
-- appointment_questions: rows are created by save_appointment_suggestions and never deleted.
-- support_persons: patients add, edit and remove their own support people.
-- appointment_has_support_persons: links are added and removed, never edited.
revoke all on public.appointment_questions, public.support_persons,
  public.appointment_has_support_persons from anon, authenticated;
grant select, insert, update on public.appointment_questions to authenticated;
grant select, insert, update, delete on public.support_persons to authenticated;
grant select, insert, delete on public.appointment_has_support_persons to authenticated;

-- A patient can unlink a support person from their own appointment.
create policy ahsp_delete
  on public.appointment_has_support_persons
  as permissive
  for delete
  to authenticated
  using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_has_support_persons.appointment_id
       and public.is_own_patient_record(a.patient_id)
  ));

-- At most two support people per appointment.
create function public.limit_appointment_support_people()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (select count(*) from public.appointment_has_support_persons
       where appointment_id = new.appointment_id) >= 2 then
    raise exception 'TOO_MANY_SUPPORT_PEOPLE' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger ahsp_limit_two
  before insert on public.appointment_has_support_persons
  for each row execute function public.limit_appointment_support_people();
