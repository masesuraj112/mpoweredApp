# Support person appointments: plan for when the backend is ready

Branch: a new branch from `main` once `feature/support-person-frontend` has merged (e.g.
`feature/support-person-appointments`). Status: **plan only. Don't start until the prerequisites below are met.**

**Update:** phases B to D (the plan and Add questions screens, permission rules, refresh) and most of phase A
(the service shapes, loading and error states) are already built on placeholder data. See
`docs/support-person-appointments-now-plan.md`. Once P1 to P6 are done, the remaining work is replacing the inside of
`src/services/support-person.ts` with real queries. Its function signatures already match what the screens need.

## Goal

A support person sees a supported patient's appointment the same way the patient does: the
appointment overview, the questions to ask, and the doctor's answers. They can only change
what the patient allowed:

| Permission (`support_persons.access_type`) | View the appointment, questions and answers | Add or change questions | Add or change doctor's answers |
| --- | --- | --- | --- |
| None | ✅ | ❌ | ❌ |
| Add questions | ✅ | ✅ | ❌ |
| Add doctor's answers | ✅ | ❌ | ✅ |
| Both | ✅ | ✅ | ✅ |

This follows US18 ("When the support person attempts [an action without permission], Then they are
unable to perform it"), the security requirement 2.2.2, and the edge case in 3.3 (no permissions:
the support person can view but not edit).

## Prerequisites: backend that must be finished first

None of these exist on `main` as of 24 Oct 2026.

| # | Needed | Why | Today |
| --- | --- | --- | --- |
| P1 | **The appointment service reads and writes Supabase** | The patient's screens and this plan share it | `src/services/care-planner.ts` is mock data in memory |
| P2 | **Support persons are linked to patients** (`support_persons.users_id` set, with a pending/accepted state) | To know which patients a support person supports | Never set (login handover note, point 1) |
| P3 | **`access_type` values defined** | To read the two permissions | Free text (handover note, point 7) |
| P4 | **Privileges on `support_persons` granted** | The app can't read the table at all | `authenticated` has none (handover note, point 6) |
| P5 | **Database access rules check permissions for questions and answers** (risk 1) | Without this, the permissions are enforced in the app only | `appointment_questions` rules use `can_access_patient(patient_id)` without a required access level |
| P6 | **A decision on where suggested questions come from for a support person** (risk 2) | The questions screen shows questions generated from the patient's assessments | Generated from mock data |

Each P is a backend task. This plan only covers the frontend that uses them.

## What can be reused from main

`main`'s appointments frontend (PR #33) is built from small components and hooks:

| Piece | Where | Reuse as is? |
| --- | --- | --- |
| `AppointmentOverviewCard` | `src/components/care-planner/` | ✅ Date, doctor, service, support person |
| `QuestionGroupList` | same | ✅ Already **read-only when `onEditAnswer` isn't passed** |
| `AnswerModal` (typing and dictation) | same | ✅ Only shown when the support person may add answers |
| `QuestionSuggestionGroup`, `QuestionHintBanner` | same | ✅ For "Add questions" |
| `RecordingConsentRow` | same | ⚠️ Depends on decision Q3 |
| `PlanActionBar` | same | ❌ Built for the patient's draft/save flow. The support person screen needs its own small footer |
| `useAppointmentPlan`, `useAppointmentQuestions`, `useAsyncResult` | `src/features/care-planner/` | ✅ If the services accept any appointment the user can access (P1) |
| `needsRemovalConfirmation`, `planDisplay`, `appointmentDisplay` | same | ✅ Pure helpers |
| `LoadingState`, `ErrorState`, `EmptyState`, `Card` | `src/components/ui/` | ✅ |
| Patient routes `app/(tabs)/planner/review.tsx`, `questions.tsx` | | ❌ Not reused directly; see below |

**Why not open the patient's screens directly?** They're part of the patient's planning wizard:
- They route to `/planner/...` paths in the patient app.
- They show "Save" for draft appointments.
- They require recording consent before "Modify questions".
- They know nothing about permissions.

Instead, the support person gets **thin screens of their own** (about 100 lines each) built from the
same components and hooks. That shares the look and logic without changing how the patient's
screens behave.

## Screens after this plan

