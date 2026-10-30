# Support Person — Back-end Build Plan

> **Scope: the support-person app's back end only** (`app/(support)`, `src/services/support-person.ts`): invitations (accept / reject / unpair), the patients a support person supports, their appointments, and adding questions / doctor's answers within the access each patient gave. It replaces the placeholder service and removes its mock data.
> **Starts after the Care Planner back end (`care-planner-build-plan.md`, branch `feature/care-planner-backend`) has merged to `main`.** Do not begin earlier (see section 0).
> Mirrors `login-backend-build-plan.md`: guardrails, decisions register, phases, one commit per step, tests with each step.
> **Revision 2.** This revision updates the first version against what the Care Planner branch actually delivered (section 0.2 lists every difference). The SQL in Appendices A and C is unchanged except for notes.
> **Revision 3 (29 Oct 2026, owner Ryan Pham).** Decisions S2–S6 and M7 are settled (section 2). S2 and S5 changed the A11 SQL and Appendix C: a support person sees only the appointments they were added to (new helper `supports_appointment`), and a pending request no longer shows the patient's conditions. **Those changes have not been run** like the rest of the SQL was; CI's `092` is the first run. The timestamp rule now says after `20261027013340` (the tenth Care Planner migration).
> **Status of the SQL:** A9–A11 were applied in order on top of the 29 repo migrations and the Care Planner's migrations, in a local Postgres 16. The behaviour suite in Appendix C passed and was mutation-checked: re-creating the old `appointment_select` policy makes it fail. **pgTAP itself has not been run** (Docker is never run locally); you translate Appendix C into pgTAP files (section 6) and CI runs them. The Care Planner's own pgTAP files (`080`–`088`) and generated types have been through CI and pass (section 0.1).

---

## 0. Prerequisites

### 0.1 Before you start: the Care Planner branch must be merged and green

The Care Planner back end is on branch `feature/care-planner-backend` (about 30 commits; see `care-planner-final-progress.md`). It passed typecheck, lint, 65 Jest suites and the CI `database-tests` job (pgTAP `080`–`088`, `db lint`, the types diff) on its pull request. Before writing anything:

1. Confirm the Care Planner pull request is merged to `main` and that CI was green, including `database-tests` (pgTAP `080`–`088`, `supabase db lint`, and the step "Generated types match the migrations").
2. **`src/types/database.ts` was edited by hand for those migrations** (Docker and CI logs were not available); CI's types diff then matched after one ordering fix, so it equals the generator's output. If the file on `main` ever differs, run `supabase gen types typescript --local > src/types/database.ts` via CI as described in `testing-and-cicd.md` before continuing.
3. If anything in 0.2 is not true in the repo you have, **stop and tell the owner** (guardrail 15).

### 0.2 What the Care Planner branch delivered (and how it differs from what version 1 of this plan assumed)

**Migrations** (all after `20261020025837`; yours must sort after the last one):

| File | What it does |
|---|---|
| `20261027012438_appointment_status` | `appointment.status` (`draft`/`saved`), `saved_at`, `suggestions_generated_on` |
| `20261027012532_appointment_questions_plan_columns` | `group_key`, `sort_order`, `is_selected`; answer constraints |
| `20261027012640_support_persons_align` | phone/email nullable, mobile-only E.164 phone, `access_type` check, unique `(patient_id, phone_number)`, links cascade on delete |
| `20261027012740_care_planner_privileges_policies` | explicit grants, `ahsp_delete`, trigger `ahsp_limit_two` |
| `20261027012840_rpc_appointment_details` | `save_appointment_details`, `list_my_appointments` |
| `20261027012940_rpc_suggestions_questions` | `save_appointment_suggestions`, `save_appointment_questions` |
| `20261027013040_rpc_support_people` | `save_support_person`, `save_appointment_support_people`, `list_my_support_persons` |
| `20261027013140_rpc_consent_answers_save` | `save_recording_consent`, `save_appointment_answers`, `save_appointment` |
| `20261027013240_support_people_relink_and_link_policy` | **new since version 1**: fixes `save_appointment_support_people` (re-saving two people failed because `ahsp_limit_two` fires before `on conflict do nothing`), and restricts the `ahsp_insert` policy so a link can only join a patient's own appointment to that patient's own support person |
| `20261027013340_enforce_care_planner_rules` | **new since the last revision:** triggers so the consent rule (a non-empty answer needs `recording_consent_at`) and the `NO_QUESTIONS` rule on save also apply to direct table writes; a row lock in the two-person limit and in `save_appointment_support_people`; a numeric check on `support_person_id` |


pgTAP files `080`–`089` exist, and the Settings branch uses `093`–`096`, so **your pgTAP files are `090`–`092` and `097`**.

