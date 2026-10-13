# Support person frontend: feature/support-person-frontend

Frontend only. Build the screens a support person sees after signing in, using placeholder data.
No Supabase calls in this branch: anything that would save or load data is marked with a TODO,
the same way the Settings frontend did it.

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
- The account type isn't saved anywhere yet. `user-type.tsx` stores it only in memory
  (`Onboarding-Context`). For this branch:
  - Add a dev setting, e.g. `EXPO_PUBLIC_DEV_USER_TYPE=support-person` in `.env`, like the existing
    `EXPO_PUBLIC_BYPASS_AUTH`, and document it in `.env.example`.
  - `// TODO: read the account type from Supabase once it's saved at sign-up.`
- `verification-confirmation.tsx` always sends the user to `/(tabs)/home`. Send support persons to the
  `(support)` home instead, based on the onboarding user type.

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
  Use a placeholder name: `// TODO: load the name from the profile.`
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
- The four action buttons open placeholder screens for now. The Planner's `questions.tsx` and `answer.tsx`
  are still "coming soon" placeholders as well.
  - `// TODO: link to the real question and answer screens once the Planner builds them.`

### 7. Settings
- **Settings home** (`app/(support)/support-settings/index.tsx`): Account, People you support, Privacy/Data and Legal,
  and Sign out. Copy the layout of `app/(tabs)/settings/index.tsx`, with only these rows.
- **Account and Privacy/Data and Legal** look the same as the patient versions, so reuse them rather than copying:
  - `app/(support)/support-settings/profile.tsx`: `export { default } from '../../(tabs)/settings/profile';`
  - Do the same for `legal.tsx` and `privacy.tsx`.
- **Settings `_layout.tsx`**: reuse the same Back / "Settings" header as `app/(tabs)/settings/_layout.tsx`.
  Move `SettingsHeader` into `src/components/mpowered/` so both layouts can import it.
- **People you support** (`app/(support)/support-settings/support-persons.tsx`):
  - "Manage people you support" and one `SettingsOption` per patient.
  - Tapping one opens a `SettingsModal` titled "Manage person you support":
    - The name, read-only.
    - "Your access permissions": both permissions shown read-only. Only the patient can change them,
      and the database already blocks support persons from changing their own `access_type`.
      Check with the designer how a missing permission should look.
    - "Unpair from <first name>" as a destructive `SettingsModalActionRow` (with the unlink icon),
      using the same confirmation `Alert` as "Revoke all access".
  - Unpair removes them from the placeholder list: `// TODO: save to Supabase.`

### 8. Before opening the PR
- `npm run lint && npm run typecheck && npm test`
- Manual test with `EXPO_PUBLIC_DEV_USER_TYPE=support-person`:
  - Home with patients, and the empty home (clear the placeholder list).
  - Accept and reject requests, and check the home updates.
  - Open both patients' appointment screens, and check the buttons match their permissions.
  - Settings: every row opens, unpair works, and sign out works.
- Manual test with the setting removed: the patient app is unchanged.
- Check on a small phone and a large phone (the screens use `scaleWidth` / `scaleHeight`).

## Questions to confirm with the team

| Who | Question |
| --- | -------- |
| Designer | The "Manage person you support" popup (3911-24318) shows the patient's four tabs, not the support person's two. Which is right? |
| Designer | That popup says "Stevie Nicks" while the list says "Steven Harper". Placeholder mix-up? |
| Designer | How does a permission the support person doesn't have look in that popup? |
| Designer | What does the requests screen show when there are no requests? |
| Designer | Are there designs for "Add questions" / "View doctor's answer" from a support person's view? |
| Sign-up owner | Do support persons go through the same onboarding questions as patients (sex, year of birth, health conditions)? At the moment `user-type.tsx` leads into all of them. |
| Sign-up owner | Where will the account type be saved, so the app can pick `(tabs)` or `(support)` after login? |
| Planner owner | Will the support person reuse the Planner's question and answer screens, or get their own? |
| Backend | Requests need a "pending" state on `support_persons` (accepted or not). Who adds it? This also changes the patient's "Add support person" flow in Settings. |
