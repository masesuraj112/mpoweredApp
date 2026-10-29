# Settings backend: feature/settings-backend

Steps to connect Settings to Supabase in **both apps**, the patient app (`app/(tabs)/settings`) and the
support person app (`app/(support)/support-settings`), and the controls to comment out because they do
nothing in this branch.

## Which branch does what

| Work | Branch |
| ---- | ------ |
| Every Settings screen in both apps, and the database work only Settings needs (profile edits, notification settings, export, account deletion) | `feature/settings-backend` (this plan) |
| Everything else for support persons: invitations, accept / reject / unpair, the table lockdown, the support person functions, the Care Planner tab, the `src/services/support-person.ts` rewrite | `feature/support-person-backend` (`docs/backend/support-person-backend-build-plan.md`) |

Where a Settings screen needs something from the support person branch, this plan says so and waits for it.
It never builds a second copy.

## Already on `main`
Built by the login, support person front end and Care Planner branches. Reuse it.
- **Sign-in:** phone number and SMS code only. Users have **no password and no email**. `users.user_type` is
  `patient` or `support_person`; a support person has a `users` row only (no `patients` row, so no year of birth).
- **Profile in the app:** `getProfile()` in `src/services/auth.ts` returns `{ userType, name, phone }`, and
  `AuthContext` exposes it as `profile`, with `refreshProfile()`.
- **Sign out:** `signOut()` in `src/services/auth.ts`, used by both Account pages.
- **Patient Settings > Support Persons is connected:** `useMySupportPersons` with `listMySupportPersons`,
  `saveSupportPerson` and `deleteSupportPerson` in `src/services/care-planner.ts`; loading, error and empty states.
- **`support_persons`:**
  - Explicit grants (revoke then grant).
  - Optional phone and email; only the name is required.
  - Phone is a mobile in E.164 (`+614` and 8 digits), unique per patient.
  - `access_type` is `none`, `questions`, `answers` or `questions,answers`; `src/features/care-planner/accessType.ts` converts it.
  - Deleting a support person deletes their appointment links (ON DELETE CASCADE).
- **Support person Settings** (front end only):
  - Home with three rows: Account, People you support, Privacy/Data and Legal.
  - **Account:** name and phone read-only, and Sign out. No Change password or Face ID.
  - **People you support:** the patients they support, with Unpair. It runs on `useSupportPerson`, which still uses placeholder data.
  - **Privacy/Data and Legal and Privacy:** re-export the patient screens, so Export my data and Account deletion are shared.
- **RLS update policies already exist:** `users_update` (`auth_id = auth.uid()`) and `patients_update`
  (`users_id = current_users_id()`). Only the table grants are missing.
- **Packages:** `expo-sharing` is installed; `expo-file-system` isn't.

## Open questions
Ask before writing the step that needs the answer.

| # | Question | Owner | Default until answered | Step |
| - | -------- | ----- | ---------------------- | ---- |
| Q1 | Password and Face ID for phone users (login decision L16) | Team | Comment out Change password and Face ID on the patient Account page | Controls |
| Q2 | Email in patient Personal details. Users sign up without one, and `auth.updateUser({ email })` would add an email login to a phone account. | Team | Hide the email field | 4 |
| Q3 | Changing the phone number (login decision L17). Needs SMS re-verification. | Team | Phone read-only in both apps | 4, 5 |
| Q4 | Can a support person edit their own name? (`docs/support-person.md` section 4.4) | Team | Yes, with the same `update_profile` function as patients | 5 |
| Q5 | What gets deleted along with a patient account? Appointment tables have no ON DELETE rule (Care Planner M4). Do we keep anything, for example for MHA records? | Team, MHA | Delete everything the patient owns | 9 |
| Q6 | What happens to the patients' records when a support person deletes their account? | Team | Same as Unpair for every patient they support (see step 9) | 9 |

## Steps

### 1. Database migration
One new migration (`supabase migration new settings_backend`), never an edited one. Its timestamp must sort
after the newest migration on `main` when this branch merges (see "Working alongside the support person branch").

- **`update_profile(p_name text, p_year_of_birth int)`**, in the style of `create_profile`:
  - `plpgsql`, `security invoker`, `set search_path = public`, user from `auth.uid()`.
  - `NO_SESSION` when signed out, `NO_PROFILE` when there's no `users` row.
  - Same checks as `create_profile`: name 1 to 45 characters after trimming (`INVALID_NAME`); year empty or
    1900 to the current year (`INVALID_YEAR`).
  - Updates `users.name`. Updates `patients.year_of_birth` only for a patient; for a support person the year is ignored.
  - `revoke all … from public, anon; grant execute … to authenticated;`
  - It needs column grants to run: `grant update (name) on public.users to authenticated;` and
    `grant update (year_of_birth) on public.patients to authenticated;`. Never grant `update (user_type)`
    or `update (phone_number)`.
