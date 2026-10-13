# Login schema notes

Facts needed for profile creation (build plan S1.1). Sources: `supabase/migrations/20260902052010_remote_schema.sql`, later migrations in `supabase/migrations/`, and `src/types/database.ts`. Nothing here is inferred; gaps are listed at the end.

## `public.users`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `users_id` | integer | no | identity (always) | PK `users_pkey` |
| `name` | varchar(45) | no | none | |
| `phone_number` | varchar(12) | yes | none | `+614xxxxxxxx` is exactly 12 chars |
| `auth_id` | uuid | yes | none | FK `users_auth_id_fkey` to `auth.users(id)`; unique `users_auth_id_key` |
| `created_at` | timestamptz | no | `now()` | Added by `20261003002144_add_users_created_at.sql`; **has a default** |

Check constraints: none.

RLS (enabled), all `to public`:
- `users_select`: `auth_id = auth.uid()` OR the row belongs to a patient the caller supports (`is_support_person_for_patient`).
- `users_insert`: `with check (auth_id = auth.uid())`.
- `users_update`: `using` and `with check` `auth_id = auth.uid()`.
- No delete policy.

`authenticated` grants: `select` (migration `20261003021646`), plus the default `references`, `trigger`, `truncate`. **No insert, update or delete.**
`anon` grants: `references`, `trigger`, `truncate` only.

## `public.patients`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `patient_id` | integer | no | identity (always) | PK `patients_pkey` |
| `sex` | varchar(20) | **no** | none | |
| `other_conditions` | text | yes | none | |
| `users_id` | integer | no | none | FK `patients_users_id_fkey` to `users(users_id)`; index `idx_patients_users_id`; **not unique** |
| `year_of_birth` | smallint | yes | none | |

Check constraints:
- `chk_patients_sex`: `sex` in (`'Female'`, `'Male'`, `'Prefer not to say'`).
- `chk_patients_yob`: `year_of_birth` is null or between **1900 and 2100**.

RLS (enabled), all `to public`:
- `patients_select`: `can_access_patient(patient_id)`.
- `patients_insert`: `with check (users_id = current_users_id())`.
- `patients_update`: `using` and `with check` `users_id = current_users_id()`.
- No delete policy.

`authenticated` grants: `select` (migration `20261003022318`), plus default `references`, `trigger`, `truncate`. **No insert, update or delete.**
`anon`: `references`, `trigger`, `truncate` only.

## `public.patient_musko_skeletal_pain`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `patient_id` | integer | no | none | FK `patient_musko_skeletal_pain_patient_id_fkey` to `patients(patient_id)` |
| `disease` | varchar(45) | no | none | |

PK: composite (`patient_id`, `disease`), so a duplicate condition for one patient is a unique violation.
Check constraints: none.

RLS (enabled), all `to public`:
- `pmsp_select`: `is_own_patient_record(patient_id)`.
- `pmsp_insert`: `with check (is_own_patient_record(patient_id))`.
- `pmsp_delete`: `using (is_own_patient_record(patient_id))`.
- No update policy.

`authenticated` grants: default `references`, `trigger`, `truncate` only. **No select, insert or delete.**
`anon`: same defaults only.

## Helper functions (all `security definer`, `language sql`, `stable`, no `set search_path`)

- `current_users_id()`: `select users_id from users where auth_id = auth.uid()`; null when no profile row.
- `is_own_patient_record(target_patient_id)`: exists patient with that id and `users_id = current_users_id()`.
- `is_support_person_for_patient(target_patient_id, required_access default null)`.
- `can_access_patient(target_patient_id, required_access default null)`.
- `patient_id_for_user(target_users_id)`.

## Reference pattern

`save_pain_assessment` and `save_social_health_assessment` (migrations `20261003022756`, `20261007102120`) are the sibling functions to copy for grants and `P0001` codes. Privilege migrations use `revoke all ... from anon, authenticated` then an explicit grant, because local default privileges differ from hosted.

## Not in the schema (do not assume)

- `users.user_type` (only exists if S6.2 / decision L11 option B is built).
- Any column for `hasDiagnosis` or consent.
- Any check on `users.name` (blank/whitespace), `users.phone_number` (format), or `patient_musko_skeletal_pain.disease`. Only the `varchar` lengths 45 / 12 / 45 apply.
- A unique constraint on `phone_number`.
- A unique constraint on `patients.users_id`, so one user could have several `patients` rows unless the function prevents it.

## Conflicts with the build plan (to be decided, not silently resolved)

1. **`patients.sex` is `NOT NULL`.** S6.4 says sex may be "allowed DB values or null". A null sex would fail the `patients` insert. Needs a decision: make onboarding sex required, or relax the column.
2. **Year of birth range.** The DB allows 1900 to 2100; the plan validates 1900 to current year inside the function. That is stricter than the DB and is fine, but the function check is the only thing enforcing "not in the future".
3. **Insert privileges are missing on all three tables**, as the plan expects (S6.1), but `patient_musko_skeletal_pain` also lacks `select`, which the pgTAP "RLS visibility" case (061 #11) and any read of conditions will need. S6.1 as written grants insert only.