**The Settings branch merges first** (PR #52, `docs/settings-backend.md`). It adds four migrations, `20261029113242_settings_update_profile`, `20261029114645_settings_user_settings`, `20261029120105_export_my_data` and `20261029121213_delete_account`, plus the `delete-account` Edge Function. Merge `main` in after it merges: yours must sort after `20261029121213` (`supabase migration new` does this), and T2.1b and T2.4 replace two of its functions (`delete_account`, `export_my_data`).

**Things your migrations must stay compatible with**

- A9 replaces `save_support_person` with `create or replace`. Keep the signature exactly `(text, text, text, text, int)` as in `20261027013040_rpc_support_people`, and keep the existing return type `public.support_persons`.
- A9 adds `status` and `responded_at` to `support_persons`. The Care Planner functions that return `support_persons` rows (`list_my_support_persons`, `save_appointment_support_people`, `save_support_person`) therefore return the new columns too once A9 is applied; the Care Planner mappers ignore extra columns, so nothing breaks, but the generated types change.
- A10 must not recreate the old `ahsp_insert` policy (it does not touch it; leave it alone). The other `ahsp_*`, `aq_*`, `appointment_*`, `patients_*`, `users_select` and `support_persons_select/update` policies are the ones A10 replaces. After A10, the Care Planner's own tests (`083`, `086`, `088`) still hold because they only exercise the owning patient.
- The Care Planner trigger `ahsp_limit_two` and the existing trigger `support_persons_protect_access_type` stay.
- The Care Planner triggers from `enforce_care_planner_rules` apply to **every** writer, including your `security definer` functions: `appointment_questions_answer_needs_consent` refuses a non-empty answer when the appointment has no `recording_consent_at` (`CONSENT_REQUIRED`), and `appointment_save_needs_question` refuses saving an appointment with suggested questions but none on the plan (`NO_QUESTIONS`). They match the rules A11 already enforces, so Appendix C should still pass, but when you write pgTAP fixtures that put an answer on a question, record consent on the appointment first (the Care Planner's `081` and `085` fixtures show how). The decision to keep consent mandatory (US12's third criterion is **not** followed) was taken by the owner; do not relax it in A11.
- A1–A3 hosted-data effects (appointments marked `saved`, non-mobile phones nulled, unknown access types set to `none`) are already in the Care Planner migrations; they are not yours to redo.

**Application code now on `main`** (reuse it; do not write a second copy)

| Where | What you can rely on |
|---|---|
| `src/lib/errors.ts` | `AppErrorCode` includes `CONSENT_REQUIRED`. `NOT_ALLOWED_MESSAGES = ['NOT_A_PATIENT']` is checked **first** in the `P0001` branch (a const tuple); validation messages include `NO_QUESTIONS`, `UNKNOWN_QUESTION`, `QUESTION_NOT_ON_PLAN`, `INVALID_ANSWER`, `APPOINTMENT_NOT_SAVED`. `VALUE_TOO_LONG` is a validation message; `NOT_FOUND` and `NO_SESSION` pass through as their own codes. |
| `src/features/care-planner/accessType.ts` | `accessTypeToDb(flags)`, `accessTypeFromDb(value)` (unknown value gives no access). |
| `src/features/care-planner/mappers.ts` | `mapAppointment(row)`, `mapQuestionSuggestions(appointmentRow, questionRows)`, `mapAppointmentPlan(appointmentRow, questionRows, supportPeople)`, `mapSupportPerson`, `toLocalTimestamp`, `QUESTION_GROUPS`. Row types: `AppointmentRow` (`appointment_id, date_time, practitioner_name, health_service, status`), `AppointmentPlanRow` (adds `recording_consent_at`), `SuggestionsRow` (`status, suggestions_generated_on`), `QuestionRow` (`question_id, group_key, sort_order, question, is_selected, answer`). The rows returned by `get_supported_appointment` and `list_supported_appointment_questions` already have exactly these fields. Dates are reshaped as text only (no `Date`). |
| `src/features/care-planner/messages.ts` | `carePlannerMessage(error)`. **Important:** `NOT_ALLOWED` currently gives one generic message, and `NOT_FOUND` says "We could not find that appointment". The support-person errors keep their message code in `error.message` (see T1.2), so you must add message-specific text; do not rely on the code alone. |
| `src/features/care-planner/supportPerson.ts`, `types.ts` | `SupportPerson` has `supportPersonId?`, **no `status` yet** (you add it, T1.2). `MAX_SUPPORT_PEOPLE = 2`. |
| `src/features/care-planner/planTypes.ts`, `suggestionTypes.ts` | `QuestionSuggestions.generatedOn` is now `string \| null` (the support question screen already guards with `?? ''`; that one-line edit to `app/(support)/care-planner/appointment/[appointmentId]/questions.tsx` is already made). |
| `src/services/care-planner.ts` | The pattern to copy: client is the last optional argument, `run()` from `@/lib/result`, errors through `mapError`, no user or patient id ever sent, `jest.mock('@/lib/supabase', …)` with fake clients in the tests. Appointment details functions return `{ appointmentId }` (an `AppointmentRef`). |
| `src/features/care-planner/useMySupportPersons.ts` | Drives the patient's Settings > Support Persons screen; you add the invitation state to that screen (T4). |
| `docs/support-person.md` | Rows P1, P3 and B2 of the §4.1 table are already marked done by the Care Planner. |

**Local-only tests.** `__tests__/care-planner/` and `__tests__/_golden/` are excluded from git on the owner's machine (`.git/info/exclude`), so CI never sees them; some of them fail against the real service. Ignore them unless the owner asks.

---

## 1. Guardrails (read first)

These add to `CLAUDE.md` and `docs/backend/testing-and-cicd.md`. Where they differ, **the stricter one wins**.

1. **STOP and ask (AskUserQuestion, 2–4 options) on any 🟡, ❓ or ⏳ item in section 2 that is still open when you reach the step that depends on it.** Never invent column names, error codes or library behaviour. If the repo conflicts with this plan, stop and say so.
2. **Show the exact SQL and grants for each migration and wait for approval before writing the file** (`CLAUDE.md`). Appendix A is the proposal; approval is still required.
3. Never edit an existing migration, **including the Care Planner's once merged**. One new migration per Appendix A file (`supabase migration new <name>`, timestamps after `20261027013340`, order A9→A11), each with its `-- Rollback:` comment, RLS enabled and explicit grants. A9 uses `create or replace function` on a function added by the Care Planner's `rpc_support_people` migration; that is a new migration, not an edit of a merged one.
4. Database functions are plpgsql, set `search_path = public`, raise `P0001` with a message code, derive the caller from `auth.uid()` (never an argument), and end with `revoke all … from public, anon; grant execute … to authenticated`. **The A11 functions are `security definer` on purpose** (support persons get no table access) and the helpers `support_access` and `supports_appointment` are revoked from `authenticated` too. **This is the first `security definer` in the Care Planner; the owner approved it in writing (decision S4, 29 Oct 2026).**
5. Never run `supabase start`, `supabase test db`, `supabase db push` or anything that needs Docker. CI runs the database tests. `npm run typecheck`, `npm run lint` and `npm test` are allowed and required before finishing each phase.
6. `src/types/database.ts` is **generated; never edit it by hand** (`CLAUDE.md`). After each migration, push, let the "Generated types match the migrations" step fail, and commit the generated file from the CI log or artifact (`testing-and-cicd.md` §7.3). (The Care Planner branch had to hand-write its types; do not repeat that if you can see the CI log.)
7. Always filter `public.users` by `auth_id`.
8. Services return `Result<T>` through `run()` from `@/lib/result`, map errors via `mapError` / `AppError`, and take the Supabase client as the **last optional argument** (`Client` from `assessments.ts`). Delete the placeholder service's own copy of `run`.
9. Pure modules never import `@/lib/supabase`, `react-native` or `expo-*`. Do not import from `app/` inside `src/`.
10. Service tests start with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))` and use fake clients. Add every new tested file to `collectCoverageFrom` in `jest.config.js`.
11. Do not run `npm run format` or Prettier over the repo (mixed line endings). Keep each file's existing endings; minimal diffs. Do not log phone numbers or identifiers.
12. Appointment date/time is LOCAL wall-clock; never `toISOString()` or UTC.
13. **Work one phase at a time. Never start the next phase until the owner says so.** One commit per step. At the end of each phase: push, then summarise (one line per step, anything unsure, anything unverified, what CI should prove).
14. Keep `docs/backend/progress.md` current: a checklist of every step ID with done / blocked / skipped.
15. Branch `feature/support-person-backend` from `main` after the Care Planner plan has merged. Prefixes: `feature/ fix/ chore/ refactor/ test/ docs/`.
16. Test OTP numbers are dev/local only. For manual QA use `0491 570 006` (patient) and `0491 570 007` (support person), code `123456`.
17. **Commit messages are in the imperative form with no `type:` prefix** (for example "Add support person functions", not "feat(db): …"). This is the owner's preference on this project. End each commit with the attribution line your session gives you.

---

## 2. Decisions register

### Settled
| # | Decision |
|---|---|
| D3 | **Consent is enforced in the database** (Care Planner): a non-empty answer cannot be saved without `recording_consent_at` → `CONSENT_REQUIRED`. It applies to support persons too (see S3). |
| D4 | **Support-person model = what the support-person front end already built** (`docs/support-person.md`): the patient invites a person by phone number; the person sees an invitation, **accepts or rejects** it, can later **unpair**; the patient's `access_type` decides whether they can add questions and/or doctor's answers. |
| D10 | `support_persons.status` = `pending` / `accepted` / `declined`, plus `responded_at`. **Reject and unpair keep the patient's row as `declined`**; adding the same number again re-invites. Unpair also removes the person from the patient's appointments. Closes the "what does unpair do to appointment links" row in `docs/support-person.md` §4.1. |

### Settled on 29 Oct 2026 (owner: Ryan Pham)
| # | Decision | Affects |
|---|---|---|
| S2 | **A support person sees only the saved appointments the patient added them to** in the wizard (`appointment_has_support_persons`), not all of the patient's appointments. It follows the patient's choice and shares less by default. A new internal helper `supports_appointment(p_appointment_id)` checks the link in every appointment function, so an unlinked appointment can't be opened by its id either. Taking a person off an appointment ends their access to it at once. The People you support list still shows the patient. | A11, `092`, T4 |
| S3 | **Consent stays mandatory** for a support person's answers (D3; the owner had already chosen not to follow US12's third criterion). Until the patient records consent, "Add doctor's answer" is disabled with the line "{name} needs to record the doctor's consent first". **Designer approved (29 Oct 2026).** | T4 |
| S4 | **Approved: `security definer` functions (A11) and the tighter policies (A10).** Without A10, any linked support person could read the patient's whole appointment, questions, `patients` row (sex, year of birth, conditions) and `users` row (phone number) whatever access they were given, and `is_support_person_for_patient` matches access with `LIKE`. | T2 |
| S5 | **A pending request shows the patient's name only.** Conditions appear after Accept. A mistyped number would otherwise show a stranger the patient's health conditions, which are sensitive information under the Privacy Act. `list_my_support_requests` returns no `conditions` column. **Designer approved (29 Oct 2026):** the Figma request card loses its condition line. | A11, T1.3, T4 |
| S6 | **One account is either a patient or a support person.** A patient who also cares for someone uses another number. Note it in `docs/support-person.md` (T5.1). | — |
| M7 | **Accepted as a separate fix, after this branch.** The five assessment save functions only check for a `users` row and store against `users_id`, so a support person could save assessments through the API (about themselves; no screen does it). Fix on its own `fix/` branch: one migration with a shared `require_patient()` trigger on the five assessment tables raising `NOT_A_PATIENT`, and a pgTAP test. Not part of this plan's steps. | — |

### Out of scope
Notifications, a support person changing their phone number (login decision L17), the patient Settings and support person Settings screens (they belong to `docs/settings-backend.md` on `feature/settings-backend`, which also lets a support person edit their own name), the support person collecting recording consent, support persons typing their own questions. The Care Planner's open items M1–M3 (health service list, extra question rules, generation gate) are the client's and do not affect this plan.

---

## 3. Phase map

| Phase | Goal | Steps |
|---|---|---|
| T0 | Branch and recon | T0.1–T0.2 |
| T1 | Pure foundations (no database) | T1.1–T1.3 |
| T2 | Migrations + pgTAP + generated types (S2–S6 settled and S4 approved on 29 Oct 2026) | T2.1, T2.1b, T2.2–T2.4 |
| T3 | Mappers and service rewrite | T3.1–T3.2 |
| T4 | Front-end deltas | T4.1 |
| T5 | Placeholder removal and docs | T5.1 |
| T6 | Full checks | T6.1 |
| T7 | Manual QA with two real accounts | T7.1 |

---

## 4. Data model and functions

### Table changes (A9) and policy lockdown (A10)
- `support_persons`: **+ `status`** (`pending`/`accepted`/`declined`, default `pending`), **+ `responded_at`**; check `(status='accepted') = (users_id is not null)`; index on `phone_number`. Existing rows are backfilled (`accepted` if `users_id` is set, else `pending`; the Care Planner never sets `users_id`, so every existing row becomes `pending`).
- `save_support_person` (patient side, from the Care Planner) is replaced: adding a `declined` number re-invites it (`pending`); changing an *accepted* person's number makes it a new `pending` invitation and drops the old login link.
- **A10:** `appointment`, `appointment_questions`, `appointment_has_support_persons`, `patients`, `users` (other people's rows) and `support_persons` become readable/writable **only by the owning patient**. A support person never touches these tables directly; they use the A11 functions. The existing trigger `support_persons_protect_access_type` stays (a support person cannot change their own access). `can_access_patient` and `is_support_person_for_patient` are then unused by any policy: leave them, but do not use them in new code (`LIKE` matching).

### Functions (A11, **security definer**, `authenticated` only)
| RPC | Returns | Error codes |
|---|---|---|
| `list_my_support_requests()` | pending invitations for the caller's phone: `patient_id, patient_name, can_add_questions, can_add_answers` (**no conditions**, S5) | — |
| `list_supported_patients()` | accepted patients: `patient_id, patient_name, conditions, can_add_questions, can_add_answers` | — |
| `list_supported_appointments()` | saved appointments of accepted patients **that the caller was added to** (S2), with `patient_id` | — |
| `accept_support_request(p_patient_id)` | the patient now supported (one row) | `NO_PROFILE` `NOT_A_SUPPORT_PERSON` `REQUEST_NOT_FOUND` |
| `reject_support_request(p_patient_id)` | void | same |
| `unpair_from_patient(p_patient_id)` | void | `NO_PROFILE` `NOT_A_SUPPORT_PERSON` `PATIENT_NOT_FOUND` |
| `get_supported_appointment(p_appointment_id)` | details, `recording_consent_at` (never the signature), `suggestions_generated_on`, `can_add_questions`, `can_add_answers`; **zero rows** if not allowed, including an appointment the caller wasn't added to (S2) | — |
| `list_supported_appointment_questions(p_appointment_id)` | all stored questions with `is_selected` and `answer` | — |
| `save_supported_questions(p_appointment_id, p_question_ids int[])` | void | `NO_SESSION` `APPOINTMENT_NOT_FOUND` `NO_QUESTIONS_PERMISSION` `UNKNOWN_QUESTION` `NO_QUESTIONS` `NO_ANSWERS_PERMISSION` (removing an answered question) |
| `save_supported_answers(p_appointment_id, p_answers jsonb)` | void | `NO_SESSION` `APPOINTMENT_NOT_FOUND` `NO_ANSWERS_PERMISSION` `INVALID_ANSWER` `CONSENT_REQUIRED` `QUESTION_NOT_ON_PLAN` `VALUE_TOO_LONG` |

The message codes `NO_QUESTIONS_PERMISSION`, `NO_ANSWERS_PERMISSION`, `REQUEST_NOT_FOUND`, `PATIENT_NOT_FOUND` and `APPOINTMENT_NOT_FOUND` are the strings the support-person screens and `support-person.test.ts` already expect. The request id used by the app is the **patient id as a string** (one invitation per patient per person); `SupportedPatient.id` is the same string. `support_access(p_patient_id, p_token)` (accepted + user type + exact access token) and `supports_appointment(p_appointment_id)` (accepted and added to that appointment) are internal helpers; the app can't call them.

How a request reaches a person: the patient adds a support person with an Australian mobile (E.164). When someone signs up as a support person with that verified number, `list_my_support_requests` returns it. Nothing else links them.

Closes `docs/support-person.md`: P2, P4, P5, P6 (the patient's snapshot is what support persons read), B5 and the "unpair links" row. B4 only for the Care Planner (M7). (P1, P3 and B2 were closed by the Care Planner.)

---

## 5. Steps

### Phase T0 — Branch and recon
**T0.1 Branch.** Care Planner merged and CI green (section 0.1)? `git checkout main && git pull && git checkout -b feature/support-person-backend`. **Commit:** none.
**T0.2 Recon.** Confirm in the repo: the ten Care Planner migrations listed in 0.2 exist, including `…013340_enforce_care_planner_rules`; `errors.ts` has `NOT_ALLOWED_MESSAGES` and `CONSENT_REQUIRED`; `accessType.ts`, `mappers.ts` and `messages.ts` exist in `src/features/care-planner/`; the policies and the trigger `support_persons_protect_access_type` match section 4. If anything differs, **STOP and ask**. List every import of `@/services/support-person` and every placeholder (`MOCK_*`, `resetMockSupportPerson`, `resetMockSupportedPlans`, the copied `run`) in `docs/backend/support-person-stub-inventory.md`. **Commit:** "Add support person stub inventory".

### Phase T1 — Pure foundations
**T1.1 Error codes.** *Files:* `src/lib/errors.ts`, `errors.test.ts`. Add `NOT_A_SUPPORT_PERSON`, `NO_QUESTIONS_PERMISSION` and `NO_ANSWERS_PERMISSION` to the existing `NOT_ALLOWED_MESSAGES` tuple (it is checked first). **Order matters:** `NO_QUESTIONS` (a validation message) is a substring of `NO_QUESTIONS_PERMISSION`, and the mapper matches with `message.includes`. `REQUEST_NOT_FOUND`, `PATIENT_NOT_FOUND` and `APPOINTMENT_NOT_FOUND` need no change: they contain `NOT_FOUND`, so they map to `NOT_FOUND` with the message kept. *Tests:* the three codes are `NOT_ALLOWED` and **not** `VALIDATION`; `NO_QUESTIONS` is still `VALIDATION`; the three `*_NOT_FOUND` messages map to `NOT_FOUND` and keep their message. **Commit:** "Map support person error codes".
**T1.2 Friendly messages and types.** Extend `src/features/care-planner/messages.ts` (+ test). Because both permission errors have `code: 'NOT_ALLOWED'` and `NOT_FOUND` currently talks about "that appointment", look up `error.message` first inside the `NOT_ALLOWED` and `NOT_FOUND` cases for `NO_QUESTIONS_PERMISSION`, `NO_ANSWERS_PERMISSION`, `REQUEST_NOT_FOUND`, `PATIENT_NOT_FOUND`, `APPOINTMENT_NOT_FOUND`; no raw database text. Add `status?: 'pending' | 'accepted' | 'declined'` to the patient `SupportPerson` type and read `status` in `mapSupportPerson` (add it to `SupportPersonRow`). **Commit:** "Add support person messages and invitation status".
**T1.3 Support-person mappers.** `src/features/support-person/mappers.ts` (+ test, add to `collectCoverageFrom`): function rows → `SupportedPatient` (`id` = `String(patient_id)`, `condition` = `conditions` or `''`, `canAddQuestions`/`canAddAnswers`), `SupportRequest` (`appointments: []`, `condition: ''`: requests carry no conditions, S5), `Appointment`, grouped by patient. The plan and suggestions go through the Care Planner mappers (`mapAppointmentPlan(row, questions, [])` and `mapQuestionSuggestions(row, questions)`; `supportPersonName` stays `null`). *Tests:* id strings, empty condition, a request has no appointments and no condition, grouping, dates unchanged. **Commit:** "Add support person row mappers".

### Phase T2 — Migrations (**gated**)
Each step: show the SQL and wait for approval, then one commit with the migration, its pgTAP file (section 6), and the regenerated types after CI reports the diff.
| Step | Appendix A file | Migration name | pgTAP file | Commit |
|---|---|---|---|---|
| T2.1 | A9 | `support_link_state` | `090_support_link_state.test.sql` | "Add support person invitation status" |
| T2.1b | (from Settings) | `settings_delete_account_status` | `096_delete_account.test.sql` (updated) | "Mark a deleted support person's rows as declined" |
| T2.2 | A10 | `restrict_support_person_table_access` | `091_support_person_table_access.test.sql` | "Restrict support person table access to the patient" |
| T2.3 | A11 | `support_person_functions` | `092_support_person_functions.test.sql` | "Add support person functions" |
| T2.4 | (from Settings) | `settings_support_person_status` | `097_settings_support_person_status.test.sql` | "Include supported patients in a support person's export" |

Notes:
- Keep A9 < A10 < A11 by timestamp (all after `20261027013340`), all in the same pull request. A10 is the **security fix**: it must never be merged after A11 (nothing links a person to a login before A11 exists, so shipping them together is safe).
- If a constraint fails on hosted data (A9's backfill, `chk_support_persons_link`), **STOP and ask**; do not loosen it. If CI fails on a migration that is new in this PR, show the owner the fix before changing it; never touch a merged migration.
- After T2.3, **nothing in the app calls the functions yet**, so the placeholder service keeps working until T3.
- **Settings commit 19 is split between T2.1b and T2.4** (`docs/settings-backend.md` merged first, PR #52):
  - **T2.1b, done (`74a209f`), right after A9.** Settings' `delete_account` cleared `users_id` without changing the
    status, which A9's `chk_support_persons_link` ("a login only when accepted") refuses, and CI's `096` showed it at
    once. Migration `settings_delete_account_status` replaces `delete_account` (same signature `(int)`, still
    `security definer` and `service_role` only): a deleted support person's rows become `declined` with no login and
    `responded_at = now()`, and their appointment links go, as `unpair_from_patient` does. `096`'s fixture now links
    the support person as `accepted`, and it checks the row ends `declined`. Approved by the owner on 30 Oct 2026.
  - **T2.4, after A11:** `export_my_data` (`create or replace`, same signature `()`, still `security invoker`) adds
    `'supported_patients'`, the rows of `list_supported_patients()`. After A10, a support person can't read
    `support_persons` directly, so this is the only way to include them. Test `097_settings_support_person_status`:
    a support person's export lists the patients they accepted and nothing of a pending invitation; a patient's
    export is unchanged. Show the SQL and wait for approval first, like A9–A11.

### Phase T3 — Service
**T3.1 Service rewrite** (`src/services/support-person.ts`; the exported signatures stay and the client becomes the last optional argument):
- `listSupportedPatients` — `list_supported_patients` + `list_supported_appointments` in parallel, grouped by patient.
- `listSupportRequests` — `list_my_support_requests`, `appointments: []`.
- `acceptSupportRequest(requestId)` — `accept_support_request(Number(requestId))`, then that patient's appointments.
- `rejectSupportRequest`, `unpairFromPatient` — the matching RPCs.
- `getSupportedAppointmentPlan` — `get_supported_appointment` + `list_supported_appointment_questions` through the shared mappers; `supportPersonName` stays `null`; **zero rows** from `get_supported_appointment` becomes `APPOINTMENT_NOT_FOUND`.
- `getSupportedQuestionSuggestions` — same two calls; `generatedOn` is null when `suggestions_generated_on` is null.
- `saveSupportedQuestions` → `save_supported_questions`; `saveSupportedAnswers` → `save_supported_answers`.

Follow `src/services/care-planner.ts` for the pattern. Keep the error shapes the screens handle (`NOT_ALLOWED` + `NO_QUESTIONS_PERMISSION`/`NO_ANSWERS_PERMISSION`; the `*_NOT_FOUND` messages). **Commit:** "Replace the support person placeholder service with Supabase-backed services".
**T3.2 Service tests.** Rewrite `support-person.test.ts` with fake clients (section 6.3). **Commit:** "Rewrite support person service tests with fake clients".

### Phase T4 — Front-end deltas
| Change | Why |
|---|---|
| **S3:** when `recordingConsentedAt` is null, hide the answer pen and disable "Add doctor's answer" on the plan screen, with the line "{name} needs to record the doctor's consent first" in place of "Only {name} can ask the doctor for it". Show the friendly message if `CONSENT_REQUIRED` still comes back (consent changed under them). | D3, S3 |
| **S5:** nothing to change on screen: `SupportRequestCard` already shows only the name (T0.2 recon). | Requests carry no conditions |
| A supported patient with no conditions: hide the condition line instead of showing an empty string. | `conditions` can be empty |
| **S2:** a patient with no appointments the person was added to shows the empty appointments state, not an error. | Only linked appointments are returned |
| `NO_QUESTIONS_PERMISSION` / `NO_ANSWERS_PERMISSION` show the friendly message and reload the patient list (access changes take effect at once). `APPOINTMENT_NOT_FOUND` (for example after the patient took the person off the appointment) does the same. | Permissions are enforced by the database |
| Update `support-person.test.ts`, `context.test.tsx` and `useSupportedAppointmentQuestions.test.ts` so none import `resetMock*`. | Placeholder removal |
| **From Settings (its step 6 and commit 18):** patient Settings > Support Persons (`app/(tabs)/settings/support-persons.tsx`, driven by `useMySupportPersons`) shows Pending / Accepted / Declined on each row, and the Revoke all access popup says the person loses access at once. Its own commit: "Show invitation status on the patient's support persons". | A9 adds `status`; T1.2 maps it |
**Commit:** "Gate doctor's answers on recording consent" (the invitation status row is its own commit, above).

### Phase T5 — Placeholder removal and docs
**T5.1** Delete `MOCK_SUPPORTED_PATIENTS`, `MOCK_SUPPORT_REQUESTS`, `MOCK_SUGGESTED_GROUPS`, `MOCK_DEFAULT_SELECTED_IDS`, `MOCK_PAST_ANSWERS`, the in-memory maps, `resetMockSupportPerson`, `resetMockSupportedPlans` and the copied `run`; grep must find none. Update `docs/support-person.md` (§4.1 table: P2, P4, P5, P6, B5 and B4 (Care Planner only) done; P1, P3 and B2 are already done; §4.2 steps done; §4.4 answered questions; record S2–S6 outcomes), `docs/testing.md` (rows from 6.5, "Not automated" from 6.6) and `progress.md`. **Commit:** "Remove support person placeholder data and update the docs".

### Phase T6 — Full checks
**T6.1** `npm run typecheck`, `npm run lint`, `npm test`; push and confirm CI is green (`static-checks`, `unit-tests`, `database-tests` incl. types diff and `db lint`, `migrations-immutable`). Save the evidence in 6.7.

### Phase T7 — Manual QA with two real accounts
**T7.1** Patient `0491 570 006`, support person `0491 570 007`, code `123456`, `EXPO_PUBLIC_BYPASS_AUTH=false`; run `supabase db reset` on any local database older than the 14 Oct migrations.
1. The patient adds `0491 570 007` as a support person with "Add questions" only; the person signs up as a support person and sees the request with the patient's name; **Reject** hides it; the patient adds the number again and it reappears.
2. **Accept**: the patient card appears with the saved appointments only (no draft).
3. Each permission combination: none (view only), questions only, answers only, both. Buttons match `getAppointmentActions`.
4. A questions-only person cannot untick an answered question (message) and can add/remove unanswered ones; the patient sees the change after returning to the screen.
5. An answers-only person is blocked with the consent message until the patient signs; after signing, answers save and the patient sees them.
6. The patient changes the access (or deletes the person): the support person's next action fails with the friendly message and the patient disappears after a reload.
7. **Unpair** from People you support: the patient disappears; the patient's Settings shows Declined; the patient's appointments no longer list the person.
8. A third account (another patient) cannot see any of it.

---

## 6. Testing plan (CI-only, as in the earlier phases)

### 6.1 Strategy
Same rules as `docs/backend/testing-and-cicd.md` and `docs/testing.md`: **tests are written with every change, none of the database tests are run locally**. Jest, lint and typecheck may be run locally; pgTAP, `supabase db lint` and the generated-types diff run only in CI. Each rule is proved in the **lowest layer that can prove it**; every security rule (RLS, grants, function access) **must** have a pgTAP test. A migration and its pgTAP file go in the **same commit**. Keep each `.test.sql` small and give every assertion a descriptive message.

| Layer | What it proves here | Where | CI job |
|---|---|---|---|
| L0 Static | lint, types, generated types match the migrations, no merged migration edited | `ci.yml` | `static-checks`, `database-tests`, `migrations-immutable` |
| L1 Pure logic | error mapping (incl. the substring trap), friendly messages, row mappers, existing permission rules | `src/**/*.test.ts` beside the code | `unit-tests` |
| L2 Service | services call the right RPC with the right arguments, errors map | `src/services/support-person.test.ts` with a fake client | `unit-tests` |
| L3 Database | invitations, lockdown, per-permission access, immediate revocation | `supabase/tests/database/09N_*.test.sql` (pgTAP) | `database-tests` |
| L6 Manual | the two-account journey in T7.1 | checklist in the PR | n/a |

### 6.2 Existing tests that must stay green
`000_rls_enabled` (no new tables), `025_table_privileges`, `040_appointment_schema`, `060_profile_privileges`, `061_create_profile`, and the Care Planner's `080`–`088`. A10 changes policies that `020_pain_rls` and `040_appointment_schema` indirectly rely on (own-row reads still work). **If an existing test fails because of a new migration, STOP and show the owner** rather than editing it. Existing Jest tests: `permissions.test.ts`, `appointments.test.ts`, `greeting.test.ts` must pass unchanged.

### 6.3 Jest tests (add every new tested file to `collectCoverageFrom`)
| Source | Test | Must cover |
|---|---|---|
| `src/lib/errors.ts` | `errors.test.ts` (extend) | `NOT_A_SUPPORT_PERSON`, `NO_QUESTIONS_PERMISSION`, `NO_ANSWERS_PERMISSION` are `NOT_ALLOWED` and **not** `VALIDATION` (the substring trap); `NO_QUESTIONS` still `VALIDATION`; `REQUEST_NOT_FOUND`, `PATIENT_NOT_FOUND`, `APPOINTMENT_NOT_FOUND` are `NOT_FOUND` with the message kept |
| `src/features/care-planner/messages.ts` | `messages.test.ts` (extend) | the new codes have friendly text; none leaks raw database text |
| `src/features/support-person/mappers.ts` | `mappers.test.ts` | id strings, empty condition, request has no appointments, grouping by patient, dates unchanged |
| `src/services/support-person.ts` | `support-person.test.ts` (rewrite) | see below |
| `context.test.tsx`, `useSupportedAppointmentQuestions.test.ts` | adjusted | nothing imports `resetMock*` |

**Service tests** start with `jest.mock('@/lib/supabase', () => ({ supabase: {} }));` and inject a fake client (`rpc: jest.fn().mockResolvedValue({ data, error })`), as in `src/services/care-planner.test.ts`. For **each** service function:
1. happy path returns the mapped value (patients with their appointments, requests with none, the plan with only selected questions);
2. the RPC name and every `p_*` argument are exactly as in section 4; the request/patient id is sent as a number; **no user or patient identity beyond that id is ever sent**;
3. each database error maps: `NO_QUESTIONS_PERMISSION` and `NO_ANSWERS_PERMISSION` → `NOT_ALLOWED` with that message; `REQUEST_NOT_FOUND`, `PATIENT_NOT_FOUND`, `APPOINTMENT_NOT_FOUND` keep their message; `CONSENT_REQUIRED`; a network failure;
4. zero rows from `get_supported_appointment` becomes `APPOINTMENT_NOT_FOUND`;
5. `listSupportedPatients` makes both calls and groups appointments under the right patient; a patient with no appointments has an empty list;
6. `saveSupportedAnswers` sends `{ question_id, answer_text }` items and an empty answer clears;
7. dates pass through as the same local string.

### 6.4 pgTAP tests
Pattern (from `040_appointment_schema`, `061_create_profile` and the Care Planner's `080`–`088`):
```sql
begin;
create extension if not exists pgtap with schema extensions;
select plan(N);                       -- N must equal the exact number of assertions
-- fixtures as the superuser: auth.users, public.users (user_type + phone_number), patients, conditions
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '<uuid>', 'role', 'authenticated')::text, true);
-- ... assertions ...
reset role;
select * from finish();
rollback;
```
Count your assertions before you commit (a quick `grep -cE "^select (ok|lives_ok|throws_ok|has_function)\("` on the file works if every assertion starts a line).

**Translating Appendix C** (an executable script with two helpers, not pgTAP):
- `select t.assert(<boolean>, 'msg');` → `select ok(<boolean>, 'msg');`
- `select t.expect('CODE', <sql>);` → `select throws_ok(<sql>, 'P0001', 'CODE', 'msg');` (`<sql>` may be a `format(...)` expression, which `throws_ok` accepts; use `$$…$$` for static SQL)
- a bare setup call such as `select public.save_appointment(...)` → `select lives_ok($$select public.save_appointment(...)$$, 'msg');`
- `insert into ctx select …` setup statements stay as they are. Do not create the `t` schema.
- privilege checks use `has_function_privilege` (no role switch needed); keep the `anon` checks.
- Each file is its own transaction, so the same fixture UUIDs can be reused across files. Appendix C builds the patient's appointment through the Care Planner functions; that is fine because they are merged first.

| File | From | Must assert (every row is at least one assertion) |
|---|---|---|
| `090_support_link_state` | A9 | `status`/`responded_at` columns; status outside the three values → 23514; `accepted` without a login and a login without `accepted` → 23514; invitations start `pending` and unlinked; a new number resets an accepted person to `pending` and drops the login; re-adding a declined number → `pending`; the same name/phone for another patient is allowed |
| `091_support_person_table_access` | A10 | **an accepted support person sees 0 rows** in `appointment`, `appointment_questions`, `appointment_has_support_persons`, `patients`, `support_persons`, and only their own `users` row; their direct updates change 0 rows; the patient still reads and updates their own rows. *Keep the "accepted" setting: a pending person never matched the old policy, so only an accepted one proves the lockdown (the mutation check showed this).* |
| `092_support_person_functions` | A11 | requests visible only to the invited number, **with no `conditions` column** (S5); accept / reject / unpair and their errors (a **patient** calling them → `NOT_A_SUPPORT_PERSON`, a second accept → `REQUEST_NOT_FOUND`, a second unpair → `PATIENT_NOT_FOUND`); only saved appointments **the person was added to** (S2): a saved appointment they weren't added to is missing from `list_supported_appointments`, returns zero rows from `get_supported_appointment` and `list_supported_appointment_questions`, and gives `APPOINTMENT_NOT_FOUND` from both save functions; taking the person off an appointment ends access to it; `get_supported_appointment` returns zero rows for pending, draft, other patient; flags equal the access given; `NO_QUESTIONS_PERMISSION`, `NO_ANSWERS_PERMISSION` (including removing an answered question), `CONSENT_REQUIRED`, `QUESTION_NOT_ON_PLAN`, `NO_QUESTIONS`, `UNKNOWN_QUESTION`; the patient sees answers a supporter added; changing access, deleting the person, changing their number or unpairing takes effect immediately; unpair removes the appointment links and leaves the patient's row `declined`; `support_access` and `supports_appointment` are **not** executable by `authenticated` or `anon`; anon cannot execute any function |
| `097_settings_support_person_status` | T2.4 | a support person's export has `supported_patients` (accepted only, never a pending invitation); a patient's export is unchanged. (Deleting an accepted support person is covered by `096`, updated in T2.1b.) |

### 6.5 Traceability rows to add to `docs/testing.md`
(Same columns as the existing table; add them in step T5.1.)

| Rule or decision | Test that proves it | Layer | CI job |
|---|---|---|---|
| A support person sees an invitation only if their verified phone number was invited | `092_support_person_functions` | Database | `database-tests` |
| A support person must accept before seeing anything; reject and unpair end access at once | `092_support_person_functions`; `support-person.test.ts` | Database, Service | `database-tests`, `unit-tests` |
| Reject and unpair keep the patient's record as declined; re-adding the number invites again | `090_support_link_state`; `092_support_person_functions` | Database | `database-tests` |
| **A support person cannot read the patient's tables directly** (appointments, questions, patient row, user row, invitation row) | `091_support_person_table_access` | Database | `database-tests` |
| A support person sees only saved appointments and never the consent signature | `092_support_person_functions` | Database | `database-tests` |
| A support person sees only the appointments the patient added them to (S2) | `092_support_person_functions` | Database | `database-tests` |
| A pending request shows the patient's name but never their conditions (S5) | `092_support_person_functions`; `mappers.test.ts` | Database, Unit | `database-tests`, `unit-tests` |
| A support person can change questions only with "Add questions" and answers only with "Add doctor's answer"; removing an answered question needs both | `092_support_person_functions`; `permissions.test.ts` | Database, Unit | `database-tests`, `unit-tests` |
| A doctor's answer from a support person also needs recording consent | `092_support_person_functions` | Database | `database-tests` |
| Changing a support person's access or number, or deleting them, takes effect immediately | `090_support_link_state`; `092_support_person_functions` | Database | `database-tests` |
| A support person cannot change their own access | `092_support_person_functions` (and the existing `support_persons_protect_access_type` trigger) | Database | `database-tests` |
| Support-person database errors map to app codes (permission errors are `NOT_ALLOWED`, never `VALIDATION`) and have friendly messages | `errors.test.ts`; `messages.test.ts` | Unit | `unit-tests` |
| The service sends the exact RPC arguments and maps rows, including patients with no appointments | `support-person.test.ts`; `mappers.test.ts` | Service, Unit | `unit-tests` |
| Database functions pass the Supabase linter; the generated types match the migrations; no merged migration is edited | CI steps `supabase db lint --local --fail-on error`, "Generated types match the migrations", job `migrations-immutable` | Static | `database-tests`, `migrations-immutable` |

### 6.6 Add to "Not automated" in `docs/testing.md`
- Screen rendering and navigation of the support-person app (no component tests): checked by the manual list in T7.1.
- That the answer box is disabled until consent is given and the empty-condition layout (UI behaviour; the database rule is tested).
- Real SMS delivery of a support person's sign-in code (test OTP numbers send nothing).
- Two people editing the same plan at once: last save wins (not tested; noted in `docs/support-person.md` §5).

### 6.7 Evidence to capture
- `supabase test db` passing with files `090`–`092` and `097`: `docs/screenshots/db-tests-support-person.png` (**TODO**, from the CI run).
- `npm test` passing: `docs/screenshots/unit-tests-support-person.png` (**TODO**).
- Green CI on the pull request, including the types diff, `db lint` and `migrations-immutable`: `docs/screenshots/ci-support-person.png` (**TODO**).
- The two-account journey (T7.1) written up in the PR description with the result of each numbered check.

### 6.8 CI things to expect
- The first push of each migration **fails the types diff**; copy the generated file from the log or artifact and commit it (guardrail 6).
- `supabase db lint --local --fail-on error` lints the plpgsql in A11. If it reports an error, show the owner the fix before changing the file.
- Check the Actions run (`gh pr checks <n> --watch`, `gh run view --log-failed`; the `gh` CLI may not be installed, in which case read the run in the browser) and fix in a **new commit** (do not amend after pushing).

---

## 7. Requirements traceability
| Requirement | Where |
|---|---|
| Patient invites a support person with an access level (US18, requirement 2.2.2) | Care Planner (support person migrations and services); A9 |
| Support person accepts or declines a request; can unpair | A9, A11, T3.1 |
| Support person views the patient's appointment plan | A11, T3.1 |
| Support person adds questions / doctor's answers only within the access given | A11, T1.1, T4 |
| A support person sees only the people who invited them | A10, A11, tests 091/092 |

---

## Appendix A — Migration SQL (tested)
One migration per file, in order. This is what was executed, **except the Revision 3 changes in A11** (the `supports_appointment` helper and its four uses for S2, and no `conditions` in `list_my_support_requests` for S5), which have not been run yet. A9 follows the Care Planner's migrations. **Name the files with `supabase migration new <name>` so the timestamps sort after `20261027013340`.**

### A9 — support_link_state (`09_support_link_state.sql`)
```sql
-- Rollback:
--   drop index public.idx_support_persons_phone;
--   alter table public.support_persons
--     drop constraint chk_support_persons_status,
--     drop constraint chk_support_persons_link,
--     drop column responded_at,
--     drop column status;
--   (then restore save_support_person from the previous migration)

