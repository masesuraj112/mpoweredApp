# Support person frontend: feature/support-person-frontend

Frontend only. Build the screens a support person sees after signing in, using placeholder data.
No Supabase calls in this branch: anything that would save or load data is marked with a TODO,
the same way the Settings frontend did it.

**Status (after merging `main`, see `docs/support-person-merge-plan.md`):**
- **Real:** the account type and name, loaded from `users` at sign-in.
- **Still placeholder:**
  - the patients, requests, appointments and appointment plans (`src/services/support-person.ts`, marked `MOCK:` like `src/services/care-planner.ts`)
  - accept, reject and unpair (in memory only)
  - the Add/View questions and answers screen
- **Why still placeholder:** nothing links a support person's account to a patient yet (`support_persons.users_id` is never set), there's no pending-request state, and `main`'s Planner data is itself placeholder data.

## Figma screens

File: [MHA platform (Copy)](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-)

| # | Screen | Node |
| - | ------ | ---- |
| 1 | Care Planner home | [3911-24607](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24607&m=dev) |
| 2 | Care Planner home, nobody supported yet | [3896-21458](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21458&m=dev) |
| 3 | Support person requests | [3911-24738](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24738&m=dev) |
| 4 | Patient's appointments (both permissions) | [3911-25095](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-25095&m=dev) |
| 5 | Patient's appointments (questions only) | [3911-24852](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24852&m=dev) |
| 6 | Settings home | [3896-21559](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21559&m=dev) |
| 7 | Account | [3896-21629](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21629&m=dev) |
| 8 | Privacy/Data and Legal | [3896-21792](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21792&m=dev) |
| 9 | People you support | [3911-24201](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24201&m=dev) |
| 10 | Manage person you support (popup) | [3911-24318](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24318&m=dev) |

## Steps

### 1. Placeholder data and types
Create `src/features/support-person/`:
- `types.ts`:
  - `SupportedPatient`: id, name, condition, `canAddQuestions`, `canAddAnswers`, appointments
  - `Appointment`: id, date and time, practitioner, health service
  - `SupportRequest`: id, patient name
- `mock-data.ts`: two patients (one with both permissions, one with questions only, matching the designs),
  each with upcoming and past appointments, and two pending requests.
  - Add a comment: `// TODO: replace with Supabase queries once the support person backend exists.`
- Keep the data in a small context or a hook (e.g. `useSupportPersonData()`), so that accepting a request
  or unpairing changes what the other screens show during testing.

### 2. Route the support person to their own app
- Add a new route group `app/(support)/` with its own `_layout.tsx`: a two-tab layout with
  **Care Planner** and **Settings**, styled like the tab bar in the designs.
  - The tab folders are `care-planner/` and `support-settings/`, not `planner/` and `settings/`.
    Expo Router throws an error when two groups contain the same path, and `(tabs)` already uses `/planner` and `/settings`.
- In `app/_layout.tsx`, add a `Stack.Protected` for `(support)`. Use the account type to decide
  whether `(tabs)` or `(support)` is shown.
- **Updated after merging `main` (see `docs/support-person-merge-plan.md`).**
  - The account type is now saved at sign-up (`users.user_type`).
  - `getProfile()` in `src/services/auth.ts` loads it with the user's name, and `AuthContext` exposes it as `profile`.
  - The root layout opens `(support)` when `profile.userType === 'support_person'`.
  - The temporary `EXPO_PUBLIC_DEV_USER_TYPE` setting and the routing in `verification-confirmation.tsx` / `dev-login.tsx` have been removed. `main`'s root layout now decides where to go after sign-in.

### 3. Shared components
Put these in `src/components/mpowered/support-person/` so both the home and appointments screens use them:
- **Initials avatar**: the purple circle with "JC" / "SH".
- **Status badge**: "Appointment upcoming" (yellow) and "No scheduled appointments" (green).
- **Permission chips**: "Add Questions" and "Add Doctor's Answer". Greyed out when the person
  doesn't have that permission.
- **Appointment card**: date and time, practitioner and health service with their icons, and one or two
  action buttons on the right.
- **Small pill button with an arrow**, used by "Add questions", "View questions" and the others.
- **Notification bell with a count badge.**
- Use colours from `src/constants/theme.ts` where they exist, rather than writing new hardcoded values.

### 4. Care Planner home (`app/(support)/care-planner/index.tsx`)
- Greeting: "Good morning / afternoon / evening, <first name>", based on the time of day.
  The name comes from the signed-in user's profile (`useAuth().profile.name`).
- The bell opens the requests screen and shows how many requests are waiting.
- "Your support makes a difference" heading and the intro text.
- **People you support** list. Each card shows:
  - the avatar, name, condition and status badge
  - the permission chips
  - the next upcoming appointment, if there is one, with "Add questions" (only if they have that permission)
  - "View more appointments", which opens the patient's appointments screen
- **Empty state** (screen 2) when they support nobody:
  - "People you support (0 people)", the explanation, and "Haven't received a request?"
  - "Check support person requests" opens the requests screen.

### 5. Support person requests (`app/(support)/care-planner/requests.tsx`)
- One card per request: "<Name> has added you as a support person", with Reject and Accept.
- Accept adds the patient to the placeholder list. Reject removes the request.
  - Both: `// TODO: save to Supabase.`
- Show an empty message when there are no requests. It isn't in the designs, so check the wording with the designer.

