# Settings backend: feature/settings-backend

Steps to connect the Settings screens to Supabase, and the controls to comment out because
they do nothing in this branch.

## Depends on `feature/onboarding-login-backend`
That branch adds phone code sign-in and the `create_profile` database function, which creates the
`users`, `patients` and `patient_musko_skeletal_pain` rows at sign-up. Settings needs those rows:
- the name is stored in `users`
- the year of birth is stored in `patients`
- every support person row needs a `patient_id`

Before starting:
- Rebase onto `main` after the login branch merges.
- Push its migrations to the dev project (`supabase db push --dry-run`, then `supabase db push`).
  See `docs/backend/login-backend.md`.

What the login branch changes for this plan:
- Users sign in with a phone number and an SMS code. They have **no password and no email**.
- `users.user_type` is `'patient'` or `'support_person'`. A support person has a `users` row only:
  no `patients` row, so no year of birth.
- `authenticated` has only `select` and `insert` on `users`, `patients` and
  `patient_musko_skeletal_pain` (revoke-then-grant). Nobody can change `user_type`.
- `src/services/profile.ts` exists (`createProfile` and a `run()` wrapper). `signOut()` is in `src/services/auth.ts`.
- `AuthContext` doesn't expose `user_type` yet, so the app can't tell a patient from a support person.

## Open questions
Ask before writing the related step.
- **`support_persons.access_type` format.** The Planner and the support person back end rely on it too.
  Settle it with the teammate building the support person back end.
- **Password and Face ID (login decision L16).** Phone users have no password, so change password can't work.
- **Email in Personal details.** Users sign up without one. `auth.updateUser({ email })` would add an email
  login to a phone account. Default until decided: hide the email field.
- **Phone number change (login decision L17).** Needs re-verification. Default until decided: show the phone read-only.
- **Must a support person's phone be a mobile?** Only mobiles can link to a support person account.
  See "Phone numbers" under Support persons.
- **Appointment links when a support person is deleted.** No foreign key has ON DELETE CASCADE.
- **What gets deleted along with an account**, including a support person's links to patients.

## Support persons
There are two sides to support persons in Settings:
- **Patients managing their support persons:** the Support persons screen. This branch builds it (steps 1, 3 and 5).
- **Support person users using Settings:** people who signed up as a support person. Settings has to
  handle them (steps 3, 4, 5 and 8).

The login handover (`feature/onboarding-login-backend`) lists eight things it left undone. Who owns each one:

| # | Handover item | Owner | In this plan |
| - | ------------- | ----- | ------------ |
| 1 | Nothing sets `support_persons.users_id` (no link between a patient's entry and the support person's account) | Support person back end | Not built here. Step 3 saves phones in E.164 so a phone match works later. `phone_number` has no unique constraint, so agree whether `(patient_id, phone_number)` should be unique. |
| 2 | `support_persons.email` is NOT NULL, but sign-up has no email | This branch | Step 1 makes phone and email nullable, with a check that one is set. |
| 3 | `AuthContext` and `hasProfile()` don't expose `user_type` | Agree who | Step 3: `getProfile()` returns `userType`. If the support person back end adds `userType` to `AuthContext`, Settings reads it from there instead. |
| 4 | No `user_type` guards on patient features | Support person back end | Settings hides its patient-only parts (step 4 year field, step 5 screen). Database guards on pain and social health aren't in scope. |
| 5 | No pgTAP tests for support person access or the `support_persons` table | Agree who | Step 2 `045_support_persons_rls.test.sql` covers the patient's side. Support person reads of patient data belong to the support person back end. |
| 6 | Privileges on `support_persons` weren't reviewed | This branch | Step 1: revoke then grant. |
| 7 | `access_type` values aren't defined | Both (decide together) | Open question. Step 1 adds the format once agreed; step 3 maps the two toggles to it. |
| 8 | Existing support person screens weren't checked | This branch for Settings | `settings/support-persons.tsx` is UI only (hardcoded `INITIAL_PEOPLE`); step 5 connects it. `planner/support-person.tsx` makes no database calls and is left to the support person back end. |