-- A patient's invitation to a support person has three states. The person sees an invitation
-- ("request") while it is pending and the patient's data only once they accept.
alter table public.support_persons
  add column status text not null default 'pending',
  add column responded_at timestamptz;

update public.support_persons
   set status = case when users_id is not null then 'accepted' else 'pending' end;

alter table public.support_persons
  add constraint chk_support_persons_status check (status in ('pending', 'accepted', 'declined')),
  -- accepted means linked to a login, and only then
  add constraint chk_support_persons_link check ((status = 'accepted') = (users_id is not null));

-- Invitations are found by the signed-in person's phone number.
create index idx_support_persons_phone on public.support_persons (phone_number)
  where phone_number is not null;

-- The patient adds or edits a support person. Adding someone who declined invites them again.
-- Changing an accepted person's phone number makes it a new invitation (a different person).
create or replace function public.save_support_person(
  p_name text,
  p_phone text,
  p_email text,
  p_access_type text,
  p_support_person_id int default null
)
returns public.support_persons
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_users_id integer := public.current_users_id();
  v_patient_id integer := public.patient_id_for_user(public.current_users_id());
  v_name text := btrim(p_name);
  v_phone text := nullif(btrim(p_phone), '');
  v_email text := nullif(btrim(p_email), '');
  v_row public.support_persons;
