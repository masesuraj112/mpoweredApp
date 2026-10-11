# Settings backend: feature/settings-backend

Steps to connect the Settings screens to Supabase, and the controls to comment out because
they do nothing in this branch.

## Already working
- Change password (`app/(tabs)/settings/profile.tsx`): checks the old password, then calls `supabase.auth.updateUser`.
- Sign out (`settings/index.tsx`, `settings/profile.tsx`).

## Blocker: no `users` / `patients` rows are created at sign-up
Onboarding collects the name, sex, year of birth and conditions in `src/context/Onboarding-Context.tsx`
but never saves them. Nothing (code or database trigger) inserts a `public.users` or `public.patients` row.
Settings needs both:
- the name is stored in `users`
- the year of birth is stored in `patients`
- every support person row needs a `patient_id`

Agree with the team who fixes this. If it's this branch, add step 0:

0. After sign-up finishes, insert `users` (`auth_id`, `name`) and `patients` (`users_id`, `sex`, `year_of_birth`,
   `other_conditions`) from the onboarding data. Watch out: `patients.sex` is NOT NULL, and onboarding
   allows "prefer not to say" or null.

## Steps

### 1. Database migration
Add a new migration (never edit an old one):
- **Table grants:** RLS rules exist, but `authenticated` only has SELECT on `users` and `patients`, and nothing on `support_persons`.
  - `grant update (name) on public.users to authenticated;`
  - `grant update (year_of_birth) on public.patients to authenticated;`
  - `grant select, insert, update, delete on public.support_persons to authenticated;`
- **`support_persons` contact fields:** make `phone_number` and `email` nullable, and add
  `check (phone_number is not null or email is not null)`. The screen allows either one.
- **`support_persons.access_type` format:** agree on one. `is_support_person_for_patient` checks it with
  `LIKE '%<access>%'`, so use distinct tokens, e.g. `''`, `'questions'`, `'answers'`, `'questions,answers'`.
  - Optional: add a check constraint that limits it to those values.
- **New table `user_settings`**, one row per user:
  - `users_id` (primary key, references `users`)
  - `assessment_reminders` bool, `assessment_every` int (1–7), `assessment_unit` text (`days`|`weeks`)
  - `appointment_reminders` bool, `appointment_day_before` bool, `appointment_on_day` bool
  - Defaults must match the screen: off, every 3 days, off, off, off.
  - Enable RLS. Add select/insert/update rules using `users_id = public.current_users_id()`, and grant `select, insert, update`.
- Regenerate types: `supabase gen types typescript --local > src/types/database.ts`.

### 2. Database tests (`supabase/tests/database/`)
- `040_settings_privileges.test.sql`: the new grants exist.
- `045_support_persons_rls.test.sql`:
  - The patient can add, read, edit and delete their own support persons.
  - Another user can't see them.
  - The contact check rejects a row with neither phone nor email.
  - A support person can't change their own `access_type` (an existing trigger enforces this).
- `050_user_settings_rls.test.sql`: users only see and change their own row.

### 3. Data access functions
Follow `src/services/assessments.ts`:
- Return `Result<T>` (`src/lib/result.ts`) and turn errors into messages with `mapError` (`src/lib/errors.ts`). Never throw.
- Accept the client as the last optional argument (`client: Client = supabase`).
- Look up the user by `auth_id`, as `getUserStartWeek` does.

Files:
- `src/services/profile.ts`: `getProfile()` returns { name, yearOfBirth, email }; `updateProfile({ name, yearOfBirth })`; `updateEmail(email)` uses `supabase.auth.updateUser({ email })`.
- `src/services/contacts.ts` (currently empty): `listSupportPersons()`, `addSupportPerson()`, `updateSupportPerson()`, `removeSupportPerson()`.
  - Turn the two toggles into `access_type` and back.
  - Save phone numbers with `normalisePhone` (`src/services/validation.ts`).
- `src/services/settings.ts`: `getNotificationSettings()` returns the defaults when there's no row; `saveNotificationSettings()` creates or updates the row.
- Jest tests next to each file, with a fake client like `src/services/assessments.test.ts`.
  - Start each test file with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))`.
  - Add the new files to `collectCoverageFrom` in `jest.config.js`.

### 4. Account → Personal details (`app/(tabs)/settings/profile.tsx`)
- Load the profile when the screen opens, and remove the hardcoded "Sarah McLachlan" values. Show a loading state and an error state.
- Replace the date field (`SettingsModalDateField`) with a 4-digit year field (`SettingsModalField`, `keyboardType="number-pad"`, `maxLength={4}`).
  - Keep it optional, as in sign-up.
  - Allow years from 1900 to the current year. Add a `validateYearOfBirth` function to `src/services/validation.ts` and test it in `__tests__/validation.test.ts`.
- Remove the date of birth handling that's no longer needed (`parseIsoDate`, `isFutureDate` and the date state). If `SettingsModalDateField` and the date helpers in `src/services/date.ts` aren't used anywhere else, delete them.
- On Ok:
  - Save the name and year.
  - Only if the email changed, call `updateEmail` and say "Check your inbox to confirm your new email". Keep showing the old email until it's confirmed.
  - Keep the popup open with the error message if the save fails.

### 5. Support persons (`app/(tabs)/settings/support-persons.tsx`)
- Load the list, and remove `INITIAL_PEOPLE`.
- Change `id` to the `support_person_id` number. A new person has no id until the insert returns one; this replaces the `new-${Date.now()}` trick.
- In `save()`: add the person if new, otherwise update them. Only change the list once the save succeeds.
- "Revoke all access" deletes the row, then removes it from the list.
- Show an empty state when the list has no one (`src/components/ui/EmptyState.tsx`).

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
  - Then call `auth.admin.deleteUser` with the service role key, which lives only in the function's secrets.
- App:
  - Show a destructive confirmation (`Alert`, as "Revoke all access" does). Ideally make the user type DELETE or re-enter their password.
  - Call the function, then `supabase.auth.signOut()`.

### 9. Before opening the PR
- `npm run lint && npm run typecheck && npm test`
- `supabase db reset && supabase test db`
- Check the generated types are committed. CI compares them with the migrations.
- Manual test on a device:
  - Edit the name, year and email.
  - Add, edit and remove a support person.
  - Change the notification settings, close the app and reopen it.
  - Export your data.
  - Delete a test account.

## Controls to comment out (no function in this branch)

| Screen | Control | Why it does nothing |
| ------ | ------- | ------------------- |
| Account (`settings/profile.tsx`) | **Enable FaceID** toggle | Only changes local state. No biometric login exists (needs `expo-local-authentication`). |
| Display (`settings/display.tsx`) | **Text size** select | Only changes local state. Nothing reads it, and fonts come from `scaleFont` only. |
| Display (`settings/display.tsx`) | **Enable dark mode** toggle | Only changes local state. The app only uses `Colors.light`, and many colours are hardcoded. |
| Settings home (`settings/index.tsx`) | **Display** row | Comment it out with the Display page, otherwise it opens a page with nothing working. |

Notes:
- **Privacy policy and Terms** (`settings/privacy.tsx`, `settings/terms.tsx`) only say "coming soon". Nothing links to `terms.tsx`, because "View PP and T&Cs" opens `privacy.tsx` only. These are content to write, not backend work. Leave them or hide them as the team prefers.
- **Notification toggles** don't send reminders yet, but they are kept because this branch saves them (step 6).
- **Export my data / Account deletion** currently do `() => undefined`. They are kept because steps 7 and 8 make them work.
