# Support person: where it stands and what's next

Branch: `feature/support-person-frontend`. Last updated: 24 Oct 2026.

This is the one place for the support person feature: what has been built, how to test it, and what
comes next. The earlier step-by-step plans have all been completed and removed; their history is at
the end (section 7).

## 1. Summary

- **Built:** a separate app for support persons (two tabs: Care Planner and Settings). It covers the people they support, requests from patients, each patient's appointments, the appointment plan (questions and doctor's answers) and Add questions. Each patient's permissions decide what the support person can change.
- **Real data:** whether someone is a support person, and their name, come from Supabase (`users.user_type`, `users.name`).
- **Placeholder data:** everything else (patients, requests, appointments, plans) comes from `src/services/support-person.ts`, marked `MOCK:`, the same way the Planner uses `src/services/care-planner.ts`. The screens, hooks and permission rules are final. Only the inside of that service changes once the backend exists.
- **Next:**
  1. The backend prerequisites (section 4.1), owned by the backend team.
  2. Then replace the placeholder service, function by function (section 4.2).
  3. Settle the open questions (section 4.4) along the way.

## 2. What's built

### 2.1 How a support person gets their own app
1. In onboarding they choose **Support person**. `consent.tsx` skips the patient-only questions (sex, year of birth, conditions).
2. `create_profile` saves a `users` row with `user_type = 'support_person'`. There's no `patients` row.
3. At sign-in, `getProfile()` (`src/services/auth.ts`) loads `user_type` and `name`, filtered by `auth_id`. It must be filtered, because `users_select` also returns a patient's row to their support persons.
4. `AuthContext` exposes this as `profile`. `hasProfile` works exactly as before.
5. `app/_layout.tsx` opens `(support)` when `profile.userType === 'support_person'`, and `(tabs)` otherwise. Support persons must never reach `(tabs)`, because patient screens expect a `patients` row.

⚠️ **This only stops the *app* showing patient features.** The database doesn't check `user_type`, so a support
person could still call patient APIs directly (backend gap B4).

### 2.2 Screens

| Screen | File (`app/(support)/…`) | Figma | Notes |
| --- | --- | --- | --- |
| Tab bar | `_layout.tsx` | [3911-24710](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24710&m=dev) | Folders are `care-planner/` and `support-settings/`, because `(tabs)` already has `/planner` and `/settings`, and Expo Router doesn't allow the same path twice |
| Care Planner home | `care-planner/index.tsx` | [3911-24607](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24607&m=dev), empty [3896-21458](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21458&m=dev) | Greeting with the real name, request bell, one card per patient |
| Support person requests | `care-planner/requests.tsx` | [3911-24738](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24738&m=dev) | Accept, or Reject with confirmation |
| A patient's appointments | `care-planner/[patientId].tsx` | [3911-25095](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-25095&m=dev), [3911-24852](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24852&m=dev) | Upcoming and past, with buttons based on permissions |
| Appointment plan | `care-planner/appointment/[appointmentId]/index.tsx` | No design: matches the patient's "Review My Appointment Plan" | Overview, questions, answers. Recording consent is shown read-only |
| Add questions | `care-planner/appointment/[appointmentId]/questions.tsx` | No design: matches the patient's "Add Questions" | Only with the questions permission |
| Settings home | `support-settings/index.tsx` | [3896-21559](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21559&m=dev) | Shared `SettingsHome` with support person rows |
| Account, Privacy/Data and Legal, Privacy | `support-settings/profile.tsx`, `legal.tsx`, `privacy.tsx` | [3896-21629](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21629&m=dev), [3896-21792](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21792&m=dev) | One-line re-exports of the patient screens |
| People you support (with the Unpair popup) | `support-settings/people-you-support.tsx` | [3911-24201](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24201&m=dev), [3911-24318](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3911-24318&m=dev) | Permissions shown read-only, and Unpair with confirmation |

Every screen that loads data has loading and error states. Accept, reject, unpair, and saving answers
or questions only change the screen once the save has worked. Otherwise an error shows and nothing changes.

### 2.3 Permissions