begin
  if v_users_id is null then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_patient_id is null then
    raise exception 'NOT_A_PATIENT' using errcode = 'P0001';
  end if;
  if v_name is null or v_name = '' then
    raise exception 'INVALID_SUPPORT_PERSON' using errcode = 'P0001';
  end if;
  if char_length(v_name) > 100 or char_length(v_email) > 254 then
    raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
  end if;
  if v_phone is not null and v_phone !~ '^\+614[0-9]{8}$' then
    raise exception 'INVALID_PHONE' using errcode = 'P0001';
  end if;
  if p_access_type is null
     or p_access_type not in ('none', 'questions', 'answers', 'questions,answers') then
    raise exception 'INVALID_ACCESS_TYPE' using errcode = 'P0001';
  end if;

  if p_support_person_id is null then
    insert into public.support_persons (patient_id, name, phone_number, email, access_type)
    values (v_patient_id, v_name, v_phone, v_email, p_access_type)
    on conflict (patient_id, phone_number) where phone_number is not null
    do update set name = excluded.name,
                  email = excluded.email,
                  access_type = excluded.access_type,
                  status = case when public.support_persons.status = 'declined'
                                then 'pending' else public.support_persons.status end,
                  responded_at = case when public.support_persons.status = 'declined'
                                      then null else public.support_persons.responded_at end
    returning * into v_row;
  else
    if v_phone is not null and exists (
      select 1 from public.support_persons
       where patient_id = v_patient_id
         and phone_number = v_phone
         and support_person_id <> p_support_person_id
    ) then
      raise exception 'DUPLICATE_SUPPORT_PERSON' using errcode = 'P0001';
    end if;
    update public.support_persons sp
       set name = v_name,
           phone_number = v_phone,
           email = v_email,
           access_type = p_access_type,
           -- a new number is a different person: invite again, and drop the old login link
           status = case when sp.phone_number is distinct from v_phone then 'pending' else sp.status end,
           users_id = case when sp.phone_number is distinct from v_phone then null else sp.users_id end,
           responded_at = case when sp.phone_number is distinct from v_phone then null else sp.responded_at end
     where sp.support_person_id = p_support_person_id
       and sp.patient_id = v_patient_id
    returning * into v_row;
    if not found then
      raise exception 'NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  return v_row;
