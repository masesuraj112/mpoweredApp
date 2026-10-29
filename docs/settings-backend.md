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
  - Services: `sendVerificationCode(phone)` and `verifyCode(phone, code)` in `src/services/auth.ts`.
  - Helpers: `OTP_LENGTH`, `RESEND_SECONDS`, `sanitiseCode`, `isCodeComplete` (`src/features/auth/otp.ts`),
    `authErrorMessage` (`src/features/auth/messages.ts`), `formatForDisplay` (`src/features/auth/phone.ts`).
  - Not sign-in paths: `app/(auth)/dev-login.tsx` (email and password, development builds only, nothing links
    to it) and the Email provider, which `supabase/config.toml` still enables for local and CI use. Turning it
    off in production is on `docs/backend/production-auth-checklist.md`. Both belong to the login work, not this branch.
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

## Settled

Decided by Ryan Pham on 29 Oct 2026 unless noted.

| # | Decision | Why | Step |
| - | -------- | --- | ---- |
| — | **No password anywhere in Settings.** Change password is removed, not commented out. | Sign-in is phone and SMS code only, so there is no password to check or change. | 4 |
| — | **No email in Personal details.** The field is removed. | Users sign up without one, and `auth.updateUser({ email })` would add an email login to a phone account (and fails once the Email provider is off). A support person's email on the patient's Support persons screen stays: it's contact information, not a login. | 4 |
| — | **Account deletion is confirmed with a new SMS code** sent to the account's own phone, checked by the server. | It replaces a password check. Proves the person deleting still has the phone, not just an unlocked app. | 9 |
| Q1 | **Face ID is commented out.** It comes back later as an app lock on top of the SMS sign-in, in a future plan (login decision L16). | Not a way to log in with SMS sign-in; new work, not Settings backend. | Controls |
| Q2 | **The phone number is read-only in both apps** (login decision L17). | A change flow must keep `users.phone_number` in step with the login's phone, and support person invitations are matched by phone. Its own feature. | 4, 5 |
| Q3 | **Support persons can edit their own name**, with `update_profile`. | Free with the same function. It changes only their own account name: the patient's list shows `support_persons.name`, which the patient typed. | 5 |
| Q5 | **Deleting a support person account works like Unpair** for every patient they support: the row becomes `declined`, `users_id` is cleared and its appointment links are deleted. Pending invitations stay. | The rows belong to the patient. Re-signing up with the same number shows the pending invitations again. | 9 |
| Q4 | **Deleting a patient account deletes everything the patient owns** (approved 29 Oct 2026). Nothing is kept for 7 years. | See "Q4: what Australian law says": APP 11.2 says destroy data that's no longer needed. | 9 |

## Open questions
Ask before writing the step that needs the answer.

| # | Question | Owner | Default until answered | Step |
| - | -------- | ----- | ---------------------- | ---- |
| Q6 | Google Play also needs a **web page** where people can ask for their account to be deleted without the app. Where does it live, and who handles the requests? | Team, MHA | Not built in this branch; a section in the privacy policy is enough for Google | Before release |

### Q4: what Australian law says
Research on 29 Oct 2026, **not legal advice**. MHA should confirm with its privacy officer or lawyer.

1. **The Privacy Act 1988 almost certainly applies.** An organisation that provides a health service and holds health
   information is covered whatever its size; the small business exemption doesn't apply. The OAIC's definition of
   a health service includes "recording an individual's health to assess, maintain, improve or manage it", which
   is what the assessments and Care Planner do.
2. **APP 11.2: destroy or de-identify personal information once it's no longer needed**, unless an Australian law
   or a court order requires keeping it. A deleted account no longer needs its data, so the default is to destroy it.
   "Destroyed" means it can no longer be retrieved; where that isn't possible (for example backups), put it
   "beyond use". Reasonable steps include checking that providers holding the data (Supabase) actually delete it.