### 6. Patient's appointments (`app/(support)/care-planner/[patientId].tsx`)
- Header title: "<Name>'s Appointments", with the Back button.
- The patient's avatar, name and condition, plus the permission chips.
- **Upcoming appointments**: "Add questions" if allowed, "Add doctor's answer" if allowed.
- **Past appointments**: "View questions" if allowed, "View doctor's answer" if allowed.
- If the patient has no upcoming or no past appointments, hide that section or show a short message.
- **Updated (see `docs/support-person-appointments-now-plan.md`):** the buttons open the support person's own
  **appointment plan** (`appointment/[appointmentId]/index.tsx`) and **Add questions** (`appointment/[appointmentId]/questions.tsx`)
  screens. They're built from the Planner's components, so they look like the patient's "Review My Appointment Plan" and "Add Questions".
  - Answers can be edited only with "Add doctor's answers", and questions only with "Add questions".
  - Answered questions can't be removed without the answers permission.
  - Without either permission there's a "View appointment" button (SRS edge case 3.3).

### 7. Settings
- **Settings home** (`app/(support)/support-settings/index.tsx`): Account, People you support, Privacy/Data and Legal,
  and Sign out. Built as a shared `src/components/mpowered/SettingsHome.tsx` that both apps pass their own rows to.
- **Account and Privacy/Data and Legal** look the same as the patient versions, so reuse them rather than copying:
  - `app/(support)/support-settings/profile.tsx`: `export { default } from '../../(tabs)/settings/profile';`
  - Do the same for `legal.tsx` and `privacy.tsx`.
  - The patient `legal.tsx` now opens `./privacy` (a relative link), so each app opens its own privacy page.
- **Settings `_layout.tsx`**: reuse the same Back / "Settings" header as `app/(tabs)/settings/_layout.tsx`.
  Done in step 6: it is now `src/components/mpowered/BackHeader.tsx` (takes a `title`), also used by the appointments screen.
- **People you support** (`app/(support)/support-settings/people-you-support.tsx`):
  - "Manage people you support" and one `SettingsOption` per patient.
  - Tapping one opens a `SettingsModal` titled "Manage person you support":
    - The name, read-only.
    - "Your access permissions": both permissions shown read-only. Only the patient can change them,
      and the database already blocks support persons from changing their own `access_type`.
      Each row shows "Allowed" / "Not allowed" (new `SettingsModalInfoRow`). Check with the designer how a missing permission should look.
    - "Unpair from <first name>" as a destructive `SettingsModalActionRow` (with the unlink icon),
      using the same confirmation `Alert` as "Revoke all access".
  - Unpair removes them from the placeholder list: `// TODO: save to Supabase.`

### 8. Before opening the PR
- `npm run lint && npm run typecheck && npm test`
- **Getting into the support person app.** It opens for accounts saved as `support_person`. Locally:
  1. Run local Supabase. If it was started before the latest migrations, run `supabase db reset` so `users.user_type` exists; otherwise every sign-in shows "We could not load your account".
  2. In onboarding choose **Support person**, and sign up with the test number **0491 570 007** (code `123456`).
  3. For a patient account alongside it, use **0491 570 006** (same code).
  4. With `EXPO_PUBLIC_BYPASS_AUTH=false`, restart with `npx expo start --clear` after changing `.env`.
- **Quick look without an account:** set `EXPO_PUBLIC_BYPASS_AUTH=true` and go to `/care-planner`. The greeting has no name, because nobody is signed in.
- Manual test as a support person:
  - Home with patients, and the empty home (clear the placeholder list).
  - The greeting shows the name entered at sign-up.
  - Accept and reject requests, and check the home updates.
  - Open both patients' appointment screens, and check the buttons match their permissions.
  - **Jane (questions only):**
    - "Add questions" saves.
    - Unticking an answered question on a past appointment is blocked with a message.
    - The plan shows answers with no pen.
  - **Steven (both):**
    - "View doctor's answer" lets you edit answers.
    - "Modify questions" works.
    - Unticking an answered question asks first.
  - **Tom (answers only, accept his request first):** "Add doctor's answer" opens the answer box, and there's no "Modify questions".
  - The patient's own Planner doesn't show these changes yet: the two use separate placeholder data until the backend exists.
  - Settings: every row opens, unpair works, and sign out returns to the sign-in screens.
- Manual test as a patient: the patient app is unchanged, including Settings → Sign out.
- Check on a small phone and a large phone (the screens use `scaleWidth` / `scaleHeight`).

## Questions to confirm with the team

| Who | Question |
| --- | -------- |
| Designer | The "Manage person you support" popup (3911-24318) shows the patient's four tabs, not the support person's two. Which is right? |
| Designer | That popup says "Stevie Nicks" while the list says "Steven Harper". Placeholder mix-up? |
| Designer | How does a permission the support person doesn't have look in that popup? |
| Designer | What does the requests screen show when there are no requests? (Currently: "You don’t have any support person requests right now.") |
| Designer | The requests screen has no Back button, unlike the appointments screen. Should it have one? (Currently: swipe back, Android back, or tap the Care Planner tab.) |
| Designer | Are there designs for "Add questions" / "View doctor's answer" from a support person's view? |
| Sign-up owner | ~~Do support persons go through the same onboarding questions as patients?~~ **Answered:** no. `consent.tsx` sends support persons straight to `login-bridge`, skipping sex, year of birth and conditions. |
| Sign-up owner | ~~Where will the account type be saved?~~ **Answered:** `users.user_type` (`'patient'` / `'support_person'`), saved by `create_profile`. Now used to choose the app. |
| Planner owner | Will the support person reuse the Planner's question and answer screens, or get their own? |
| Backend | Requests need a "pending" state on `support_persons` (accepted or not). Who adds it? This also changes the patient's "Add support person" flow in Settings. The login teammate's handover note lists the related gaps (linking `users_id`, `email` NOT NULL, `access_type` values, privileges). See "Still open" in `docs/support-person-merge-plan.md`. |