end;
$$;
```

### A10 — restrict_support_person_table_access (`10_restrict_support_person_table_access.sql`)
```sql
-- Rollback: recreate each policy below with can_access_patient(...) (or, for users_select, its
-- previous is_support_person_for_patient clause) as in the 20260902 remote_schema migration.

-- Support persons do not read or write tables directly. They use the functions in the next
-- migration, which return only what the Care Planner needs and check the patient's permissions.
-- Until now these policies let any linked support person read the patient's whole appointment,
-- questions, patient row and user row (including phone number) whatever access they were given.

drop policy appointment_select on public.appointment;
create policy appointment_select on public.appointment
  for select to authenticated using (public.is_own_patient_record(patient_id));

drop policy ahsp_select on public.appointment_has_support_persons;
create policy ahsp_select on public.appointment_has_support_persons
  for select to authenticated using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_has_support_persons.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy aq_select on public.appointment_questions;
create policy aq_select on public.appointment_questions
  for select to authenticated using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy aq_insert on public.appointment_questions;
create policy aq_insert on public.appointment_questions
  for insert to authenticated with check (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy aq_update on public.appointment_questions;
create policy aq_update on public.appointment_questions
  for update to authenticated
  using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)))
  with check (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy aq_delete on public.appointment_questions;
create policy aq_delete on public.appointment_questions
  for delete to authenticated using (exists (
    select 1 from public.appointment a
     where a.appointment_id = appointment_questions.appointment_id
       and public.is_own_patient_record(a.patient_id)));

drop policy patients_select on public.patients;
create policy patients_select on public.patients
  for select to authenticated using (public.is_own_patient_record(patient_id));

drop policy users_select on public.users;
create policy users_select on public.users
  for select to authenticated using (auth_id = auth.uid());

-- A support person must not read or change the patient's invitation row (it holds the access
-- they were given). They answer an invitation through the functions in the next migration.
drop policy support_persons_select on public.support_persons;
create policy support_persons_select on public.support_persons
  for select to authenticated using (public.is_own_patient_record(patient_id));