| Patient gave | Buttons on appointments | View plan | Change questions | Change answers |
| --- | --- | --- | --- | --- |
| Nothing | "View appointment" (SRS edge case 3.3) | ✅ | ❌ | ❌ |
| Add questions | Add / View questions | ✅ | ✅ (but can't untick an answered question) | ❌ |
| Add doctor's answers | Add / View doctor's answer | ✅ | ❌ | ✅ |
| Both | Both | ✅ | ✅ (unticking an answered question asks first) | ✅ |

The rules are in two places in `src/features/support-person/permissions.ts`, both tested:
- `getAppointmentActions()` decides which buttons show.
- `getPlanAccess()` decides what can be changed on the plan.

The placeholder service also refuses changes that aren't allowed, as the database should (gap P5).

### 2.4 Code map

| Area | Where |
| --- | --- |
| Types (`SupportedPatient`, `SupportRequest`; `Appointment` is the Planner's) | `src/features/support-person/types.ts` |
| Placeholder service and data | `src/services/support-person.ts` (+ `.test.ts`) |
| Store for patients and requests (loading, error, reload, accept, reject, unpair) | `src/features/support-person/context.tsx` (+ test) |
| Plan and questions hooks | `useSupportedAppointmentPlan.ts`, `useSupportedAppointmentQuestions.ts` (+ test) |
| Pure helpers (upcoming/past, dates, initials, greeting, permissions) | `appointments.ts`, `greeting.ts`, `permissions.ts` (all tested) |
| Button navigation | `src/features/support-person/navigation.ts` |
| Support person components | `src/components/mpowered/support-person/` |
| Reused from the Planner, unchanged | `AppointmentOverviewCard`, `QuestionGroupList`, `AnswerModal`, `QuestionSuggestionGroup`, `QuestionHintBanner`, `PlannerFlowScreen`, `useAsyncResult`, `useConfirmDiscard`, selection and display helpers |

**Shared or patient files this branch changed.** The patient app should look and work the same:
- `SettingsHome.tsx` (new, used by both Settings homes) and `BackHeader.tsx` (new, used by the Settings layouts)
- `app/(tabs)/settings/legal.tsx`: the privacy link is relative (`./privacy`), so each app opens its own privacy page
- `SettingsModal.tsx`: new `SettingsModalInfoRow`, and `onChangeText` is optional
- `src/constants/theme.ts`: added `surfaceContainer`
- `src/services/auth.ts`: added `getProfile()`; `hasProfile()` is unchanged
- `src/context/AuthContext.tsx`: exposes `profile`
- `app/_layout.tsx`: the `(support)` group
- `supabase/config.toml`: a second local test number

### 2.5 Placeholder data (in `src/services/support-person.ts`)

| Person | Permissions | Appointments (ids) | Use it to test |
| --- | --- | --- | --- |
| Jane Cooper | Questions only | 101 upcoming, 102 to 104 past | Blocked unticking of answered questions, answers with no pen |
| Steven Harper | Both | 111 to 113 past | Editing answers, "Modify questions", confirm before unticking |
| Maria Lopez (request) | Both | 121 upcoming, 122 past | Accepting adds a card with an upcoming appointment |
| Tom Nguyen (request) | Answers only | 131 upcoming | "Add doctor's answer" without "Modify questions" |

Past placeholder appointments start with answers to questions 1 and 5, and with recording consent. Ids
start at 101 so they can't be confused with the Planner's sample appointments (1, 2). The support
person data and the Planner's are **separate**, so changes in one don't show in the other until both read Supabase.

## 3. Running and testing

**Checks:** `npm run lint && npx tsc --noEmit && npm test`

**Signing in as a support person (local Supabase):**
1. Run local Supabase. If it was started before 14 Oct migrations, run `supabase db reset`. Without `users.user_type`, every sign-in shows "We could not load your account".
2. In onboarding choose **Support person**, and sign up with **0491 570 007**, code `123456`.
3. For a patient account alongside it, use **0491 570 006** (same code).
4. Set `EXPO_PUBLIC_BYPASS_AUTH=false`, and restart with `npx expo start --clear` after any `.env` change.

**Quick look without an account:** set `EXPO_PUBLIC_BYPASS_AUTH=true` and open `/care-planner`. The greeting has no
name, and sign-out doesn't move you anywhere, because bypass keeps every screen open.

**Things that look broken but aren't:**
- **Type errors on routes that exist:** `.expo/types/router.d.ts` is stale. Run `npx expo start` once to regenerate it.
- **`/dev-login` accounts stay on the sign-in screens:** they have no profile row. This is the same on `main`.

**Manual test checklist:**
- **Home:**
  - patient cards and the request bell
  - the greeting shows the name from sign-up
  - the "(0 people)" empty state, by unpairing everyone
- **Requests:** accept Maria (her card appears), reject Tom with the confirmation, and see the empty message.
- **Appointments:**
  - Jane: one upcoming, three past, questions buttons only
  - Steven: no upcoming, both kinds of button
- **Plan screen:**
  - Jane: answers have no pen; "Add questions" saves; unticking question 1 on a past appointment is blocked with a message
  - Steven: answers can be edited; "Modify questions" works; unticking an answered question asks first
  - Tom (after accepting): "Add doctor's answer" opens the answer box, and there's no "Modify questions"
  - the plan updates after coming back from Add questions
- **Settings:**
  - every row opens
  - Unpair (popup, confirmation, the patient disappears from the home)
  - Sign out returns to the sign-in screens
- **Patient app:** unchanged, including Settings → Sign out.
- **Phones:** check a small and a large one. The screens use `scaleWidth` / `scaleHeight`.

## 4. What's next

### 4.1 Backend prerequisites (backend team)

Points marked "B" come from the login teammate's handover note, *"Support person: what's already done on `feature/onboarding-login-backend`"*.

| # | Needed | Why it blocks the frontend | Today |
| --- | --- | --- | --- |
| P1 | The Planner's appointment service reads and writes Supabase | The support person plan functions will call it | `src/services/care-planner.ts` is placeholder data |
| P2 | Link support persons to patients: set `support_persons.users_id`, add a pending/accepted state (B1) | Patients, requests, accept and reject | Nothing sets `users_id`. Matching by phone is likely, but `phone_number` isn't unique |
| P3 | Define the `access_type` values (B7) | Converting to `canAddQuestions` / `canAddAnswers` | Free text. `is_support_person_for_patient` matches with `LIKE '%…%'` |
| P4 | Privileges on `support_persons` (B6) | The app can't read the table | `authenticated` has none |
| P5 | Database rules check permissions for questions and answers | Otherwise only the app enforces them | `appointment_questions` rules use `can_access_patient(patient_id)` without a required access level, so any linked support person can change questions and answers |
| P6 | Where suggested questions come from for a support person | The Add questions screen | Placeholder data. Recommended: generate them on the server and store them with the appointment, rather than letting support persons read the patient's assessments |
| B2 | `support_persons.email` is NOT NULL | Support persons sign up with phone and name only | Make it nullable |
| B4 | Database checks on `user_type` for patient-only features | The app guards them, but direct API calls aren't blocked | No checks |
| B5 | pgTAP tests: support person access, the `support_persons` table, and each permission | Proves P2 to P5 | None |
| — | What unpairing does to `appointment_has_support_persons` links | No foreign key has `ON DELETE CASCADE`, so deleting a linked support person fails | Decide: delete the links first, or block it |

### 4.2 Frontend once the backend is ready

A new branch from `main`, after this one merges. Small commits, each passing lint, type check and tests:

1. **`access_type` conversion:** one tested function from the stored value to `canAddQuestions` / `canAddAnswers` (needs P3).
2. **`listSupportedPatients()` reads Supabase:** accepted `support_persons` rows where `users_id` is the signed-in user, plus each patient's name (`users`), condition (`patient_musko_skeletal_pain`) and **saved** appointments (needs P1, P2, P4). Choose between a joined query or a separate `listPatientAppointments(patientId)`; the screens work either way. Tests with a fake client, like the other service tests.
3. **Requests read Supabase:** `listSupportRequests()`, `acceptSupportRequest()`, `rejectSupportRequest()` (needs P2).
4. **`unpairFromPatient()` reads Supabase,** after deciding what happens to appointment links (last row of 4.1).
5. **Plan functions call the Planner's real functions:**
   - `getSupportedAppointmentPlan()` calls `getAppointmentPlan()`
   - `saveSupportedAnswers()` calls `saveAnswers()`
   - `getSupportedQuestionSuggestions()` calls `getQuestionSuggestions()`
   - `saveSupportedQuestions()` calls `saveAppointmentQuestions()`

   Needs P1 and P6. The database rules decide who can read an appointment. Writes must be refused by the database (P5).
6. **Keep the error codes the screens already handle:**
   - `NOT_ALLOWED` with `NO_QUESTIONS_PERMISSION` / `NO_ANSWERS_PERMISSION`
   - `UNKNOWN` with `APPOINTMENT_NOT_FOUND`, `REQUEST_NOT_FOUND`, `PATIENT_NOT_FOUND`

   Or update the screens' messages in the same commit.
7. **Delete the placeholder:** `MOCK_*` data, `resetMockSupportPerson()`, `resetMockSupportedPlans()`, and the placeholder parts of `support-person.test.ts`.
8. **Optional, with the Planner owner:** merge `useSupportedAppointmentPlan` / `useSupportedAppointmentQuestions` with the Planner's `useAppointmentPlan` / `useAppointmentQuestions`, now that both read the same data.
9. **Test by hand with two real accounts** (patient and support person), every permission combination. Check that the patient sees questions and answers added by the support person.

### 4.3 Decisions made while building (revisit when the team answers)

| Question | Built as | Where to change it |
| --- | --- | --- |
| Can a support person collect recording consent? | No, it's shown as a status line | `appointment/[appointmentId]/index.tsx` |
| Answers on past appointments? | Yes, with the answers permission (answers are often typed up later) | `getPlanAccess()` |
| Can support persons type their own questions? | No, suggested questions only | Not built |
| Layout of the support person's plan and question screens | Same as the patient's | The two screens under `appointment/[appointmentId]/` |
| No permissions at all | "View appointment" opens the plan read-only | `getAppointmentActions()` |
| Permissions in "People you support" | Each shows "Allowed" / "Not allowed" | `people-you-support.tsx` |
| Empty requests wording | "You don't have any support person requests right now." | `requests.tsx` |

### 4.4 Open questions

| Who | Question |
| --- | --- |
| Designer | Can a support person collect recording consent (they may be the one at the appointment)? |
| Designer | Can support persons type their own questions as well as choosing suggested ones? |
| Designer | Designs for the support person's plan and Add questions screens, or keep the patient's layout? |
| Designer | The "Manage person you support" popup (3911-24318) shows the patient's four tabs, and says "Stevie Nicks" while the list says "Steven Harper". Placeholder mix-ups? |
| Designer | How should a missing permission look in that popup? |
| Designer | Wording for the empty requests screen? Should the requests screen have a Back button? (Today: swipe back, Android back, or the Care Planner tab) |
| Designer | The cards' "Tuesday, 10 June 2026" is wrong (it's a Wednesday). The app works the day out itself |
| Product / team | There are no user stories from the support person's point of view: accepting or rejecting requests, unpairing, viewing the people you support and their appointments. Add a support person epic (e.g. *"As a support person, I want to accept or decline a patient's request so that I only see the care of people I've agreed to support."*) |
| Backend | P2 to P6, and B2, B4, B5 above |
| Planner owner | OK to merge the two support person hooks with yours later (4.2 step 8)? Tell us before changing the props of `AnswerModal`, `QuestionGroupList` or `QuestionSuggestionGroup`, because the support person screens use them |

## 5. Risks and things to watch

- **Permissions are enforced by the app only until P5.** Say so in the PR. Every rule is in `permissions.ts`, so it's easy to review.
- **Removing a question deletes its answer.** The app blocks this for support persons without the answers permission, and the placeholder service refuses it. The database must too (P5).
- **The patient and support person can change the same plan.** Last save wins. The plan screen refreshes when you return to it, and `AnswerModal` only saves the answers changed in that session. Whether stale saves should fail is a backend question.
- **Merge conflicts for other branches** that edit the patient Settings home (now `SettingsHome`), the root layout, or `AuthContext`.
- **Local databases without the 14 Oct migrations** show "We could not load your account" for every user. Run `supabase db reset`. The hosted test database gets migrations automatically (`deploy-db.yml`).

## 6. Known issues outside this branch

- **`.prettierrc.json` is saved in UTF-16,** so Prettier fails for everyone ("not valid JSON"). It's a one-line fix (save as UTF-8), better done in its own `chore/` PR.
- **`npm run lint` shows 21 warnings, all in files this branch doesn't touch.**
- **Paused branch:** `feature/settings-backend` (patient Settings backend) shares open questions with this work: the `access_type` format, `support_persons.email`, and appointment links on delete.

## 7. History

| When | What | Commits |
| --- | --- | --- |
| 11 to 13 Oct | Frontend on placeholder data: data and types, routing, components, home, requests, appointments, Settings | `469f92a` to `d12ad79` |
| 15 Oct | Merged `main` | `8b199b2` |
| 24 Oct | Merged `main` again. Replaced the dev setting (`EXPO_PUBLIC_DEV_USER_TYPE`) with the saved `user_type`, added `getProfile()`, the real name greeting, the second test number, and theme tokens | `0feef11` to `4283a18` (merge `3b37c96`) |
| 24 Oct | Appointment plan and Add questions screens, the placeholder service, loading and error states, permission rules. Removed the "coming soon" screen | `9cdbbd0` to `18c4c31` |

The removed plan files (`support-person-frontend.md`, `support-person-merge-plan.md`,
`support-person-appointments-now-plan.md`, `support-person-appointments-plan.md`) are still in the git history
of those commits, if the detailed reasoning is ever needed.