### Toggles to `access_type`
The Support persons screen has two toggles per person: **Add questions** (`canAddQuestions`) and
**Add doctor's answers** (`canAddAnswers`). Once the format is agreed, map them both ways in
`src/services/contacts.ts`. With the suggested tokens:

| Add questions | Add doctor's answers | `access_type` |
| ------------- | -------------------- | ------------- |
| off | off | `''` |
| on | off | `'questions'` |
| off | on | `'answers'` |
| on | on | `'questions,answers'` |

Always write the tokens in that order, so one combination never gets two spellings.

### Phone numbers
- The screen's `validatePhone` accepts any Australian number, but `toE164` and the support person's
  `users.phone_number` are mobiles only (`+614` and 8 digits). Decide whether a support person's phone must be a mobile:
  - **Mobile only (suggested):** validate with `isValidAuMobile` (`src/features/auth/phone.ts`), so every saved number can be linked later.
  - **Any number:** store landlines as entered; they can never link to an account.
- `support_persons.phone_number` is `varchar(12)`, which fits E.164 exactly.

### What a support person user sees in Settings
| Screen | Patient | Support person |
| ------ | ------- | -------------- |
| Personal details | Name, year of birth, phone (read-only) | Name, phone (read-only). No year: they have no `patients` row. |
| Support persons | Shown | Hidden, row and screen. |
| Notifications | Shown | Shown. `user_settings` is keyed on `users_id`, so it works for both. |
| Export my data | Their own rows | Their `users` row and the `support_persons` rows that link to them. |
| Account deletion | All their data | Their `users` row and settings. Patients' `support_persons` rows stay (see step 8). |

## Already working
- Sign out (`settings/index.tsx`, `settings/profile.tsx`), through `signOut()` in `src/services/auth.ts`.

## Steps

### 1. Database migration
Add a new migration (never edit an old one):
- **Profile updates:** add an `update_profile(p_name, p_year_of_birth)` function in the same style as
  `create_profile`:
  - Security invoker, user from `auth.uid()`.
  - Same checks: name 1 to 45 characters after trimming, year empty or 1900 to the current year.
  - Updates `users.name`, and `patients.year_of_birth` only when the user has a `patients` row.
  - Revoke from `public, anon`; grant execute to `authenticated`.
  - It needs column grants to run: `grant update (name) on public.users to authenticated;` and
    `grant update (year_of_birth) on public.patients to authenticated;`. Never grant `update (user_type)`.
- **`support_persons` privileges:** revoke then grant, like the login migration. `anon` currently has
  `references`, `trigger` and `truncate`, and local and hosted defaults differ.
  - `revoke all on public.support_persons from anon, authenticated;`
  - `grant select, insert, update, delete on public.support_persons to authenticated;`
- **`support_persons` contact fields:** make `phone_number` and `email` nullable, and add
  `check (phone_number is not null or email is not null)`. The screen allows either one, and a support
  person signs up with no email.
- **`support_persons.access_type` format:** once agreed (see open questions). `is_support_person_for_patient`
  checks it with `LIKE '%<access>%'`, so use distinct tokens, e.g. `''`, `'questions'`, `'answers'`, `'questions,answers'`.
  - Optional: add a check constraint that limits it to those values.
- **New table `user_settings`**, one row per user:
  - `users_id` (primary key, references `users`)
  - `assessment_reminders` bool, `assessment_every` int (1–7), `assessment_unit` text (`days`|`weeks`)
  - `appointment_reminders` bool, `appointment_day_before` bool, `appointment_on_day` bool
  - Defaults must match the screen: off, every 3 days, off, off, off.
  - Enable RLS. Add select/insert/update rules using `users_id = public.current_users_id()`.
  - Revoke all from `anon, authenticated` first (local defaults grant everything to new tables), then
    grant `select, insert, update` to `authenticated`.