3. **State health records laws can require keeping records.** Victoria (Health Records Act 2001), NSW (HRIP Act 2002)
   and the ACT (Health Records (Privacy and Access) Act 1997) require **health service providers** to keep health
   records for **7 years after the last service** for adults, and until age 25 for anyone under 18. Destroyed records
   must be listed in a register (name, period covered, date destroyed). Other states have no such law for private
   providers. These rules are written for clinicians' records; **whether they cover a self-management app with no
   clinician is the key question for MHA**.
4. **There's no general "right to erasure" yet.** The Privacy Act tranche 2 exposure draft (31 Aug 2026) proposes one,
   but only for large digital platforms (around $500 million revenue or 2.5 million monthly Australian users). It's
   not law and wouldn't cover MPowered.
5. **The app stores require deletion anyway.** Apple (guideline 5.1.1(v)) requires starting account deletion inside
   the app, and allows extra confirmation steps for regulated industries such as health, so the SMS code is fine.
   Google Play requires the in-app option **and** a web page (Q6).

**What this means for step 9:** deletion of everything was approved on 29 Oct 2026, so step 9 is built as written. Kept for reference, in case MHA later finds the state laws apply:
- **If they do apply:** deletion can't destroy the health records for 7 years. Instead, `delete_account` would
  delete the login and the profile details, keep the health records **beyond use** (no role can read them, only an
  administrator for a legal request), record them in a register, and a scheduled job would destroy them after the
  period. That's a bigger change, so get the answer before commit 14.

