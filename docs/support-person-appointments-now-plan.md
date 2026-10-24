# Support person appointments: what can be built now (frontend only)

Branch: `feature/support-person-frontend`. Status: **plan, waiting for approval.**

Companion to `docs/support-person-appointments-plan.md`, which covers the full feature once the
backend exists. This plan builds **everything that doesn't need the backend**, on placeholder data,
in the same way `main`'s Planner was built (its `src/services/care-planner.ts` is placeholder data
behind real-looking service functions). When the backend is ready, only the **inside** of the service
functions changes. The screens, hooks and permission rules stay as they are.

## What a support person will be able to do after this plan

| Permission | View appointment, questions and answers | Add or change questions | Add or change doctor's answers |
| --- | --- | --- | --- |
| None | ✅ | ❌ | ❌ |
| Add questions | ✅ | ✅ | ❌ |
| Add doctor's answers | ✅ | ❌ | ✅ |
| Both | ✅ | ✅ | ✅ |

The "coming soon" screen is replaced by:
- **Appointment plan** (`app/(support)/care-planner/appointment/[appointmentId].tsx`): the overview, questions and answers. Answers can be edited only with the answers permission, and "Modify questions" only shows with the questions permission.
- **Add questions** (`app/(support)/care-planner/appointment/[appointmentId]/questions.tsx`): tick suggested questions, only with the questions permission.

**All of it runs on placeholder data until the backend exists.** Changes are kept in memory and lost when
the app restarts, and the patient doesn't see them, just as with `main`'s Planner today.

## What's reused from main, and what's new

| Reused unchanged | New, for the support person |
| --- | --- |
| `AppointmentOverviewCard`, `QuestionGroupList` (read-only without `onEditAnswer`), `AnswerModal` (typing and dictation), `QuestionSuggestionGroup`, `QuestionHintBanner` | Two thin screens that put those components together |
| `useAsyncResult` (loading, error and ready state, `reload`, `refresh`) | Two small hooks built on it: one for the plan, one for the questions |
| Pure helpers: `toggleQuestion`, `hasSelectionChanged`, `needsRemovalConfirmation`, `displayOrPlaceholder`, `formatShortAppointmentDate` | `getPlanAccess()`: what this support person may change |
| Types: `Appointment`, `AppointmentPlan`, `AnswerInput`, `QuestionSuggestions` | A placeholder `src/services/support-person.ts` that uses those types |
| `LoadingState`, `ErrorState`, `EmptyState`, `Card` | |

**No file of the Planner owner's is changed.** See risk 2 for why their two data-loading hooks aren't reused directly.

## Commits

Every commit must pass `npm run lint`, `npx tsc --noEmit` and `npm test` on its own, so each can be reverted alone.

### Phase A: data shapes and a placeholder service
1. **Use `main`'s `Appointment` type** (`src/features/care-planner/types.ts`) for supported patients' appointments.
   - That means a number `appointmentId`, a `dateTime` with no time zone, a nullable doctor and service, and `status`.
   - Update `splitAppointments`, `getNextAppointment`, `formatAppointmentTime` and their tests.
   - `AppointmentCard` shows "Not provided" for a missing doctor or service, using `displayOrPlaceholder`.
   - Convert the placeholder data, so nothing visible changes.
2. **Placeholder service `src/services/support-person.ts`** with the patients and requests:
   - `listSupportedPatients()`, `listSupportRequests()`, `acceptSupportRequest(id)`, `rejectSupportRequest(id)`, `unpairFromPatient(id)`
   - async functions returning `Result` (like `care-planner.ts`), with the data moved in from `mock-data.ts`
   - each marked `MOCK:` with the table it will use
   - tests
3. **The store loads patients and requests from the service**, and the home, appointments and People you support screens show `LoadingState` / `ErrorState`.
4. **Accept, reject and unpair call the service.** On failure, the request or patient stays and an error shows; unpair keeps the popup open with the message. The store tests are updated.
5. **Delete `src/features/support-person/mock-data.ts`.** The service now holds the placeholder data.
6. **Placeholder appointment plans in the service**, built from `main`'s types:
   - `getSupportedAppointmentPlan(appointmentId)` returns an `AppointmentPlan`
   - `saveSupportedAnswers(appointmentId, answers)`
   - `getSupportedQuestionSuggestions(appointmentId)` returns `QuestionSuggestions`
   - `saveSupportedQuestions(appointmentId, ids)`
   - In memory, with the same rules as `care-planner.ts`: removing a question removes its answer, and an empty answer clears it.
   - Tests.

### Phase B: the appointment plan, read-only
7. **`getPlanAccess(patient)`** in `src/features/support-person/permissions.ts` returns `{ canEditQuestions, canEditAnswers }`. Tests for all four combinations.
8. **`useSupportedAppointmentPlan(appointmentId)`**, a three-line wrapper around `useAsyncResult` and the service.
9. **Read-only plan screen** `appointment/[appointmentId].tsx`:
   - `BackHeader` titled "<Name>'s Appointment", plus `AppointmentOverviewCard`, and `QuestionGroupList` without `onEditAnswer`
   - loading, error and empty states as on the patient's review screen
   - recording consent shown as **text only** ("Recording consent: obtained / not obtained"), see decision 1