- **New table `user_settings`** (patients only; support persons have no Notifications page):
  - `users_id` (primary key, references `users`)
  - `assessment_reminders` bool, `assessment_every` int (1–7), `assessment_unit` text (`days`|`weeks`)
  - `appointment_reminders` bool, `appointment_day_before` bool, `appointment_on_day` bool
  - Defaults must match the screen: off, every 3 days, off, off, off.
  - Enable RLS. Select/insert/update policies using `users_id = public.current_users_id()`.
  - Revoke all from `anon, authenticated` (local defaults grant everything to new tables), then grant
    `select, insert, update` to `authenticated`.
- Regenerate `src/types/database.ts` from CI (`docs/backend/testing-and-cicd.md`); never edit it by hand.

### 2. Database tests (`supabase/tests/database/`)
`000`–`089` are taken and the support person branch has `090`–`092`, so this branch uses `093` onwards.
- `093_update_profile.test.sql`:
  - A patient can change their name and year.
  - A support person can change their name. The year is ignored.
  - Bad name or year is rejected; signed out gives `NO_SESSION`.
  - `anon` can't run it.
  - `authenticated` can't update `users.user_type` or `users.phone_number`.
  - One user can't change another user's row.
- `094_user_settings.test.sql`:
  - RLS is on; `anon` has nothing.
  - Users only see and change their own row; the defaults are as above.

### 3. Data access functions
Follow `src/services/care-planner.ts`: `Result<T>` through `run()`, errors through `mapError`, client as the
last optional argument, never send a user or patient id, always filter `users` by `auth_id`.
- `src/services/profile.ts` (add to the existing file):
  - `getPersonalDetails()` returns `{ name, phone, yearOfBirth }`; `yearOfBirth` is null for a support person
    or when it wasn't given. Keep `getProfile()` in `auth.ts` as it is: it runs on every launch, and the year isn't needed there.
  - `updateProfile({ name, yearOfBirth })` calls `update_profile`. After it succeeds, the screen calls
    `refreshProfile()` so the new name shows everywhere.
- `src/services/settings.ts`: `getNotificationSettings()` returns the defaults when there's no row;
  `saveNotificationSettings()` creates or updates the row.
- `validateYearOfBirth` in `src/services/validation.ts`, taken out of `toProfileArgs`
  (`src/features/auth/profile.ts`) and used in both places. Test it in `__tests__/validation.test.ts`.
- Jest tests next to each file with a fake client; start each service test with
  `jest.mock('@/lib/supabase', () => ({ supabase: {} }))`; add new files to `collectCoverageFrom` in `jest.config.js`.

### 4. Patient Account (`app/(tabs)/settings/profile.tsx`)
- Load `getPersonalDetails()` when the screen opens and remove the hardcoded "Sarah McLachlan" values. Show a loading state and an error state.
- Show the phone read-only with `formatForDisplay` (Q3). Hide the email field (Q2).
- Replace the date field (`SettingsModalDateField`) with an optional 4-digit year field (`SettingsModalField`,
  `keyboardType="number-pad"`, `maxLength={4}`), checked with `validateYearOfBirth`.
- Remove the date of birth code that's no longer needed (`parseIsoDate`, `isFutureDate`, the date state). If
  `SettingsModalDateField` and the date helpers in `src/services/date.ts` aren't used anywhere else, delete them.
- On Ok: save with `updateProfile`, then `refreshProfile()`. If the save fails, keep the popup open with the message.
- Comment out Change password and Face ID (Q1, see "Controls to comment out").

### 5. Support person Account (`app/(support)/support-settings/profile.tsx`)
- If Q4 is yes: make the name editable in Personal details (`SettingsModalField`, `maxLength={45}`), saved
  with `updateProfile({ name, yearOfBirth: null })`, then `refreshProfile()`. Same error handling as step 4.
- Keep the phone read-only (Q3) and change the note under it to say only the phone can't be changed yet.
- If Q4 is no: leave the screen as it is.

### 6. Patient Support persons: invitation status (`app/(tabs)/settings/support-persons.tsx`)
**Waits for the support person branch** to merge its `support_link_state` migration and the `status` field on
`SupportPerson` (its steps T2.1 and T1.2).
- Show Pending / Accepted / Declined on each row.
- Say in the Revoke all access popup that the person loses access at once.
- The support person plan lists this screen change under its T4. It moves here: tell the teammate, so it isn't built twice.

### 7. Notifications (`app/(tabs)/settings/notifications.tsx`, patients only)
- Load the settings when the screen opens.
- Save straight away when a toggle changes, and when the user taps Ok in either popup.
- If a save fails, put the previous value back.
- No reminders are scheduled yet: this branch only stores the choices.