Sources:
[OAIC, APP 11 guidelines](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information);
[OAIC, what is a health service provider](https://oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/covid-19/privacy/health-information/what-is-a-health-service-provider);
[OAIC, small business](https://www.oaic.gov.au/privacy/privacy-for-organisations/small-business);
[NSW IPC, retention for private health service providers](https://www.ipc.nsw.gov.au/node/2873);
[AMA Victoria, medical records retention](https://amavic.com.au/insights/resources/medical-records-storage-retention-and-destruction);
[HSF Kramer, tranche 2 draft](https://www.hsfkramer.com/insights/2026-09/the-draft-tranche-2-privacy-act-reforms-whats-there-whats-new-and-whats-missing);
[Apple, account deletion](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion);
[Google Play, account deletion](https://support.google.com/googleplay/android-developer/answer/13327111).

## Steps

### 1. Database migrations
One new migration per change (`supabase migration new <name>`), each committed with its pgTAP file (see
"Commits"): `settings_update_profile` and `settings_user_settings` here, `export_my_data` in step 8 and
`delete_account` in step 9. Never edit one, even before it merges; add another. Timestamps must sort after the
newest migration on `main` when this branch merges (see "Working alongside the support person branch").

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
- `095_export_my_data.test.sql` (step 8): each user gets only their own data; no signature; `anon` can't run it.
- `096_delete_account.test.sql` (step 9): a patient's rows are all gone; a support person's links are cleared and
  the patient's row stays; `authenticated` and `anon` can't run it.

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
- Show the phone read-only with `formatForDisplay` (Q2, settled).
- Remove the email field, its state and its `validateEmail` check. Keep `validateEmail` itself: the support
  person form (`src/features/care-planner/supportPerson.ts`) still uses it.
- Replace the date field (`SettingsModalDateField`) with an optional 4-digit year field (`SettingsModalField`,
  `keyboardType="number-pad"`, `maxLength={4}`), checked with `validateYearOfBirth`.
- Remove the date of birth code that's no longer needed (`parseIsoDate`, `isFutureDate`, the date state). If
  `SettingsModalDateField` and the date helpers in `src/services/date.ts` aren't used anywhere else, delete them.
- On Ok: save with `updateProfile`, then `refreshProfile()`. If the save fails, keep the popup open with the message.
- Remove Change password: the option, its popup and state, and the `signInWithPassword` and
  `updateUser({ password })` calls. Delete `validatePassword`, `PASSWORD_MIN_LENGTH` and the password rules from
  `src/services/validation.ts`, and their tests in `__tests__/validation.test.ts` (nothing else uses them).
- Comment out Face ID (Q1, settled; see "Controls to comment out").

### 5. Support person Account (`app/(support)/support-settings/profile.tsx`)
- Make the name editable (Q3, settled) in Personal details (`SettingsModalField`, `maxLength={45}`), saved
  with `updateProfile({ name, yearOfBirth: null })`, then `refreshProfile()`. Same error handling as step 4.
- Keep the phone read-only (Q2) and change the note under it to say only the phone can't be changed yet.

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
- Database function `export_my_data()` returning `jsonb`: `plpgsql`, `security invoker`, so RLS applies and
  only the caller's rows are read. A function rather than an Edge Function, because pgTAP can test it and CI
  has no tests for Edge Functions.
  - **Patient:** their `users`, `patients`, conditions, assessments, appointments with questions and answers,
    support persons and `user_settings` rows.
  - **Support person:** their `users` row and the patients they support. Once the support person branch
    locks down the tables, they can't read `support_persons` directly, so use `list_supported_patients()`
    instead. Until that function exists, export the `users` row only.
  - Never include the consent signature image.
- `exportMyData()` in `src/services/account.ts` calls it.
- App: write the JSON with `expo-file-system` (add it; check the Expo SDK 58 docs), and open the share sheet
  with `expo-sharing` (installed).

### 9. Account deletion (shared `app/(tabs)/settings/legal.tsx`)
**Confirming with an SMS code.** Deletion can't be undone, so the user proves they still have the phone,
using the same SMS code as sign-in instead of a password:
1. **Confirm:** a destructive popup says what will be deleted (`Alert`, with `window.confirm` on web, as Unpair does).
2. **Send a code:** `sendVerificationCode(profile.phone)`. The number comes from `useAuth().profile`, never from
   a field the user types in. The popup says "We've texted a code to 0491 570 006" (`formatForDisplay`).
3. **Enter the code:** a 6-digit field (`OTP_LENGTH`, `sanitiseCode`, `keyboardType="number-pad"`,
   `textContentType="oneTimeCode"`, `autoComplete="sms-otp"`), and a Resend button after `RESEND_SECONDS`, as on
   `app/(auth)/verify.tsx`. Errors use `authErrorMessage`: wrong or expired code (`OTP_EXPIRED`), too many tries
   (`RATE_LIMITED`), SMS not sent (`SMS_FAILED`), no connection (`NETWORK`).
4. **Delete:** `deleteAccount(code)`. **The server checks the code**, not the app: the app only sends it.
   Checking it on the device with `verifyCode` would prove nothing to the server, and would replace the session.
5. **Done:** `signOut()`. Signing in again with the same number starts onboarding as a new user.

Notes:
- If `profile.phone` is null (rows made before phone sign-in), show "Account deletion needs a phone number on
  your account" and stop. No real user should have one.
- `supabase.auth.reauthenticate()` isn't used: its code is for changing a password with `updateUser({ password, nonce })`
  **(verify in the Supabase docs)**, and there's no password here.
- With the dev test numbers the code is the fixed test code, so this works without real SMS.

- Edge Function `supabase/functions/delete-account`:
  - Check the user's sign-in token (`auth.getUser(token)`), then work out `user_type` from their `users` row.
  - **Check the code:**
    - Take the phone from the signed-in auth user, never from the request. The request carries only `{ code }`.
    - Call `verifyOtp({ phone, token: code, type: 'sms' })` with a separate client that doesn't keep the session.
    - The user it returns must be the caller.
    - On a wrong or expired code, or any mismatch, return `OTP_EXPIRED` (or `NOT_ALLOWED` for a mismatch) and
      delete nothing. A used code can't be used again.
  - **Patient (Q4, settled):** delete children first, because most foreign keys have no cascade:
    - appointment questions, appointment links and appointments
    - support persons
    - assessments, conditions and `patients`
    - `user_settings` and `users`
  - **Support person (Q5, settled):** for each `support_persons` row linked to them, do what Unpair does: mark it
    `declined`, clear `users_id` and delete its appointment links. The patient's row stays. Then delete
    `user_settings` (if any) and `users`. `declined` only exists once the support person branch adds
    `status`; before that, clearing `users_id` is enough (nothing sets it yet). Keep the check
    "accepted only with a login" in mind (`chk_support_persons_link`).
  - Then `auth.admin.deleteUser` with the service role key, which lives only in the function's secrets.
  - Do it all in one database transaction, so a failure deletes nothing: a single `plpgsql` function
    `delete_account(p_users_id int)`, executable by `service_role` only (`revoke all … from public, anon, authenticated`),
    called by the Edge Function. `096_delete_account` tests it.
- `deleteAccount(code)` in `src/services/account.ts`:
  - Checks the code is complete (`isCodeComplete`) first; an incomplete one gives `INVALID_OTP` with no call.
  - Calls `supabase.functions.invoke('delete-account', { body: { code } })`. Sends no phone and no user id.
  - Maps the function's error codes to `AppError`, so `authErrorMessage` can show them.

### 10. Before opening the PR
- `npm run lint && npm run typecheck && npm test`.
- Push, and let CI run the pgTAP files, `supabase db lint` and the generated-types check. Never run
  `supabase start`, `supabase test db` or `supabase db push` locally. A human applies migrations to shared
  databases; `deploy-db.yml` handles the hosted test database after merge.
- Commit the generated types from CI.
- Manual test on a device with the dev test numbers (dev-login accounts have no `users` row and can't reach the tabs):
  - **Patient:** edit the name and year; change notification settings, close and reopen the app; export your data; delete a test account.
  - **Support person:** edit the name; check there's no year field; export your data; delete a
    test account and check the patient's Support persons screen.
  - **Deleting an account:** a wrong code deletes nothing and says so; Resend works after the wait; the right
    code deletes the account and signs out; signing in again with that number starts onboarding.
  - **Both:** there's no Change password, email or Face ID; the phone is read-only.

## Commits
One commit per row, in order. Each one passes `npm run lint`, `npm run typecheck` and `npm test` on its own.
Commit messages are imperative with no `type:` prefix, as on the rest of the project.

**Generated types:** after each migration commit, push and let CI's "Generated types match the migrations"
check fail. Then commit the generated `src/types/database.ts` from the CI log as **"Update the generated
database types"** (rows marked "+ types"). The next service commit needs it.

### Phase 1: no database (can start now)
| # | Commit message | Contents | Waits for |
| - | -------------- | -------- | --------- |
| 1 | Remove Change password and comment out the Settings controls that do nothing yet | Patient Account: remove Change password and the password checks in `validation.ts` (with their tests); comment out Face ID. Display: text size and dark mode. Patient Settings home: the Display row. | — |
| 2 | Share the year of birth check between sign-up and Settings | `validateYearOfBirth` in `validation.ts` with tests; `toProfileArgs` uses it. | — |
| 3 | Show year of birth and phone instead of date of birth and email on the patient Account page | Year field in place of the date field; phone read-only from `useAuth().profile`; email field and its check removed; unused date code and helpers removed. Still local state. | — |

### Phase 2: profile editing
| # | Commit message | Contents | Waits for |
| - | -------------- | -------- | --------- |
| 4 | Add update_profile for patients and support persons | Migration `settings_update_profile` (function and column grants) and `093_update_profile.test.sql`. + types | — |
| 5 | Add personal details services | `getPersonalDetails` and `updateProfile` in `src/services/profile.ts`, with tests. | 4 |
| 6 | Load and save the patient's personal details | Patient Account loads, saves, calls `refreshProfile()`; loading, error and save-failure states. | 3, 5 |
| 7 | Let support persons edit their name | Support person Account: editable name, new note under the phone. | 5 |

### Phase 3: notifications
| # | Commit message | Contents | Waits for |
| - | -------------- | -------- | --------- |
| 8 | Add the user_settings table for notification choices | Migration `settings_user_settings` and `094_user_settings.test.sql`. + types | — |
| 9 | Add notification settings services | `src/services/settings.ts` with tests (defaults when there's no row). | 8 |
| 10 | Load and save notification settings | `notifications.tsx`: load, save on change and on Ok, roll back on failure. | 9 |

### Phase 4: export
| # | Commit message | Contents | Waits for |
| - | -------------- | -------- | --------- |
| 11 | Add export_my_data for patients and support persons | Migration `export_my_data` and `095_export_my_data.test.sql`. + types | — |
| 12 | Add the export my data service | `exportMyData()` in `src/services/account.ts`, with tests. | 11 |
| 13 | Export my data from Settings | Add `expo-file-system`; Legal page writes the file and opens the share sheet. | 12 |

### Phase 5: account deletion
| # | Commit message | Contents | Waits for |
| - | -------------- | -------- | --------- |
| 14 | Add delete_account for patients and support persons | Migration `delete_account` (`service_role` only) and `096_delete_account.test.sql`. + types | — |
| 15 | Add the delete-account Edge Function | `supabase/functions/delete-account`: checks the token, checks the SMS code against the account's own phone, calls `delete_account`, then `auth.admin.deleteUser`. No automated test; covered by the manual test. | 14 |
| 16 | Add the account deletion service | `deleteAccount(code)` in `src/services/account.ts`, with tests: an incomplete code makes no call; only `{ code }` is sent; each error code maps. | 15 |
| 17 | Confirm account deletion with an SMS code | Legal page: confirmation, send a code to the account's phone, code popup with Resend, then `deleteAccount(code)` and `signOut()`. | 16 |

### Phase 6: after the support person branch merges
Merge `main` in first.
| # | Commit message | Contents | Waits for |
| - | -------------- | -------- | --------- |
| 18 | Show invitation status on the patient's support persons | Step 6. | Support person branch T1.2 and T2.1 |
| 19 | Use invitation status in a support person's export and deletion | New migration replacing `export_my_data` and `delete_account` (`create or replace`): use `list_supported_patients()` and mark rows `declined`. New `097_settings_support_person_status.test.sql`. + types. **Skip** if the support person branch merged before phases 4 and 5, and write them this way from the start. | Support person branch T2.1 to T2.3 |

### Phase 7: finish
| # | Commit message | Contents | Waits for |
| - | -------------- | -------- | --------- |
| 20 | Document the settings back end | Rows for `docs/testing.md` (traceability, and "Not automated" for the Edge Function and screens); answered questions in `docs/support-person.md` section 4.4; this plan marked done. | All above |

Manual QA (step 10) goes in the PR description, not a commit.

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
| Patient Account (`settings/profile.tsx`) | **Enable FaceID** toggle | Only changes local state. No biometric login exists (needs `expo-local-authentication`). Comes back as an app lock in a future plan (Q1). |
| Display (`settings/display.tsx`) | **Text size** select | Only changes local state. Nothing reads it, and fonts come from `scaleFont` only. |
| Display (`settings/display.tsx`) | **Enable dark mode** toggle | Only changes local state. The app only uses `Colors.light`, and many colours are hardcoded. |
| Patient Settings home (`settings/index.tsx`) | **Display** row | Comment it out with the Display page, otherwise it opens a page with nothing working. |

Notes:
- **Change password and the email field are removed, not commented out** (see "Settled" and step 4).
- The support person Account page already has no Change password, email or Face ID.
- **Privacy policy and Terms** (`settings/privacy.tsx`, `settings/terms.tsx`) only say "coming soon", and nothing
  links to `terms.tsx`. Content to write, not backend work. Both apps share them.
- **Notification toggles** don't send reminders yet, but are kept because this branch saves them (step 7).
- **Export my data / Account deletion** currently do `() => undefined`. They are kept because steps 8 and 9 make them work.