drop policy support_persons_update on public.support_persons;
create policy support_persons_update on public.support_persons
  for update to authenticated
  using (public.is_own_patient_record(patient_id))
  with check (public.is_own_patient_record(patient_id));
```
*Note:* the Care Planner's `ahsp_delete` and (replaced) `ahsp_insert` policies already restrict to the owning patient; do not drop or recreate them here.

### A11 — support_person_functions (`11_support_person_functions.sql`)
```sql
-- Rollback:
--   drop function public.save_supported_answers(int, jsonb);
--   drop function public.save_supported_questions(int, int[]);
--   drop function public.list_supported_appointment_questions(int);
--   drop function public.get_supported_appointment(int);
--   drop function public.unpair_from_patient(int);
--   drop function public.reject_support_request(int);
--   drop function public.accept_support_request(int);
--   drop function public.list_supported_appointments();
--   drop function public.list_supported_patients();
--   drop function public.list_my_support_requests();
--   drop function public.supports_appointment(int);
--   drop function public.support_access(int, text);

-- These functions are `security definer` on purpose: the support person is not allowed to read
-- the patient's tables (previous migration), so the functions read them on their behalf. Each one
--   * works out the caller from auth.uid() (never from an argument),
--   * only ever returns rows for patients who invited that caller's phone number, and
--   * returns only the columns the Care Planner shows.

-- True when the signed-in support person has accepted this patient, and (optionally) the patient
-- gave them the access `p_token` ('questions' or 'answers'). Not callable from the app.
create function public.support_access(p_patient_id int, p_token text default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.support_persons sp
      join public.users u on u.users_id = sp.users_id
     where sp.patient_id = p_patient_id
       and sp.status = 'accepted'
       and u.auth_id = auth.uid()
       and u.user_type = 'support_person'
       and (p_token is null or p_token = any (string_to_array(sp.access_type, ',')))
  );
$$;
revoke all on function public.support_access(int, text) from public, anon, authenticated;

-- Decision S2: true when the signed-in support person has accepted and the patient added them to
-- this appointment. Taking them off the appointment ends their access to it. Not callable from the app.
create function public.supports_appointment(p_appointment_id int)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.appointment_has_support_persons l
      join public.support_persons sp on sp.support_person_id = l.support_person_id
      join public.users u on u.users_id = sp.users_id
     where l.appointment_id = p_appointment_id
       and sp.status = 'accepted'
       and u.auth_id = auth.uid()
       and u.user_type = 'support_person'
  );
$$;
revoke all on function public.supports_appointment(int) from public, anon, authenticated;