```
Care Planner home ──► Patient's appointments ([patientId])
                         ├─ upcoming / past cards (real data)
                         └─ tap a card's button
                              ├─ "View questions" / "View doctor's answer" / "Add doctor's answer"
                              │     ─► Appointment plan (appointment/[appointmentId])
                              │          overview + questions + answers
                              │          answers editable only with "Add doctor's answers"
                              │          "Modify questions" only with "Add questions"
                              └─ "Add questions" ─► Add questions (appointment/[appointmentId]/questions)
```

- **New:**
  - `app/(support)/care-planner/appointment/[appointmentId].tsx` (the appointment plan)
  - `app/(support)/care-planner/appointment/[appointmentId]/questions.tsx` (add questions)
- **Removed:** the "coming soon" placeholder `app/(support)/care-planner/appointment-action.tsx`.

## Commits

Small commits, each passing `npm run lint`, `npx tsc --noEmit` and `npm test`, so each can be reverted on its own.

### Phase A: real data instead of placeholders
1. **Use `main`'s `Appointment` type** (`src/features/care-planner/types.ts`) in the support person code.
   - That means `appointmentId: number`, `dateTime` with no time zone, and a nullable doctor and service.
   - Update `splitAppointments` / `formatAppointmentTime` and their tests. Show "Not provided" for a missing doctor or service, using `displayOrPlaceholder`.
   - The placeholder data is converted to match, so nothing visible changes.
2. **`listSupportedPatients()`** in a new `src/services/support-person.ts`.
   - Accepted `support_persons` rows for the signed-in user, with each patient's name, condition and permissions.
   - Converts `access_type` to `canAddQuestions` / `canAddAnswers` (P3) in **one** tested function.
   - Tests use a fake client.
3. **`listPatientAppointments(patientId)`**: the patient's **saved** appointments only, because drafts are never shown (same rule as `MyAppointmentsSection`). Tests.
4. **`listSupportRequests()`, `acceptSupportRequest(id)`, `rejectSupportRequest(id)`** (P2). Tests.
5. **`unpairFromPatient(patientId)`.** Tests.
6. **The store loads patients and appointments from the services.** It gains loading and error states, and the home and appointments screens show `LoadingState` / `ErrorState`.
7. **The store loads requests from the services**, and accept and reject call them. A failure shows an error and keeps the request on screen.
8. **Unpair calls the service.** On failure, the popup stays open with the error message.
9. **Delete `src/features/support-person/mock-data.ts`** and its TODOs.

### Phase B: the appointment plan, read-only
10. **`getPlanAccess(patient)`** in `src/features/support-person/permissions.ts` returns `{ canEditQuestions, canEditAnswers }`. Tests for all four permission combinations.
11. **Read-only appointment plan screen** `appointment/[appointmentId].tsx`:
    - `useAppointmentPlan`, `AppointmentOverviewCard`, and `QuestionGroupList` **without** `onEditAnswer`
    - `BackHeader` titled "<Name>'s Appointment"
    - Loading, error and empty states as on the patient's review screen
12. **Point the "View questions" / "View doctor's answer" buttons at the new screen**, from both the appointments screen and the home card.

### Phase C: changes allowed by permissions
13. **Doctor's answers.** When `canEditAnswers`, pass `onEditAnswer` and show `AnswerModal`, which saves through `saveAnswers`. Point "Add doctor's answer" at the screen and open the first unanswered question.
14. **Recording consent row**, following decision Q3.
15. **Add questions screen** `appointment/[appointmentId]/questions.tsx`, shown only when `canEditQuestions`:
    - uses `useAppointmentQuestions` and `QuestionSuggestionGroup`, saving through `saveAppointmentQuestions`
    - if the person can't edit answers, block removing a question that already has an answer, because removing it deletes the answer (risk 3)
16. **Point "Add questions" at it**, from both the home card and the appointments screen, plus a "Modify questions" button on the plan screen when allowed.
17. **Delete `appointment-action.tsx`** and the labels only it used.