### 8. Export my data (shared `app/(tabs)/settings/legal.tsx`)
The support person Legal page re-exports this screen, so one button serves both apps.
- Edge Function `supabase/functions/export-data`:
  - Check the user's sign-in token; read with the **user's own token**, so RLS applies.
  - **Patient:** their `users`, `patients`, conditions, assessments, appointments with questions and answers,
    support persons and `user_settings` rows.
  - **Support person:** their `users` row and the patients they support. Once the support person branch
    locks down the tables, they can't read `support_persons` directly, so call `list_supported_patients()`
    instead. Until that function exists, export the `users` row only.
  - Never include the consent signature image. Return JSON.
- App: call `supabase.functions.invoke('export-data')`, write the file with `expo-file-system` (add it; check the
  Expo SDK 58 docs), and open the share sheet with `expo-sharing` (installed).

### 9. Account deletion (shared `app/(tabs)/settings/legal.tsx`)
- Edge Function `supabase/functions/delete-account`:
  - Check the user's sign-in token, then work out `user_type` from their `users` row.
  - **Patient (Q5):** delete children first, because most foreign keys have no cascade:
    - appointment questions, appointment links and appointments
    - support persons
    - assessments, conditions and `patients`
    - `user_settings` and `users`
  - **Support person (Q6):** for each `support_persons` row linked to them, do what Unpair does: mark it
    `declined`, clear `users_id` and delete its appointment links. The patient's row stays. Then delete
    `user_settings` (if any) and `users`. `declined` only exists once the support person branch adds
    `status`; before that, clearing `users_id` is enough (nothing sets it yet). Keep the check
    "accepted only with a login" in mind (`chk_support_persons_link`).
  - Then `auth.admin.deleteUser` with the service role key, which lives only in the function's secrets.
  - Do it all in one database transaction, so a failure deletes nothing: a single `plpgsql` function that
    takes the `users_id`, executable by `service_role` only (`revoke all … from public, anon, authenticated`),
    called by the Edge Function. Test in `093`/`095` that `authenticated` can't run it.
- App:
  - Show a destructive confirmation (`Alert`, with `window.confirm` on web, as Unpair does). Ask the user to
    type DELETE. A password can't be asked for: phone users have none.
  - Call the function, then `signOut()`.

### 10. Before opening the PR
- `npm run lint && npm run typecheck && npm test`.
- Push, and let CI run the pgTAP files, `supabase db lint` and the generated-types check. Never run
  `supabase start`, `supabase test db` or `supabase db push` locally. A human applies migrations to shared
  databases; `deploy-db.yml` handles the hosted test database after merge.
- Commit the generated types from CI.
- Manual test on a device with the dev test numbers (dev-login accounts have no `users` row and can't reach the tabs):
  - **Patient:** edit the name and year; change notification settings, close and reopen the app; export your data; delete a test account.
  - **Support person:** edit the name (if Q4 is yes); check there's no year field; export your data; delete a
    test account and check the patient's Support persons screen.
  - **Both:** Change password and Face ID aren't shown; the phone is read-only.

## Working alongside the support person branch
- **Merge order:** either branch can merge first. Step 6 waits for the support person branch. Steps 8 and 9 work
  before it and get their support person details right after it.
- **Migration timestamps:** whichever branch merges second renames its migration (a new `supabase migration new`)
  so it sorts after the other's. Never rename a migration that has merged.
- **Shared files:** both branches regenerate `src/types/database.ts` and may touch `src/lib/errors.ts` and
  `src/features/care-planner/messages.ts`. Merge `main` in before regenerating types.
- **Table lockdown:** the support person branch replaces `users_select` and the `support_persons` policies so a
  support person sees only their own `users` row. `update_profile` and `getPersonalDetails` only use the
  caller's own rows, so they keep working; `093_update_profile` must still pass after that change.

## Controls to comment out (no function in this branch)

| Screen | Control | Why it does nothing |
| ------ | ------- | ------------------- |
| Patient Account (`settings/profile.tsx`) | **Change password** | Phone users have no password, so the old-password check always fails. Waits on Q1. |
| Patient Account (`settings/profile.tsx`) | **Enable FaceID** toggle | Only changes local state. No biometric login exists (needs `expo-local-authentication`). Waits on Q1. |
| Display (`settings/display.tsx`) | **Text size** select | Only changes local state. Nothing reads it, and fonts come from `scaleFont` only. |
| Display (`settings/display.tsx`) | **Enable dark mode** toggle | Only changes local state. The app only uses `Colors.light`, and many colours are hardcoded. |
| Patient Settings home (`settings/index.tsx`) | **Display** row | Comment it out with the Display page, otherwise it opens a page with nothing working. |

Notes:
- The support person Account page already has no Change password or Face ID.
- **Privacy policy and Terms** (`settings/privacy.tsx`, `settings/terms.tsx`) only say "coming soon", and nothing
  links to `terms.tsx`. Content to write, not backend work. Both apps share them.
- **Notification toggles** don't send reminders yet, but are kept because this branch saves them (step 7).
- **Export my data / Account deletion** currently do `() => undefined`. They are kept because steps 8 and 9 make them work.