- Regenerate types: `supabase gen types typescript --local > src/types/database.ts`.

### 2. Database tests (`supabase/tests/database/`)
The login branch uses 060 and 061.
- `040_settings_privileges.test.sql`:
  - The new grants exist, and `anon` has nothing on `support_persons` or `user_settings`.
  - `authenticated` can't update `users.user_type`.
- `041_update_profile.test.sql`:
  - A patient can change their name and year.
  - A support person can change their name. The year is ignored.
  - Bad name or year is rejected; `anon` can't run it.
- `045_support_persons_rls.test.sql` (agree with the support person teammate who writes this, to avoid two copies):
  - The patient can add, read, edit and delete their own support persons.
  - Another user can't see them.
  - The contact check rejects a row with neither phone nor email.
  - A support person can't change their own `access_type` (an existing trigger enforces this).
- `050_user_settings_rls.test.sql`: users only see and change their own row.

### 3. Data access functions
Follow `src/services/assessments.ts` and `src/services/profile.ts`:
- Return `Result<T>` (`src/lib/result.ts`) and turn errors into messages with `mapError` (`src/lib/errors.ts`). Never throw.
- Accept the client as the last optional argument (`client: Client = supabase`).
- Look up the user by `auth_id`, as `getUserStartWeek` does. Always filter `users` by `auth_id`:
  `users_select` also returns a patient's row to their support persons.

Files:
- `src/services/profile.ts` (add to the existing file):
  - `getProfile()` returns `{ name, userType, yearOfBirth, phone }`. `yearOfBirth` is null for a support person.
  - `updateProfile({ name, yearOfBirth })` calls `update_profile`.
  - No `updateEmail` until the email question is answered.
- `src/services/contacts.ts` (currently empty): `listSupportPersons()`, `addSupportPerson()`, `updateSupportPerson()`, `removeSupportPerson()`.
  - Turn the two toggles into `access_type` and back (see "Toggles to `access_type`" above).
  - Save phone numbers in E.164 (`+614…`) with `toE164` (`src/features/auth/phone.ts`), not `normalisePhone`.
    The support person's own `users.phone_number` is E.164, and linking the two will likely match on phone.
