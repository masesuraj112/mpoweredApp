# Support person: where it stands and what's next

Branches: `feature/support-person-frontend` (merged) and `feature/support-person-backend`. Last updated: 30 Oct 2026.

This is the one place for the support person feature: what has been built, how to test it, and what
comes next. The earlier step-by-step plans have all been completed and removed; their history is at
the end (section 7).

## 1. Summary

- **Built:** a separate app for support persons (two tabs: Care Planner and Settings). It covers the people they support, requests from patients, each patient's appointments, the appointment plan (questions and doctor's answers) and Add questions. Each patient's permissions decide what the support person can change.
- **Real data:** everything. `src/services/support-person.ts` calls the support person database functions
  (`docs/backend/support-person-backend-build-plan.md`): invitations, accept / reject / unpair, the patients
  supported, the appointments the patient **added them to**, and adding questions or doctor's answers within the
  access each patient gave. The database enforces every permission; the app only decides what to offer.
- **Next:** merge the back-end pull request, push its migrations to the dev project (`supabase db push --include-all`,
  by a person), then the two-account manual test (plan step T7).

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
| Account | `support-settings/profile.tsx` | [3896-21629](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21629&m=dev) | Its own page: Personal details (name editable since the Settings back end, phone read-only) and Sign out. No Change password or FaceID, because support persons sign in by SMS (section 4.2a) |
| Privacy/Data and Legal, Privacy | `support-settings/legal.tsx`, `privacy.tsx` | [3896-21792](https://www.figma.com/design/cpKssx0T2KuOeNoTh7YmKU/MHA-platform--Copy-?node-id=3896-21792&m=dev) | One-line re-exports of the patient screens |
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

The rules are in `src/features/support-person/permissions.ts`, all tested:
- `getAppointmentActions()` decides which buttons show.
- `getPlanAccess()` decides what can be changed on the plan.
- `canAnswerNow()`: answers also wait for the patient to record the doctor's consent (decision S3).
- `isAccessChanged()`: a save refused because the patient changed the access reloads the patient list.

The database enforces the same rules (`save_supported_questions`, `save_supported_answers`), so a
support person can't get round them by calling the API directly. They see only the appointments the
patient added them to (decision S2).

### 2.4 Code map

| Area | Where |
| --- | --- |
| Types (`SupportedPatient`, `SupportRequest`; `Appointment` is the Planner's) | `src/features/support-person/types.ts` |
| Service (the support person database functions) and row mappers | `src/services/support-person.ts`, `src/features/support-person/mappers.ts` (both tested) |
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
- `src/services/auth.ts`: added `getProfile()` (type, name and phone number); `hasProfile()` is unchanged
- `src/context/AuthContext.tsx`: exposes `profile`
- `app/_layout.tsx`: the `(support)` group
- `supabase/config.toml`: a second local test number

### 2.5 Test data

The placeholder data (Jane Cooper, Steven Harper, and the sample requests) is gone. Test with two real
accounts on the dev project: a patient on `0491 570 006` and a support person on `0491 570 007`. The patient adds
the support person's number, creates and saves an appointment with them on it, and the support person accepts the
request. See step T7 of the back-end plan for the full list.

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
  - Account → Personal details shows the name and phone number from sign-up, and there's no Change password or FaceID
  - Unpair (popup, confirmation, the patient disappears from the home)
  - Sign out returns to the sign-in screens
- **Patient app:** unchanged, including Settings → Sign out.
- **Phones:** check a small and a large one. The screens use `scaleWidth` / `scaleHeight`.

## 4. What's next

### 4.1 Backend prerequisites ✅ done

Points marked "B" come from the login teammate's handover note. Built by the Care Planner back end and the
support person back end (`docs/backend/support-person-backend-build-plan.md`, migrations A9–A11).

| # | Needed | How it was done |
| --- | --- | --- |
| P1 | The Planner's appointment service reads and writes Supabase | Care Planner back end (`src/services/care-planner.ts`) |
| P2 | Link support persons to patients, with a pending/accepted state (B1) | A9 adds `status` (`pending` / `accepted` / `declined`). A support person sees invitations sent to their verified phone number (`list_my_support_requests`), and accepting sets `users_id` (`accept_support_request`) |
| P3 | Define the `access_type` values (B7) | `none`, `questions`, `answers`, `questions,answers`, enforced by a check constraint; `accessType.ts` converts them. A11 matches whole tokens, not `LIKE` |
| P4 | Privileges on `support_persons` (B6) | Explicit grants (Care Planner). A10 then limits the table to the owning patient; support persons use the A11 functions |
| P5 | Database rules check permissions for questions and answers | A11's `save_supported_questions` and `save_supported_answers` check the access token, consent and the appointment link. A10 closes every direct write |
| P6 | Where suggested questions come from for a support person | The questions stored with the appointment (the patient's snapshot), read with `list_supported_appointment_questions`. Support persons never read the patient's assessments |
| B2 | `support_persons.email` is NOT NULL | Nullable (Care Planner, `support_persons_align`) |
| B4 | Database checks on `user_type` for patient-only features | The Care Planner and support person functions check it. The assessment save functions don't yet: decision M7, a separate `fix/` branch |
| B5 | pgTAP tests for support person access, `support_persons` and each permission | `090`–`092` and `097` |
| — | What unpairing does to appointment links | Unpairing (and deleting a support person account) marks the patient's row `declined` and removes the links. Deleting a support person cascades the links |

### 4.2 Frontend once the backend is ready ✅ done

Done on `feature/support-person-backend` (steps T1–T4):
1. `access_type` conversion: `accessType.ts` (Care Planner).
2. to 5. `src/services/support-person.ts` calls the A11 functions through `src/features/support-person/mappers.ts`.
   The plan and questions reuse the Care Planner mappers. Exported names and arguments didn't change.
6. Error codes: permission errors are `NOT_ALLOWED` with `NO_QUESTIONS_PERMISSION` / `NO_ANSWERS_PERMISSION`;
   `APPOINTMENT_NOT_FOUND`, `REQUEST_NOT_FOUND` and `PATIENT_NOT_FOUND` are `NOT_FOUND` with that message.
   `carePlannerMessage()` has friendly text for each.
7. The placeholder (`MOCK_*`, `resetMock*`) is deleted.
8. Not done: merging the support person hooks with the Planner's (optional, with the Planner owner).
9. **Still to do after merge:** the two-account manual test (plan step T7).

### 4.2a Fix the support person's Account page ✅ done (`ea005a7` to `27db477`)

**The problem.** `support-settings/profile.tsx` re-exports the patient's Account page, which doesn't match how
support persons sign up and sign in:

| Account page shows | Support persons actually have |
| --- | --- |
| Hardcoded "Sarah McLachlan", a date of birth, and an email | Only a name and a phone number (`users.name`, `users.phone_number`, saved by `create_profile`) |
| Change password, which checks it by signing in with email and password | No password: they sign in with an SMS code, so this always fails |
| Enable FaceID | A toggle that does nothing (biometric sign-in is a "Won't" in the MoSCoW table) |

**The fix:** give support persons their own small Account page, showing only what they have. The
patient's page isn't changed: it has the same problem, but it belongs to the paused patient Settings
backend work (`feature/settings-backend`, open decisions L16 on password and FaceID for phone users, and L17 on changing the phone number).

**Commits:**
1. **`getProfile()` also returns the phone number.**
   - It adds `phone_number` to the existing `users` query (still filtered by `auth_id`), and `AuthContext` passes it through as `profile.phone`.
   - Tests.
   - Read-only, with no backend change, because `authenticated` already has `select` on `users`.
2. **A support person Account page of its own.** `support-settings/profile.tsx` stops re-exporting the patient page. It has **Personal details** and **Sign out** only, with no Change password and no FaceID, using the same `SettingsSubpage` / `SettingsOption` components.
3. **Personal details shows the real details, read-only:**
   - Name (`profile.name`) and phone number (`formatForDisplay(profile.phone)`), using `SettingsModalInfoRow`
   - a note that the details can't be changed in the app yet

   Editing is blocked by the backend: `authenticated` has no `update` on `users`.
4. **Docs:** update section 2.2 and the questions in 4.4.

**Will it break anything?**
- **Patient app:** no change.
- **`getProfile()`:** gains one field. `hasProfile`, `verify.tsx` and the login teammate's screens are unaffected.
- **Account deletion and Export my data** on the shared Privacy page still do nothing, as on the patient side.

**Later, needs others:**
- **Editing the name** needs an `update` grant on `users.name` (backend).
- **Changing the phone number** needs a re-verify-by-SMS flow (L17).
- **Account design:** ask the designer whether the support person's Account design (3896-21629) should drop Change password and FaceID, because it currently shows both.

### 4.3 Decisions made while building (revisit when the team answers)

| Question | Built as | Where to change it |
| --- | --- | --- |
| Can a support person collect recording consent? | No, it's shown as a status line | `appointment/[appointmentId]/index.tsx` |
| Which appointments does a support person see? (S2, 29 Oct) | Only saved appointments the patient added them to | A11 `supports_appointment` |
| Answers before consent? (S3, designer approved) | No: no answer pen until the patient records consent, with "{name} needs to record the doctor's consent first." The database refuses it too | `canAnswerNow()`, A11 |
| What does a pending request show? (S5, designer approved) | The patient's name and the access offered; conditions only after Accept | A11 `list_my_support_requests` |
| Can one account be a patient and a support person? (S6) | No, one `user_type` per account; use another number | `create_profile` |
| Answers on past appointments? | Yes, with the answers permission (answers are often typed up later) | `getPlanAccess()` |
| Can support persons type their own questions? | No, suggested questions only | Not built |
| Layout of the support person's plan and question screens | Same as the patient's | The two screens under `appointment/[appointmentId]/` |
| No permissions at all | "View appointment" opens the plan read-only | `getAppointmentActions()` |
| Permissions in "People you support" | Each shows "Allowed" / "Not allowed" | `people-you-support.tsx` |
| Empty requests wording | "You don't have any support person requests right now." | `requests.tsx` |

### 4.4 Open questions

| Who | Question |
| --- | --- |
| Designer | Can a support person collect recording consent (they may be the one at the appointment)? **Answered (S3):** no, the patient records it; answers wait for it. |
| Designer | Can support persons type their own questions as well as choosing suggested ones? |
| Designer | Designs for the support person's plan and Add questions screens, or keep the patient's layout? |
| Designer | The "Manage person you support" popup (3911-24318) shows the patient's four tabs, and says "Stevie Nicks" while the list says "Steven Harper". Placeholder mix-ups? |
| Designer | How should a missing permission look in that popup? |
| Designer | The support person's Account design (3896-21629) shows Change password and Enable FaceID, but support persons sign in with an SMS code and have no password. Remove both? (section 4.2a) **Answered (29 Oct 2026):** both stay out. Change password is removed from both apps; Face ID comes back later as an app lock (`docs/settings-backend.md`, Q1). |
| Backend | Allow support persons to edit their name (`update` on `users.name`)? How should a phone number change work (L17)? **Answered (29 Oct 2026):** yes, support persons edit their name in Settings with `update_profile` (`feature/settings-backend`). The phone stays read-only in both apps (`docs/settings-backend.md`, Q2). |
| Designer | Wording for the empty requests screen? Should the requests screen have a Back button? (Today: swipe back, Android back, or the Care Planner tab) |
| Designer | The cards' "Tuesday, 10 June 2026" is wrong (it's a Wednesday). The app works the day out itself |
| Product / team | There are no user stories from the support person's point of view: accepting or rejecting requests, unpairing, viewing the people you support and their appointments. Add a support person epic (e.g. *"As a support person, I want to accept or decline a patient's request so that I only see the care of people I've agreed to support."*) |
| Backend | P2 to P6, and B2, B4, B5 above. **Answered:** all done (section 4.1); B4 for the assessment functions is decision M7, a separate fix. |
| Planner owner | OK to merge the two support person hooks with yours later (4.2 step 8)? Tell us before changing the props of `AnswerModal`, `QuestionGroupList` or `QuestionSuggestionGroup`, because the support person screens use them |

## 5. Risks and things to watch

- **Permissions are enforced by the database** (A11), and the app's rules in `permissions.ts` only decide what to offer. If they ever disagree, the database wins and the screen shows its message.
- **Removing a question deletes its answer.** The app blocks this for support persons without the answers permission, and the database refuses it too (`NO_ANSWERS_PERMISSION`).
- **The patient and support person can change the same plan.** Last save wins. The plan screen refreshes when you return to it, and `AnswerModal` only saves the answers changed in that session. Whether stale saves should fail is a backend question.
- **Merge conflicts for other branches** that edit the patient Settings home (now `SettingsHome`), the root layout, or `AuthContext`.
- **Local databases without the 14 Oct migrations** show "We could not load your account" for every user. Run `supabase db reset`. The hosted test database does **not** get migrations automatically: a person runs `supabase db push --include-all` after merge (`docs/deployment.md`).

## 6. Known issues outside this branch

- **`.prettierrc.json` is saved in UTF-16,** so Prettier fails for everyone ("not valid JSON"). It's a one-line fix (save as UTF-8), better done in its own `chore/` PR.
- **`npm run lint` shows 21 warnings, all in files this branch doesn't touch.**
- **Settings back end** (`feature/settings-backend`, PR #52) merged on 30 Oct 2026. Its `delete_account` and `export_my_data` were updated here for invitation status (back-end plan T2.1b and T2.4).

## 7. History

| When | What | Commits |
| --- | --- | --- |
| 11 to 13 Oct | Frontend on placeholder data: data and types, routing, components, home, requests, appointments, Settings | `469f92a` to `d12ad79` |
| 15 Oct | Merged `main` | `8b199b2` |
| 24 Oct | Merged `main` again. Replaced the dev setting (`EXPO_PUBLIC_DEV_USER_TYPE`) with the saved `user_type`, added `getProfile()`, the real name greeting, the second test number, and theme tokens | `0feef11` to `4283a18` (merge `3b37c96`) |
| 24 Oct | Appointment plan and Add questions screens, the placeholder service, loading and error states, permission rules. Removed the "coming soon" screen | `9cdbbd0` to `18c4c31` |
| 24 Oct | Replaced the completed plans with this doc. Gave support persons their own Account page (real name and phone, no password or FaceID) | `733818f` to `27db477` |
| 29 to 30 Oct | Back end (`feature/support-person-backend`): invitation status, table lockdown, support person functions, the service on real data, consent gating, invitation status on the patient's Support persons screen. Placeholder data removed | `e4e63d4` onward |

The removed plan files (`support-person-frontend.md`, `support-person-merge-plan.md`,
`support-person-appointments-now-plan.md`, `support-person-appointments-plan.md`) are still in the git history
of those commits, if the detailed reasoning is ever needed.