10. **"View questions" and "View doctor's answer" open the plan screen**, from both the appointments screen and the home card.

### Phase C: changes allowed by permissions
11. **Doctor's answers.** When `canEditAnswers`, pass `onEditAnswer` and show `AnswerModal`, which saves with `saveSupportedAnswers` and then refreshes. "Add doctor's answer" opens the plan screen with the first unanswered question's box open.
12. **`useSupportedAppointmentQuestions(appointmentId, canEditAnswers)`**, built from `toggleQuestion`, `hasSelectionChanged` and `needsRemovalConfirmation`.
    - **Blocks unticking a question that has an answer** when the person can't change answers, because removing it would delete the answer (risk 3).
    - Otherwise asks for confirmation, as the patient's screen does.
    - Tests with `renderHook`.
13. **Add questions screen** `appointment/[appointmentId]/questions.tsx`: the subheading, hint banner, "Generated on" date and suggestion groups, with Save. If the screen is reached without the permission, it shows "You don't have permission to add questions".
14. **Point "Add questions" at it** from the home card and the appointments screen. The plan screen gets a "Modify questions" button when allowed.
15. **Delete the "coming soon" screen** `appointment-action.tsx` and anything only it used.
16. **Refresh when returning to a screen** (`useFocusEffect`, as on the patient's review screen), so the plan updates after adding questions.

### Phase D: docs
17. **Docs.** Update `docs/support-person-frontend.md` (screens, testing) and `docs/support-person-appointments-plan.md`. The later plan then shrinks to "replace the inside of `src/services/support-person.ts`" plus the backend prerequisites.

## Decisions made for now (easy to change later)

These are open questions in `docs/support-person-appointments-plan.md` (Q3 to Q6). The plan picks
the safest option, and puts each choice in **one** place so changing it later is a small commit.

| # | Question | For now | Where to change it |
| --- | --- | --- | --- |
| 1 | Can a support person collect recording consent? | **No.** Shown read-only | Plan screen (commit 9) |
| 2 | Can answers be added to **past** appointments? | **Yes**, with the answers permission. The button still says "View" as in the design | `getPlanAccess` (commit 7) |
| 3 | Can support persons type their own questions? | **No.** Suggested questions only, like the patient | Not built |
| 4 | Design for the support person's plan screen? | **Same layout as the patient's "Review My Appointment Plan"** | Plan screen |

## Most likely problems, options and recommendations

### 1. Permissions are only enforced by the app
The database rules on `appointment_questions` don't check `access_type` (prerequisite P5 in the
later plan). With placeholder data that doesn't matter yet, but the PR must not describe the
permissions as secure.
- **Recommendation:** keep every permission decision in `getPlanAccess()`, so it's easy to review and test, and repeat the P5 warning in the PR description.

### 2. Not reusing the Planner owner's `useAppointmentPlan` / `useAppointmentQuestions` directly
Both hooks call the patient's placeholder service (`care-planner.ts`) directly, so they can't load a supported patient's plan.

| Option | Upside | Downside |
| --- | --- | --- |
| **Small support person hooks built on `useAsyncResult` and the same pure helpers** | No changes to the Planner owner's files. The shared logic (selection, removal rules) is still reused | About 50 lines of similar code in the questions hook |
| Add optional "load" and "save" parameters to their hooks | No similar code | Changes the Planner owner's hooks during their own work, and risks conflicts |
| Add support person data to `care-planner.ts`'s placeholder data | Everything reused | Their sample appointments appear in the **patient's** list, so patients would see the support person's examples |

**Recommendation:** the first option. Once both sides use real data, the hooks can be merged with the Planner
owner's agreement. Note this in the PR.

### 3. Removing a question deletes its answer
A support person with only the questions permission could otherwise delete answers. Commit 12 blocks
unticking answered questions for them, with a message, using the existing `needsRemovalConfirmation`.

### 4. The patient and the support person don't share placeholder data
Before the backend exists, a question a support person adds isn't visible on the patient's review
screen, because they're two separate placeholder stores. This is expected, and goes away when both
services read the same tables. Say so in the PR and in the testing notes.

### 5. Placeholder appointment dates
The support person's placeholder appointments are dated relative to today (as now), so "upcoming"
stays upcoming. `main`'s Planner placeholder dates are fixed (June and July 2026), so they're unrelated and not reused.

## Will this break anything?

- **Patient app:** no changes. No Planner file, patient screen or shared component is edited. The new code only *imports* `main`'s components, types, `useAsyncResult` and pure helpers.
- **Support person app:**
  - The screens gain loading and error states (phase A). With placeholder data these only appear briefly, or if forced in tests.
  - Accept, reject and unpair behave as now, but can show an error if the service fails.
- **Backend:** none. No database or `supabase/` changes.
- **Watch for:** if the Planner owner changes the props of `AnswerModal`, `QuestionGroupList` or `QuestionSuggestionGroup`, the support person screens need the same change. The type check will catch it.

## What's left for when the backend is ready

Only the backend prerequisites (P1 to P6 in `docs/support-person-appointments-plan.md`), and replacing the
**inside** of `src/services/support-person.ts`:
- its appointment functions can then call `care-planner.ts`'s real functions, because the database rules decide who can read each appointment
- its patient and request functions query `support_persons`

The screens, hooks and `getPlanAccess` stay as they are.