-- Invitations sent to the signed-in person's phone number and not answered yet.
-- Decision S5: only the patient's name. Their conditions appear once the request is accepted, so a
-- mistyped number never shows a stranger someone's health conditions.
create function public.list_my_support_requests()
returns table (
  patient_id integer,
  patient_name text,
  can_add_questions boolean,
  can_add_answers boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select p.patient_id,
         pu.name::text,
         'questions' = any (string_to_array(sp.access_type, ',')),
         'answers' = any (string_to_array(sp.access_type, ','))
    from public.users me
    join public.support_persons sp on sp.phone_number = me.phone_number
    join public.patients p on p.patient_id = sp.patient_id
    join public.users pu on pu.users_id = p.users_id
   where me.auth_id = auth.uid()
     and me.user_type = 'support_person'
     and me.phone_number is not null
     and sp.status = 'pending'
   order by sp.support_person_id;
$$;

-- The patients the signed-in support person has accepted.
create function public.list_supported_patients()
returns table (
  patient_id integer,
  patient_name text,
  conditions text,
  can_add_questions boolean,
  can_add_answers boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select p.patient_id,
         pu.name::text,
         (select string_agg(distinct m.disease::text, ', ' order by m.disease::text)
            from public.patient_musko_skeletal_pain m where m.patient_id = p.patient_id),
         'questions' = any (string_to_array(sp.access_type, ',')),
         'answers' = any (string_to_array(sp.access_type, ','))
    from public.users me
    join public.support_persons sp on sp.users_id = me.users_id
    join public.patients p on p.patient_id = sp.patient_id
    join public.users pu on pu.users_id = p.users_id
   where me.auth_id = auth.uid()
     and me.user_type = 'support_person'
     and sp.status = 'accepted'
   order by pu.name, p.patient_id;
$$;

-- The saved appointments of every accepted patient that the patient added this person to.
-- Drafts are never shown. Decision S2: an appointment they weren't added to is not shown.
create function public.list_supported_appointments()
returns table (
  patient_id integer,
  appointment_id integer,
  date_time timestamp,
  practitioner_name varchar,
  health_service text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select a.patient_id, a.appointment_id, a.date_time, a.practitioner_name, a.health_service, a.status
    from public.users me
    join public.support_persons sp on sp.users_id = me.users_id
    join public.appointment a on a.patient_id = sp.patient_id
   where me.auth_id = auth.uid()
     and me.user_type = 'support_person'
     and sp.status = 'accepted'
     and a.status = 'saved'
     and exists (select 1 from public.appointment_has_support_persons l
                  where l.appointment_id = a.appointment_id
                    and l.support_person_id = sp.support_person_id)
   order by a.date_time, a.appointment_id;
$$;

-- Accepts an invitation and returns the patient now supported.
create function public.accept_support_request(p_patient_id int)
returns table (
  patient_id integer,
  patient_name text,
  conditions text,
  can_add_questions boolean,
  can_add_answers boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me public.users;
  v_id integer;
begin
  select * into v_me from public.users where auth_id = auth.uid();
  if not found then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_me.user_type <> 'support_person' then
    raise exception 'NOT_A_SUPPORT_PERSON' using errcode = 'P0001';
  end if;

  update public.support_persons sp
     set status = 'accepted', users_id = v_me.users_id, responded_at = now()
   where sp.patient_id = p_patient_id
     and sp.status = 'pending'
     and v_me.phone_number is not null
     and sp.phone_number = v_me.phone_number
  returning sp.support_person_id into v_id;
  if v_id is null then
    raise exception 'REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  return query select * from public.list_supported_patients() s where s.patient_id = p_patient_id;
end;
$$;

-- Turns an invitation down. The patient's record is kept (as declined) so the same person is not
-- asked again unless the patient adds them again.
create function public.reject_support_request(p_patient_id int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me public.users;
  v_id integer;
begin
  select * into v_me from public.users where auth_id = auth.uid();
  if not found then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_me.user_type <> 'support_person' then
    raise exception 'NOT_A_SUPPORT_PERSON' using errcode = 'P0001';
  end if;

  update public.support_persons sp
     set status = 'declined', responded_at = now()
   where sp.patient_id = p_patient_id
     and sp.status = 'pending'
     and v_me.phone_number is not null
     and sp.phone_number = v_me.phone_number
  returning sp.support_person_id into v_id;
  if v_id is null then
    raise exception 'REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;
end;
$$;

-- Stops supporting a patient: the person loses all access at once and is taken off the patient's
-- appointments. The patient's record stays, as declined.
create function public.unpair_from_patient(p_patient_id int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me public.users;
  v_id integer;
begin
  select * into v_me from public.users where auth_id = auth.uid();
  if not found then
    raise exception 'NO_PROFILE' using errcode = 'P0001';
  end if;
  if v_me.user_type <> 'support_person' then
    raise exception 'NOT_A_SUPPORT_PERSON' using errcode = 'P0001';
  end if;

  update public.support_persons sp
     set status = 'declined', users_id = null, responded_at = now()
   where sp.patient_id = p_patient_id
     and sp.status = 'accepted'
     and sp.users_id = v_me.users_id
  returning sp.support_person_id into v_id;
  if v_id is null then
    raise exception 'PATIENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  delete from public.appointment_has_support_persons where support_person_id = v_id;
end;
$$;

-- One supported appointment: details, whether recording consent was given (never the signature),
-- and what this person may change.
create function public.get_supported_appointment(p_appointment_id int)
returns table (
  appointment_id integer,
  patient_id integer,
  date_time timestamp,
  practitioner_name varchar,
  health_service text,
  status text,
  recording_consent_at timestamptz,
  suggestions_generated_on date,
  can_add_questions boolean,
  can_add_answers boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select a.appointment_id, a.patient_id, a.date_time, a.practitioner_name, a.health_service, a.status,
         a.recording_consent_at, a.suggestions_generated_on,
         public.support_access(a.patient_id, 'questions'),
         public.support_access(a.patient_id, 'answers')
    from public.appointment a
   where a.appointment_id = p_appointment_id
     and a.status = 'saved'
     and public.support_access(a.patient_id)
     and public.supports_appointment(a.appointment_id);
$$;

-- Every question stored for a supported appointment, with which are on the plan and any answer.
create function public.list_supported_appointment_questions(p_appointment_id int)
returns table (
  question_id integer,
  group_key text,
  sort_order smallint,
  question varchar,
  is_selected boolean,
  answer text
)
language sql
stable
security definer
set search_path = public
as $$
  select q.question_id, q.group_key, q.sort_order, q.question, q.is_selected, q.answer
    from public.appointment a
    join public.appointment_questions q on q.appointment_id = a.appointment_id
   where a.appointment_id = p_appointment_id
     and a.status = 'saved'
     and public.support_access(a.patient_id)
     and public.supports_appointment(a.appointment_id)
   order by q.group_key, q.sort_order;
$$;

-- Sets the questions on a supported patient's plan. Needs the "Add questions" access. Taking an
-- answered question off the plan removes its answer, so that also needs "Add doctor's answer".
create function public.save_supported_questions(p_appointment_id int, p_question_ids int[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id integer;
  v_ids int[] := coalesce(p_question_ids, '{}'::int[]);
begin
  if auth.uid() is null then
    raise exception 'NO_SESSION' using errcode = 'P0001';
  end if;
  select a.patient_id into v_patient_id
    from public.appointment a
   where a.appointment_id = p_appointment_id and a.status = 'saved';
  if v_patient_id is null
     or not public.support_access(v_patient_id)
     or not public.supports_appointment(p_appointment_id) then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not public.support_access(v_patient_id, 'questions') then
    raise exception 'NO_QUESTIONS_PERMISSION' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from unnest(v_ids) as i
     where not exists (
       select 1 from public.appointment_questions q
        where q.appointment_id = p_appointment_id and q.question_id = i
     )
  ) then
    raise exception 'UNKNOWN_QUESTION' using errcode = 'P0001';
  end if;
  if cardinality(v_ids) = 0
     and exists (select 1 from public.appointment_questions where appointment_id = p_appointment_id) then
    raise exception 'NO_QUESTIONS' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.appointment_questions q
     where q.appointment_id = p_appointment_id
       and q.answer is not null
       and not (q.question_id = any (v_ids))
  ) and not public.support_access(v_patient_id, 'answers') then
    raise exception 'NO_ANSWERS_PERMISSION' using errcode = 'P0001';
  end if;

  update public.appointment_questions
     set is_selected = (question_id = any (v_ids)),
         answer = case when question_id = any (v_ids) then answer else null end
   where appointment_id = p_appointment_id;
end;
$$;

-- Saves the doctor's answers (plain text) for a supported patient. Needs the "Add doctor's
-- answer" access, and the patient must have given recording consent first.
create function public.save_supported_answers(p_appointment_id int, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment public.appointment;
  v_item jsonb;
  v_question_id integer;
  v_text text;
begin
  if auth.uid() is null then
    raise exception 'NO_SESSION' using errcode = 'P0001';
  end if;
  select * into v_appointment
    from public.appointment a
   where a.appointment_id = p_appointment_id and a.status = 'saved';
  if not found
     or not public.support_access(v_appointment.patient_id)
     or not public.supports_appointment(p_appointment_id) then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not public.support_access(v_appointment.patient_id, 'answers') then
    raise exception 'NO_ANSWERS_PERMISSION' using errcode = 'P0001';
  end if;
  if p_answers is null
     or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) not between 1 and 60 then
    raise exception 'INVALID_ANSWER' using errcode = 'P0001';
  end if;

  for v_item in select e from jsonb_array_elements(p_answers) e loop
    if jsonb_typeof(v_item) <> 'object'
       or coalesce(v_item->>'question_id', '') !~ '^[0-9]{1,9}$' then
      raise exception 'INVALID_ANSWER' using errcode = 'P0001';
    end if;
    v_question_id := (v_item->>'question_id')::int;
    v_text := nullif(btrim(coalesce(v_item->>'answer_text', '')), '');
    if char_length(v_text) > 4000 then
      raise exception 'VALUE_TOO_LONG' using errcode = 'P0001';
    end if;
    if v_text is not null and v_appointment.recording_consent_at is null then
      raise exception 'CONSENT_REQUIRED' using errcode = 'P0001';
    end if;

    update public.appointment_questions
       set answer = v_text
     where appointment_id = p_appointment_id
       and question_id = v_question_id
       and is_selected;
    if not found then
      raise exception 'QUESTION_NOT_ON_PLAN' using errcode = 'P0001';
    end if;
  end loop;
end;
$$;

revoke all on function public.list_my_support_requests() from public, anon;
grant execute on function public.list_my_support_requests() to authenticated;
revoke all on function public.list_supported_patients() from public, anon;
grant execute on function public.list_supported_patients() to authenticated;
revoke all on function public.list_supported_appointments() from public, anon;
grant execute on function public.list_supported_appointments() to authenticated;
revoke all on function public.accept_support_request(int) from public, anon;
grant execute on function public.accept_support_request(int) to authenticated;
revoke all on function public.reject_support_request(int) from public, anon;
grant execute on function public.reject_support_request(int) to authenticated;
revoke all on function public.unpair_from_patient(int) from public, anon;
grant execute on function public.unpair_from_patient(int) to authenticated;
revoke all on function public.get_supported_appointment(int) from public, anon;
grant execute on function public.get_supported_appointment(int) to authenticated;
revoke all on function public.list_supported_appointment_questions(int) from public, anon;
grant execute on function public.list_supported_appointment_questions(int) to authenticated;
revoke all on function public.save_supported_questions(int, int[]) from public, anon;
grant execute on function public.save_supported_questions(int, int[]) to authenticated;
revoke all on function public.save_supported_answers(int, jsonb) from public, anon;
grant execute on function public.save_supported_answers(int, jsonb) to authenticated;
```

---

## Appendix C — Support-person behaviour test (executed and passing before Revision 3)
Requires the Care Planner's migrations and A9–A11. Translate into `090`–`092` using the rules in 6.4. Lines and messages marked `R3` were added for decisions S2 and S5 and **have not been run**. The mutation check (re-creating the old policy makes "accepted C reads no appointments directly" fail) is the reason those assertions exist: keep them.

```sql
begin;
create schema t;
grant usage on schema t to authenticated;
create function t.expect(p_code text, p_sql text) returns void language plpgsql as $$
begin
  execute p_sql;
  raise exception 'EXPECTED % BUT SUCCEEDED: %', p_code, p_sql;
exception when sqlstate 'P0001' then
  if sqlerrm <> p_code then raise exception 'EXPECTED % GOT %: %', p_code, sqlerrm, p_sql; end if;
end $$;
create function t.assert(p_ok boolean, p_msg text) returns void language plpgsql as $$
begin if not coalesce(p_ok,false) then raise exception 'ASSERT FAILED: %', p_msg; end if; end $$;
grant execute on all functions in schema t to authenticated;

-- fixtures: A, B patients; C, D support persons (C +61491570007, D +61491570008)
insert into auth.users (id) values
 ('00000000-0000-0000-0000-00000000000a'),('00000000-0000-0000-0000-00000000000b'),
 ('00000000-0000-0000-0000-00000000000c'),('00000000-0000-0000-0000-00000000000d');
insert into public.users (name, auth_id, user_type, phone_number) values
 ('Alice','00000000-0000-0000-0000-00000000000a','patient','+61491570006'),
 ('Bob','00000000-0000-0000-0000-00000000000b','patient','+61491570009'),
 ('Cara','00000000-0000-0000-0000-00000000000c','support_person','+61491570007'),
 ('Dan','00000000-0000-0000-0000-00000000000d','support_person','+61491570008');
insert into public.patients (sex, users_id) select 'Female', users_id from public.users where user_type='patient';
insert into public.patient_musko_skeletal_pain (patient_id, disease)
 select patient_id, 'Arthritis' from public.patients p join public.users u using (users_id) where u.name='Alice';

create temp table ctx (k text primary key, v int);
grant all on ctx to authenticated;
set local role authenticated;

-- ===== A prepares an appointment, invites C (questions) and D (answers) =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
insert into ctx select 'appt', public.save_appointment_details('2026-11-05 14:30','Dr Lee','GP');
insert into ctx select 'draft', public.save_appointment_details('2026-12-05 14:30','Dr Draft','GP');
select public.save_appointment_suggestions((select v from ctx where k='appt'), current_date,
  '[{"group_key":"pain-location","question":"Q1"},{"group_key":"pain-location","question":"Q2"},{"group_key":"management","question":"Q3"}]');
select public.save_appointment_questions((select v from ctx where k='appt'),
  (select array_agg(question_id) from public.appointment_questions where question in ('Q1','Q2')));
select public.save_appointment((select v from ctx where k='appt'));
-- R3 (S2): a saved appointment nobody was added to
insert into ctx select 'unlinked', public.save_appointment_details('2026-11-20 09:00','Dr Other','GP');
select public.save_appointment((select v from ctx where k='unlinked'));
select * from public.save_appointment_support_people((select v from ctx where k='appt'),
  '[{"name":"Cara","phone":"+61491570007","access_type":"questions"},{"name":"Dan","phone":"+61491570008","access_type":"answers"}]');
select t.assert((select count(*)=2 and bool_and(status='pending' and users_id is null) from public.support_persons), 'invitations start pending and unlinked');

-- ===== C: sees the request, nothing else yet =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select t.assert((select count(*)=1 from public.list_my_support_requests()), 'C sees one request');
select t.assert((select patient_name='Alice' and can_add_questions and not can_add_answers from public.list_my_support_requests()), 'R3 (S5): request shows the name and C''s access only');
select t.assert((select count(*)=0 from public.list_supported_patients()), 'no supported patients before accepting');
select t.assert((select count(*)=0 from public.list_supported_appointments()), 'no appointments before accepting');
select t.assert((select count(*)=0 from public.get_supported_appointment((select v from ctx where k='appt'))), 'pending person cannot open the appointment');
select t.expect('APPOINTMENT_NOT_FOUND', format('select public.save_supported_questions(%s, array[1])', (select v from ctx where k='appt')));
-- direct table access is closed
select t.assert((select count(*)=0 from public.appointment), 'C reads no appointments directly');
select t.assert((select count(*)=0 from public.appointment_questions), 'C reads no questions directly');
select t.assert((select count(*)=0 from public.patients), 'C reads no patients directly');
select t.assert((select count(*)=0 from public.support_persons), 'C reads no support_persons rows directly');
select t.assert((select count(*)=1 and bool_and(name='Cara') from public.users), 'C sees only their own users row');
do $$ declare n int; begin
  update public.support_persons set access_type='questions,answers'; get diagnostics n = row_count;
  if n <> 0 then raise exception 'C updated % support_persons rows', n; end if; end $$;
-- patient-only functions refuse a support person
select t.expect('NOT_A_PATIENT', 'select public.save_appointment_details(now()::timestamp, null, null)');
select t.expect('NOT_FOUND', format('select public.save_appointment(%s)', (select v from ctx where k='appt')));
select t.assert((select count(*)=0 from public.list_my_appointments()), 'C has no patient appointments');
-- accept errors
select t.expect('REQUEST_NOT_FOUND', 'select * from public.accept_support_request(999999)');
select * from public.accept_support_request((select patient_id from public.list_my_support_requests()));
select t.assert((select count(*)=0 from public.list_my_support_requests()), 'request gone after accepting');
select t.assert((select count(*)=1 and bool_and(can_add_questions and not can_add_answers) from public.list_supported_patients()), 'accepted patient listed with access');
select t.assert((select conditions='Arthritis' from public.list_supported_patients()), 'R3 (S5): conditions appear once accepted');
select t.expect('REQUEST_NOT_FOUND', format('select * from public.accept_support_request(%s)', (select patient_id from public.list_supported_patients())));

-- an accepted support person still has no direct table access (only the functions)
select t.assert((select count(*)=0 from public.appointment), 'accepted C reads no appointments directly');
select t.assert((select count(*)=0 from public.appointment_questions), 'accepted C reads no questions directly');
select t.assert((select count(*)=0 from public.appointment_has_support_persons), 'accepted C reads no links directly');
select t.assert((select count(*)=0 from public.patients), 'accepted C reads no patients directly');
select t.assert((select count(*)=0 from public.support_persons), 'accepted C reads no invitation rows directly');
select t.assert((select count(*)=1 and bool_and(name='Cara') from public.users), 'accepted C still sees only their own users row');
do $$ declare n int; begin
  update public.appointment_questions set answer='sneaky'; get diagnostics n = row_count;
  if n <> 0 then raise exception 'accepted C updated % question rows directly', n; end if;
  update public.support_persons set access_type='questions,answers'; get diagnostics n = row_count;
  if n <> 0 then raise exception 'accepted C updated % invitation rows directly', n; end if; end $$;

-- ===== C: appointments (saved only) =====
select t.assert((select count(*)=1 and bool_and(status='saved') from public.list_supported_appointments()), 'R3 (S2): C sees only the saved appointment they were added to, not the draft or the unlinked one');
select t.assert((select count(*)=0 from public.get_supported_appointment((select v from ctx where k='draft'))), 'draft appointment not openable');
select t.assert((select count(*)=0 from public.get_supported_appointment((select v from ctx where k='unlinked'))), 'R3 (S2): an appointment C was not added to is not openable');
select t.expect('APPOINTMENT_NOT_FOUND', format('select public.save_supported_questions(%s, array[1])', (select v from ctx where k='unlinked')));
select t.assert((select recording_consent_at is null and can_add_questions and not can_add_answers and practitioner_name='Dr Lee'
  from public.get_supported_appointment((select v from ctx where k='appt'))), 'details and access flags');
select t.assert((select count(*)=3 from public.list_supported_appointment_questions((select v from ctx where k='appt'))), 'C sees all stored questions');

-- C (questions only): can change the plan, cannot touch answers
select public.save_supported_questions((select v from ctx where k='appt'),
  (select array_agg(question_id) from public.list_supported_appointment_questions((select v from ctx where k='appt')) where question in ('Q1','Q3')));
select t.assert((select array_agg(question order by question) = array['Q1','Q3']::varchar[] from public.list_supported_appointment_questions((select v from ctx where k='appt')) where is_selected), 'C changed the plan');
select t.expect('NO_QUESTIONS', format('select public.save_supported_questions(%s, ''{}''::int[])', (select v from ctx where k='appt')));
select t.expect('UNKNOWN_QUESTION', format('select public.save_supported_questions(%s, array[999999])', (select v from ctx where k='appt')));
select t.expect('NO_ANSWERS_PERMISSION', format('select public.save_supported_answers(%s, ''[{"question_id":1,"answer_text":"x"}]'')', (select v from ctx where k='appt')));

-- ===== D: not yet accepted; B (patient) and others cannot use support functions =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000b"}',true);
select t.expect('NOT_A_SUPPORT_PERSON', 'select * from public.accept_support_request(1)');
select t.assert((select count(*)=0 from public.list_supported_patients()), 'a patient supports nobody');
select t.assert((select count(*)=0 from public.list_my_support_requests()), 'a patient has no requests');

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select t.assert((select count(*)=1 and bool_and(can_add_answers and not can_add_questions) from public.list_my_support_requests()), 'D sees own request with own access');
select * from public.accept_support_request((select patient_id from public.list_my_support_requests()));

-- D (answers only): consent first, then answers; no question changes
select t.expect('NO_QUESTIONS_PERMISSION', format('select public.save_supported_questions(%s, array[1])', (select v from ctx where k='appt')));
select t.expect('CONSENT_REQUIRED', format('select public.save_supported_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'',(select question_id from public.list_supported_appointment_questions(%s) where question=''Q1''),''answer_text'',''hi'')))', (select v from ctx where k='appt'), (select v from ctx where k='appt')));

-- A signs consent
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select public.save_recording_consent((select v from ctx where k='appt'), '{"w":10,"h":10,"paths":["M1 1L2 2"]}');

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select t.assert((select recording_consent_at is not null from public.get_supported_appointment((select v from ctx where k='appt'))), 'D sees that consent was given');
select t.expect('QUESTION_NOT_ON_PLAN', format('select public.save_supported_answers(%s, jsonb_build_array(jsonb_build_object(''question_id'',(select question_id from public.list_supported_appointment_questions(%s) where question=''Q2''),''answer_text'',''no'')))', (select v from ctx where k='appt'), (select v from ctx where k='appt')));
select public.save_supported_answers((select v from ctx where k='appt'), jsonb_build_array(jsonb_build_object('question_id',(select question_id from public.list_supported_appointment_questions((select v from ctx where k='appt')) where question='Q1'),'answer_text','  Rest  ')));
select t.assert((select answer='Rest' from public.list_supported_appointment_questions((select v from ctx where k='appt')) where question='Q1'), 'D saved an answer');

-- C (questions only) cannot remove an answered question; can remove an unanswered one
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select t.expect('NO_ANSWERS_PERMISSION', format('select public.save_supported_questions(%s, (select array_agg(question_id) from public.list_supported_appointment_questions(%s) where question=''Q3''))', (select v from ctx where k='appt'), (select v from ctx where k='appt')));
select t.assert((select answer='Rest' from public.list_supported_appointment_questions((select v from ctx where k='appt')) where question='Q1'), 'blocked change kept the answer');

-- A patient sees what supporters added; B cannot see any of it
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select t.assert((select answer='Rest' from public.appointment_questions where question='Q1'), 'patient sees the answer D added');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000b"}',true);
select t.assert((select count(*)=0 from public.appointment_questions), 'B sees no questions');
select t.expect('APPOINTMENT_NOT_FOUND', format('select public.save_supported_questions(%s, array[1])', (select v from ctx where k='appt')));

-- ===== A changes access: effective immediately =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select public.save_support_person('Cara','+61491570007',null,'none',(select support_person_id from public.support_persons where name='Cara'));
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select t.expect('NO_QUESTIONS_PERMISSION', format('select public.save_supported_questions(%s, (select array_agg(question_id) from public.list_supported_appointment_questions(%s) where question in (''Q1'',''Q3'')))', (select v from ctx where k='appt'), (select v from ctx where k='appt')));
select t.assert((select not can_add_questions from public.list_supported_patients()), 'listing reflects new access');

-- R3 (S2): taking C off the appointment ends access to it at once
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select * from public.save_appointment_support_people((select v from ctx where k='appt'),
  jsonb_build_array(jsonb_build_object('support_person_id',(select support_person_id from public.support_persons where name='Dan'))));
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select t.assert((select count(*)=0 from public.list_supported_appointments()), 'R3 (S2): C off the appointment sees no appointments');
select t.assert((select count(*)=0 from public.get_supported_appointment((select v from ctx where k='appt'))), 'R3 (S2): C off the appointment cannot open it');
select t.assert((select count(*)=1 from public.list_supported_patients()), 'R3 (S2): C still supports the patient');

-- ===== unpair: access gone, links removed, patient can re-invite =====
select public.unpair_from_patient((select patient_id from public.list_supported_patients()));
select t.assert((select count(*)=0 from public.list_supported_patients()) and (select count(*)=0 from public.list_supported_appointments()), 'C has no access after unpairing');
select t.expect('APPOINTMENT_NOT_FOUND', format('select public.save_supported_answers(%s, ''[{"question_id":1,"answer_text":"x"}]'')', (select v from ctx where k='appt')));
select t.expect('PATIENT_NOT_FOUND', 'select public.unpair_from_patient(1)');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select t.assert((select status='declined' and users_id is null from public.support_persons where name='Cara'), 'patient record kept as declined');
select t.assert((select count(*)=1 from public.appointment_has_support_persons), 'only the other supporter stays linked to the appointment');
select public.save_support_person('Cara','+61491570007',null,'questions');
select t.assert((select status='pending' and access_type='questions' from public.support_persons where name='Cara'), 're-adding a declined person invites again');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c"}',true);
select public.reject_support_request((select patient_id from public.list_my_support_requests()));
select t.assert((select count(*)=0 from public.list_my_support_requests()), 'rejected invitation disappears');
select t.expect('REQUEST_NOT_FOUND', 'select public.reject_support_request(1)');

-- ===== phone change resets an accepted link; delete revokes at once =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select public.save_support_person('Dan','+61491570099',null,'answers',(select support_person_id from public.support_persons where name='Dan'));
select t.assert((select status='pending' and users_id is null from public.support_persons where name='Dan'), 'a new number resets Dan to a pending invitation');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select t.assert((select count(*)=0 from public.list_supported_patients()), 'D lost access when the number changed');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
select public.save_support_person('Dan','+61491570008',null,'answers',(select support_person_id from public.support_persons where name='Dan'));
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select * from public.accept_support_request((select patient_id from public.list_my_support_requests()));
select t.assert((select count(*)=1 from public.list_supported_patients()), 'D accepted again');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000a"}',true);
delete from public.support_persons where name='Dan';
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000d"}',true);
select t.assert((select count(*)=0 from public.list_supported_patients()), 'deleting the person revokes access immediately');

-- ===== anon and helper privileges =====
reset role;
select t.assert(not has_function_privilege('anon','public.accept_support_request(int)','execute'), 'anon cannot accept');
select t.assert(not has_function_privilege('anon','public.list_supported_patients()','execute'), 'anon cannot list');
select t.assert(not has_function_privilege('authenticated','public.support_access(int,text)','execute'), 'helper is not callable by the app');
select t.assert(not has_function_privilege('authenticated','public.supports_appointment(int)','execute'), 'R3 (S2): appointment helper is not callable by the app');
select t.assert(not exists (select 1 from pg_proc p cross join unnest(p.proargnames) n
  where p.proname = 'list_my_support_requests' and n = 'conditions'), 'R3 (S5): requests never return conditions');
select t.assert(has_function_privilege('authenticated','public.save_supported_answers(int,jsonb)','execute'), 'authenticated can save answers');
-- the link and status constraints
do $$ begin
  begin update public.support_persons set status='accepted' where users_id is null; raise exception 'accepted without a login allowed';
  exception when check_violation then null; end;
end $$;
select 'ALL SUPPORT BEHAVIOUR TESTS PASSED';
rollback;
```