### Phase D: finishing
18. **Refresh when returning to a screen** (`useFocusEffect`, as the patient's review screen does), so changes made by the patient or another support person show up (risk 4).
19. **Docs:** update `docs/support-person-frontend.md` and the PR notes. Test by hand with a patient account (`0491 570 006`) and a support person account (`0491 570 007`) on local Supabase, trying each permission combination.

## Most likely problems, options and recommendations

### 1. The database doesn't check the permissions (highest risk)
The rules on `appointment_questions` (`aq_insert`, `aq_update`, `aq_delete`) only call
`can_access_patient(patient_id)`, which lets **any** linked support person add, change or delete
questions and answers, whatever their permissions. Hiding buttons in the app doesn't stop a direct
API call.

| Option | Upside | Downside |
| --- | --- | --- |
| **Backend adds the permission check to the rules** (e.g. `can_access_patient(patient_id, 'questions')` for questions, `'answers'` for answers) | Real enforcement, and matches requirement 2.2.2 | Questions and answers are in the same table, so the rule needs to tell "changing the question" from "changing the answer". Probably needs separate database functions (like `save_pain_assessment`) |
| App-only checks | No backend work | Not secure: hidden buttons aren't a permission system |

**Recommendation:** treat P5 as a must-have before release. The frontend still hides what isn't allowed
(commits 10 to 16), so the experience is right either way, but don't call the permissions "enforced"
until P5 is done. Ask the backend owner to add pgTAP tests for each permission (handover note, point 5).

### 2. Where suggested questions come from for a support person
The patient's "Add questions" screen shows questions generated from **the patient's own**
assessments. A support person can't produce those from their own data.

| Option | Upside | Downside |
| --- | --- | --- |
| **Generate the suggestions on the server and store them with the appointment** | Both people see the same list. No need to let support persons read the patient's raw health data | Backend work |
| Let support persons read the patient's assessments and generate the questions in the app | No new tables | Widens access to health data for an "add questions" feature. Questionable under 2.2.2 |
| Let support persons type their own questions | Matches Jennifer's goal "add and adjust any questions remotely" | Not in the designs yet, and needs a new input |

**Recommendation:** server-generated, stored suggestions (P6), and ask the designer whether support
persons should also be able to type their own question. If they should, add it as a later commit.

### 3. Removing a question deletes its answer
On `main`, unticking a question deletes its doctor's answer (`saveAppointmentQuestions`). A support
person who may change questions but **not** answers could delete answers that way.

- **Options:**
  - **(a) Block removing answered questions** unless the person can also change answers, with a short explanation
  - (b) Allow it with a warning
  - (c) Let the backend keep the answer
- **Recommendation: (a).** It's the only option that keeps US18 true without backend changes. `needsRemovalConfirmation` already identifies these questions.

### 4. The patient and the support person changing the same plan
Both can change the same appointment. The mock saves "last one wins".

- **Recommendation:** refresh when a screen comes back into view (commit 18). Keep `AnswerModal`'s behaviour of saving only the answers changed in that session, which already limits overwrites. Ask the backend whether saves should fail on stale data. Not needed for a first version.

### 5. Reusing the patient's screens vs. thin support person screens
- **Options:**
  - **(a) Thin screens built from the shared components and hooks**
  - (b) Add a "support person mode" to the patient's `review.tsx` and `questions.tsx`
- **Recommendation: (a).** Option (b) would put permission branches into the Planner owner's screens and their draft/save wizard. With (a), the patient's screens don't change, and the shared parts are reused rather than copied. If a component needs a small option (for example hiding a row), add an optional prop and agree it with the Planner owner.

### 6. Past appointments: view only, or still editable?
The designs show "View questions" / "View doctor's answer" on past appointments. But doctors' answers are often typed up **after** the appointment, and the patient can still add them then.
- **Recommendation:** past appointments open the same plan screen. Someone with "Add doctor's answers" can still add or change answers there. Only the button label says "View". Confirm with the designer (Q4).

## Questions to settle first

| # | Who | Question |
| --- | --- | --- |
| Q1 | Backend | What are the `access_type` values (P3), and will the database check them (P5)? |
| Q2 | Backend / Planner owner | Where are suggested questions generated and stored (P6)? |
| Q3 | Designer / product | **Recording consent:** can a support person with "Add doctor's answers" collect the doctor's signature (they may be the one at the appointment), or is it patient-only and read-only for them? |
| Q4 | Designer | Can answers be added to past appointments by a support person (risk 6)? |
| Q5 | Designer | Can support persons type their own questions as well as choosing suggested ones (risk 2)? |
| Q6 | Designer | Is there a design for the support person's appointment plan screen, or should it match the patient's "Review My Appointment Plan"? |

## Will this break anything?

- **Patient app:** no planned changes to the patient's Planner screens (risk 5). Shared components only get optional props, if any, agreed with the Planner owner.
- **Support person app:** phase A replaces placeholder data, so screens must handle loading, errors and empty lists that couldn't happen before. Each data commit adds these states.
- **Backend:** this plan makes no database changes. It depends on P1 to P6 being done by the backend owners first.