- `src/services/settings.ts`: `getNotificationSettings()` returns the defaults when there's no row; `saveNotificationSettings()` creates or updates the row.
- Jest tests next to each file, with a fake client like `src/services/assessments.test.ts`.
  - Start each test file with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))`.
  - Add the new files to `collectCoverageFrom` in `jest.config.js`.

### 4. Account → Personal details (`app/(tabs)/settings/profile.tsx`)
- Load the profile when the screen opens, and remove the hardcoded "Sarah McLachlan" values. Show a loading state and an error state.
- Show the phone number read-only. Hide the email field (see open questions).
- Replace the date field (`SettingsModalDateField`) with a 4-digit year field (`SettingsModalField`, `keyboardType="number-pad"`, `maxLength={4}`).
  - Keep it optional, as in sign-up.
  - Hide it for a support person.
  - Allow years from 1900 to the current year. Move the year check out of `toProfileArgs` (`src/features/auth/profile.ts`)
    into a shared `validateYearOfBirth` in `src/services/validation.ts`, use it in both places, and test it in `__tests__/validation.test.ts`.
- Remove the date of birth handling that's no longer needed (`parseIsoDate`, `isFutureDate` and the date state). If `SettingsModalDateField` and the date helpers in `src/services/date.ts` aren't used anywhere else, delete them.
- On Ok:
  - Save the name and year.
  - Keep the popup open with the error message if the save fails.

### 5. Support persons (`app/(tabs)/settings/support-persons.tsx`)
- Hide this screen and its Settings row for a support person. Their inserts would fail RLS anyway.
- Load the list, and remove `INITIAL_PEOPLE`.
- Change `id` to the `support_person_id` number. A new person has no id until the insert returns one; this replaces the `new-${Date.now()}` trick.
- In `save()`: add the person if new, otherwise update them. Only change the list once the save succeeds.
- "Revoke all access" deletes the row, then removes it from the list.
- Show an empty state when the list has no one (`src/components/ui/EmptyState.tsx`).
- Not in this branch: setting `support_persons.users_id` to link the row to the support person's account.
  That belongs to the support person back end.

### 6. Notifications (`app/(tabs)/settings/notifications.tsx`)
- Load the settings when the screen opens.
- Save straight away when a toggle changes.
- Save when the user taps Ok in either popup.
- If a save fails, put the previous value back.
- No reminders are scheduled yet: this branch only stores the choices.

### 7. Export my data (`app/(tabs)/settings/legal.tsx`)
- Edge Function `supabase/functions/export-data`:
  - Check the user's sign-in token.
  - Read all of their rows with RLS, using the user's own token.
  - Return JSON.
- App:
  - Call it with `supabase.functions.invoke('export-data')`.
  - Write the file with `expo-file-system` and open the share sheet with `expo-sharing`. These packages need adding; check the Expo SDK 57 docs.

### 8. Account deletion (`app/(tabs)/settings/legal.tsx`)
- Edge Function `supabase/functions/delete-account`:
  - Check the user's sign-in token.
  - Delete their data, children first. Check the foreign keys: a cascade from `users` may not exist.
  - For a support person, don't delete the patient's `support_persons` rows. Suggested: set `users_id` to null (agree first, see open questions).
  - Then call `auth.admin.deleteUser` with the service role key, which lives only in the function's secrets.
- App:
  - Show a destructive confirmation (`Alert`, as "Revoke all access" does). Ideally make the user type DELETE.
    Re-entering a password isn't possible for phone users.
  - Call the function, then `signOut()`.

### 9. Before opening the PR
- `npm run lint && npm run typecheck && npm test`
- `supabase db reset && supabase test db`
- Check the generated types are committed. CI compares them with the migrations.
- Push the new migrations to the dev project before testing on a device. A green CI run doesn't mean they're there.
- Manual test on a device. Sign in with the dev test number and code: dev-login accounts have no `users` row,
  so the app keeps them out of the tabs.
  - As a patient: edit the name and year.
  - As a support person: edit the name; check the year field and Support persons screen are hidden.
  - Add, edit and remove a support person.
  - Change the notification settings, close the app and reopen it.
  - Export your data.
  - Delete a test account.

## Controls to comment out (no function in this branch)

| Screen | Control | Why it does nothing |
| ------ | ------- | ------------------- |
| Account (`settings/profile.tsx`) | **Change password** | Phone users have no password, so the old-password check always fails. Waits on L16. |
| Account (`settings/profile.tsx`) | **Enable FaceID** toggle | Only changes local state. No biometric login exists (needs `expo-local-authentication`). Waits on L16. |
| Display (`settings/display.tsx`) | **Text size** select | Only changes local state. Nothing reads it, and fonts come from `scaleFont` only. |
| Display (`settings/display.tsx`) | **Enable dark mode** toggle | Only changes local state. The app only uses `Colors.light`, and many colours are hardcoded. |
| Settings home (`settings/index.tsx`) | **Display** row | Comment it out with the Display page, otherwise it opens a page with nothing working. |

Notes:
- **Privacy policy and Terms** (`settings/privacy.tsx`, `settings/terms.tsx`) only say "coming soon". Nothing links to `terms.tsx`, because "View PP and T&Cs" opens `privacy.tsx` only. These are content to write, not backend work. Leave them or hide them as the team prefers.
- **Notification toggles** don't send reminders yet, but they are kept because this branch saves them (step 6).
- **Export my data / Account deletion** currently do `() => undefined`. They are kept because steps 7 and 8 make them work.
