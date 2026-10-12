-- Rollback:
--   drop function public.save_prescription(text, numeric, text, text, numeric, int, text, int);
--   alter table public.dosage drop constraint dosage_medications_id_key,
--     drop constraint chk_dosage_amount, drop constraint chk_dosage_repeats_every,
--     drop constraint chk_dosage_unit_of_time;
--   alter table public.dosage alter column amount type integer;
--   alter table public.medications drop column deleted_at, drop column created_at,
--     drop constraint chk_medications_strength, drop constraint chk_medications_strength_unit,
--     drop constraint chk_medications_form;
--   alter table public.medications alter column strength type integer;
--   revoke select on public.patient_musko_skeletal_pain, public.movement_assessment,
--     public.movement_general_impacts, public.personal_care_assessment,
--     public.personal_care_general_activities, public.social_health_assessment,
--     public.personal_management, public.personal_management_medications from authenticated;
--   revoke select, insert, update on public.medications, public.dosage from authenticated;

-- My Health reads every assessment table. RLS limits rows to the user's own; the role
-- also needs the privilege (the hosted project grants none by default).
grant select on
  public.patient_musko_skeletal_pain,
  public.movement_assessment,
  public.movement_general_impacts,
  public.personal_care_assessment,
  public.personal_care_general_activities,
  public.social_health_assessment,
  public.personal_management,
  public.personal_management_medications
  to authenticated;

-- Prescriptions. Strength (e.g. 0.5 mg) and amount (e.g. half a tablet) can be decimals.
-- Deleting sets deleted_at instead of removing the row, because past management
-- submissions reference the medication (personal_management_medications) and must
-- keep showing what was taken that week. No delete privilege is granted.
alter table public.medications
  alter column strength type numeric(10,3),
  add column created_at timestamptz not null default now(),
  add column deleted_at timestamptz,
  add constraint chk_medications_strength check (strength > 0),
  add constraint chk_medications_strength_unit check (strength_unit in ('mg', 'g', '%', 'iu', 'ug')),
  add constraint chk_medications_form check (
    form in ('tablets', 'capsules', 'liquids', 'drops', 'injections', 'sprays', 'ml', 'patches')
  );

-- One dosage row per medication
alter table public.dosage
  alter column amount type numeric(10,3),
  add constraint dosage_medications_id_key unique (medications_id),
  add constraint chk_dosage_amount check (amount > 0),
  add constraint chk_dosage_repeats_every check (repeats_every > 0),
  add constraint chk_dosage_unit_of_time check (unit_of_time in ('hours', 'days', 'weeks', 'months'));

grant select, insert, update on public.medications, public.dosage to authenticated;

-- Creates (no p_medication_id) or edits a prescription: the medication and its dosage
-- in one transaction. Returns the medication_id.
create function public.save_prescription(
  p_name text,
  p_strength numeric,
  p_strength_unit text,
  p_form text,
  p_amount numeric,
  p_repeats_every int,
  p_unit_of_time text,
  p_medication_id int default null
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer;
  v_name text := btrim(p_name);
  v_medication_id integer;
begin
  v_users_id := public.current_users_id();
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;

  if v_name is null or v_name = '' then
    raise exception 'NO_NAME' using errcode = 'P0001';
  end if;
  if char_length(v_name) > 100 then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;

  -- Check constraints (23514) on strength, amount, units and form are left to the client to map.
  if p_medication_id is null then
    insert into public.medications (name, strength, strength_unit, form, users_id)
    values (v_name, p_strength, p_strength_unit, p_form, v_users_id)
    returning medication_id into v_medication_id;
  else
    update public.medications
       set name = v_name, strength = p_strength, strength_unit = p_strength_unit, form = p_form
     where medication_id = p_medication_id
       and users_id = v_users_id
       and deleted_at is null
    returning medication_id into v_medication_id;
    if v_medication_id is null then
      raise exception 'NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  insert into public.dosage (medications_id, amount, repeats_every, unit_of_time)
  values (v_medication_id, p_amount, p_repeats_every, p_unit_of_time)
  on conflict (medications_id) do update
    set amount = excluded.amount,
        repeats_every = excluded.repeats_every,
        unit_of_time = excluded.unit_of_time;

  return v_medication_id;
end;
$$;

revoke all on function public.save_prescription(text, numeric, text, text, numeric, int, text, int)
  from public, anon;
grant execute on function public.save_prescription(text, numeric, text, text, numeric, int, text, int)
  to authenticated;
