# Care Planner (patient side) — Back-end Build Plan

> **Scope: the patient's Care Planner only.** It replaces every stub in the patient Care Planner (list, appointment details, support person step, questions, review, consent, answers) and patient Settings > Support Persons with real Supabase-backed services. **It does not cover the support-person app** (`app/(support)`, `src/services/support-person.ts`): that is a separate plan, `support-person-backend-build-plan.md`, which starts after this one has merged.
> Mirrors `login-backend-build-plan.md`: guardrails, decisions register, phases, one commit per step, tests with each step.
> **This is the plan as it was handed over**, with two changes: Appendix A (migration SQL) and Appendix B (the behaviour script) are not repeated here, because that SQL now lives in `supabase/migrations/` and `supabase/tests/database/` (see section 7), and section 7 records what changed during implementation.

---

## 0. Guardrails

These add to `CLAUDE.md` and `docs/backend/testing-and-cicd.md`. Where they differ, **the stricter one wins**.

1. **Stop and ask on any open item (🟡, ❓, ⏳) in section 1 when the step that depends on it is reached.** Never invent column names, error codes or library behaviour. If the repo conflicts with this plan, stop and say so.
2. **Show the exact SQL and grants for each migration and wait for approval before writing the file.**
3. Never edit an existing migration. A new migration per change, each with its `-- Rollback:` comment, RLS enabled and explicit grants. `migrations-immutable` in CI enforces this.
4. **Functions are plpgsql, `security invoker`, `set search_path = public`, raise `P0001` with a message code, and end with `revoke all … from public, anon; grant execute … to authenticated`.** No `security definer` anywhere in this plan.
5. Never run `supabase start`, `supabase test db`, `supabase db push` or anything that needs Docker. CI runs the database tests. `npm run typecheck`, `npm run lint` and `npm test` are allowed and required before finishing each phase.
6. `src/types/database.ts` is **generated; never edit it by hand**. After each migration, push, let the "Generated types match the migrations" step fail, and commit the generated file from the CI log or artifact.
7. Always filter `public.users` by `auth_id`. Never trust a client-sent `patient_id` or `users_id`; the functions derive the caller from `auth.uid()`.
8. **Appointment date/time is LOCAL wall-clock** (`timestamp without time zone`). Never `toISOString()`, never UTC, never `timestamptz`.
9. Services return `Result<T>` through `run()`, map errors via `mapError` / `AppError`, take the Supabase client as the **last optional argument**. Reuse `run` from `@/lib/result`.
10. Pure modules never import `@/lib/supabase`, `react-native` or `expo-*`. Do not import from `app/` inside `src/`.
11. Service tests start with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))` and use fake clients. Add every new tested file to `collectCoverageFrom` in `jest.config.js`.
12. Do not run `npm run format` or Prettier over the repo (mixed line endings). Keep each file's existing endings; minimal diffs. Do not log phone numbers or identifiers.
13. **Work one phase at a time.** One commit per step. At the end of each phase: push, then summarise (one line per step, anything unsure, anything unverified, what CI should prove).
14. Keep `docs/backend/progress.md` current.
15. Branch `feature/care-planner-backend` from `main` after the support-person front-end branch has merged.
16. No audio is ever stored. The doctor's answers are text only (dictation is on-device).
17. Test OTP numbers are dev/local only. For manual QA use `0491 570 006` and a second patient account, code `123456`.
18. **Do not link a support person to a login** (never set `support_persons.users_id`, and add no accept/claim logic). Until the support-person plan's policy lockdown ships, any linked support person could read the patient's whole appointment, questions and profile rows. Linking, accepting and the support-person app belong to `support-person-backend-build-plan.md`.

---

## 1. Decisions register

### Settled
| # | Decision |
|---|---|
| D1 | Question generation is a **pure client-side TypeScript generator** (`src/features/care-planner/question-generation.ts`), output **snapshotted** into `appointment_questions` by `save_appointment_suggestions`. The server validates and stores; it does not generate. |
| D2 | The doctor's answers are **text only**. No audio, no storage bucket. |
| D3 | **Consent is enforced in the database.** A non-empty answer cannot be saved without `recording_consent_at` → `CONSENT_REQUIRED`. (The support-person plan applies the same rule to support persons.) |

### Design choices in this plan
| # | Choice | Why |
|---|---|---|
| D5 | All suggestions live in `appointment_questions` with `is_selected`; the plan is the selected subset. No new tables. | One numeric `questionId` for suggestion and plan; `000_rls_enabled` unaffected. |
| D6 | `appointment.status` = `draft` / `saved`; the list shows saved only. | Matches `markAppointmentSaved`. |
| D7 | The server clock records the consent time; the client no longer sends `consentedAt`. | Tamper-proof. |
| D8 | Support people are **patient-level rows** (`support_persons`), **linked per appointment** (`appointment_has_support_persons`, max **2**). The phone is an **E.164 Australian mobile** (`+614…`, the only numbers the app signs in with). Removing a person from an appointment unlinks only; deleting is done in Settings. | The number can later be matched to the person's verified login (support-person plan). |
| D9 | Minimum **one** question once suggestions exist (`NO_QUESTIONS`). Removing a question clears its answer. The suggestion snapshot is idempotent (the second call returns `false`). | Requirements; no orphan answers; safe retries. |

### Open items
| # | Item | Status |
|---|---|---|
| ❓ M1 | **Health service list** (`healthServiceOptions.ts`) is a placeholder. Figma also lists Osteopath and Pain Medicine Specialist. MHA must confirm. | Open. Placeholder list kept; step 6.4 blocked. |
| ❓ M2 | **Generation rule content** beyond the 17 design questions is proposed and needs MHA clinical review. Also the "average pain over the past two weeks" wording against single-week data. | Open. Only the design questions are implemented; conditions are marked PROPOSED in code. |
| ❓ M3 | **Generation gate:** currently "all five assessments completed" (`GENERATION_REQUIRES_ALL_ASSESSMENTS`). Confirm. | Open. Implemented as stated. |
| ❓ M4 | Data retention / account deletion. Appointment tables have no `on delete`, so deleting a patient fails while appointments exist. | Open, out of scope. |
| ❓ M5 | No server rule on past/future appointment dates. | Open, optional hardening. |
| ❓ M6 | Draft appointments are never cleaned up (no DELETE on `appointment`). | Open, optional hardening. |
| — | Out of scope: the support-person app and its back end, notifications/appointment reminders, device-contacts import, the embedded pain guide. | |

---

## 2. Phase map

| Phase | Goal | Steps |
|---|---|---|
| 0 | Branch, decisions, admin | 0.1–0.2 |
| 1 | Recon: confirm the repo matches this plan | 1.1–1.2 |
| 2 | Pure foundations (no database) | 2.1–2.6 |
| 3 | Migrations + pgTAP + generated types | 3.1–3.8 |
| 4 | Services rewrite, mocks removed | 4.1–4.5 |
| 5 | Settings > Support Persons | 5.1 |
| 6 | Front-end deltas | 6.1–6.6 |
| 7 | Stub removal | 7.1 |
| 8 | Docs, full checks, manual QA | 8.1–8.3 |

The support-person back end cannot start until Phase 3 is merged to `main`, and it reuses steps 2.1–2.3 (error codes, access-type helper, plan/suggestion mappers) and Phase 4 (for real two-account QA). Two things are shared and will conflict if both people edit them at once: `src/types/database.ts` (regenerated by CI after every migration) and migration timestamps (its migrations must sort after these).

---

## 3. Data model summary (after the migrations)

- `appointment`: + `status` (`draft`/`saved`, default `draft`), `saved_at`, `suggestions_generated_on date`. Check `(status='saved') = (saved_at is not null)`. Existing rows are backfilled to `saved`.
- `appointment_questions`: + `group_key` (`^[a-z]+(-[a-z]+)*$`), `sort_order smallint`, `is_selected boolean`. Constraints: question not blank; answer not blank and ≤ 4000 characters; `answer is null or is_selected`; `unique(appointment_id, group_key, sort_order)`.
- `support_persons`: phone/email nullable; name `varchar(100)`, email `varchar(254)`; phone `^\+614[0-9]{8}$`; `access_type` in `none | questions | answers | questions,answers`; unique partial index `(patient_id, phone_number)`. Nothing sets `users_id`.
- `appointment_has_support_persons`: FK `on delete cascade`; delete policy (own patient); trigger `ahsp_limit_two` (`TOO_MANY_SUPPORT_PEOPLE`); insert policy restricted to the patient's own support people (section 7).
- **Privileges:** grants on the three tables are explicit (the hosted project grants nothing today while local grants everything).
- **Existing policies are otherwise left as they are.** Several still call `can_access_patient`, which would let a *linked* support person read a patient's whole appointment, questions and profile. That is harmless while nothing links people (guardrail 18) and is fixed in the support-person plan before any linking ships. The functions here are patient-only and refuse a support person with `NOT_A_PATIENT`.

### Functions (security invoker; all `authenticated` only)
| Function | Returns | Error codes |
|---|---|---|
| `save_appointment_details(p_date_time, p_practitioner_name, p_health_service, p_appointment_id default null)` | `appointment_id` | `NO_PROFILE` `NOT_A_PATIENT` `NO_DATE_TIME` `VALUE_TOO_LONG` `NOT_FOUND` |
| `list_my_appointments()` | saved appointments | — |
| `save_appointment_suggestions(p_appointment_id, p_generated_on, p_questions jsonb)` | `boolean` (false = already stored) | `NOT_FOUND` `FUTURE_DATE` `INVALID_QUESTION` |
| `save_appointment_questions(p_appointment_id, p_question_ids int[])` | void | `NOT_FOUND` `UNKNOWN_QUESTION` `NO_QUESTIONS` |
| `save_support_person(p_name, p_phone, p_email, p_access_type, p_support_person_id default null)` | `support_persons` row | `INVALID_SUPPORT_PERSON` `VALUE_TOO_LONG` `INVALID_PHONE` `INVALID_ACCESS_TYPE` `DUPLICATE_SUPPORT_PERSON` `NOT_FOUND` |
| `save_appointment_support_people(p_appointment_id, p_people jsonb)` | `setof support_persons` | `TOO_MANY_SUPPORT_PEOPLE` `INVALID_SUPPORT_PERSON` `NOT_FOUND` and the above |
| `list_my_support_persons()` | `setof support_persons` | — |
| `save_recording_consent(p_appointment_id, p_signature text)` | `timestamptz` (server time) | `INVALID_SIGNATURE` `NOT_FOUND` |
| `save_appointment_answers(p_appointment_id, p_answers jsonb)` | void | `APPOINTMENT_NOT_SAVED` `INVALID_ANSWER` `CONSENT_REQUIRED` `QUESTION_NOT_ON_PLAN` `VALUE_TOO_LONG` `NOT_FOUND` |
| `save_appointment(p_appointment_id)` | void (idempotent) | `NOT_FOUND` `NO_QUESTIONS` |

`NOT_FOUND` is also what another patient's id returns, so existence is not leaked.

### Reads (PostgREST embedded select, RLS applies, patient side only)
`getAppointmentPlan` and `getQuestionSuggestions` read the `appointment` row with `appointment_questions(...)` and `appointment_has_support_persons(support_persons(...))` embedded. The signature is fetched only on the consent screen.

---

## 4. Steps

### Phase 0: Admin
**0.1 Branch.** After the support-person front-end branch has merged: branch `feature/care-planner-backend` from `main`.
**0.2 Read the decisions.** M1–M3 only gate the steps that name them.

### Phase 1: Recon
**1.1 Confirm the schema and policies** against section 3; if anything differs, stop and ask.
**1.2 Stub inventory** saved to `docs/backend/care-planner-stub-inventory.md`.

### Phase 2: Pure foundations (no database)
**2.1 Error codes and messages** (`src/lib/errors.ts`). Add `CONSENT_REQUIRED`; a `NOT_ALLOWED_MESSAGES` list (`NOT_A_PATIENT`) checked **before** the passthrough and validation lists, because the support-person plan adds `NO_QUESTIONS_PERMISSION`, which contains `NO_QUESTIONS` and the mapper matches with `includes`; the validation messages `NO_DATE_TIME`, `TOO_MANY_SUPPORT_PEOPLE`, `INVALID_SUPPORT_PERSON`, `UNKNOWN_QUESTION`, `QUESTION_NOT_ON_PLAN`, `NO_QUESTIONS`, `INVALID_SIGNATURE`, `INVALID_QUESTION`, `INVALID_ANSWER`, `APPOINTMENT_NOT_SAVED`, `INVALID_ACCESS_TYPE`, `DUPLICATE_SUPPORT_PERSON`.
**2.2 Access type and phone helpers** (`accessType.ts`, `supportPerson.ts`). Reuse `toE164`, `isValidAuMobile` and `formatForDisplay` from `@/features/auth/phone`. The support-person form validates mobiles only. `SupportPerson` gains `supportPersonId?`.
**2.3 Row mappers** (`mappers.ts`) over plain row shapes. Date strings stay as local `YYYY-MM-DDTHH:mm:ss`, with no `Date` round-trip.
**2.4 Signature guard** at 60000 characters.
**2.5 Question generator.** The 17 design questions in groups `pain-location`, `pain-intensity`, `pain-impact`, `management`; the preselected set is the stub's `[1,2,3,4,6,7,9,15]` expressed by template key. `GENERATION_REQUIRES_ALL_ASSESSMENTS = true` (M3). Anything beyond the design wording is marked `// PROPOSED — needs MHA clinical review (M2)`.
**2.6 Friendly messages** (`messages.ts`): one plain-English message per code, no raw database text.

### Phase 3: Migrations
One commit per migration, with its pgTAP file; after CI reports the types diff, the regenerated `src/types/database.ts`.

| Step | Migration | pgTAP file |
|---|---|---|
| 3.1 | `appointment_status` | `080_appointment_status` |
| 3.2 | `appointment_questions_plan_columns` | `081_appointment_questions` |
| 3.3 | `support_persons_align` | `082_support_persons` |
| 3.4 | `care_planner_privileges_policies` | `083_care_planner_privileges` |
| 3.5 | `rpc_appointment_details` | `084_rpc_appointment_details` |
| 3.6 | `rpc_suggestions_questions` | `085_rpc_questions` |
| 3.7 | `rpc_support_people` | `086_rpc_support_people` |
| 3.8 | `rpc_consent_answers_save` | `087_rpc_consent_answers` |

If A1/A2/A3's backfill or tidy-up statements would change **hosted** rows (they mark existing appointments `saved`, null non-conforming support-person phones, and set unknown access types to `none`), say so in the approval request. If any constraint fails on existing data, stop and ask; do not loosen it.

### Phase 4: Patient-side services (`src/services/care-planner.ts`)
Rewrite in place, delete the mock data and maps. Every function takes `client: Client = supabase` last and returns `Result<T>` via `run()`.
**4.1 Appointments.** **4.2 Support people** (`saveSupportPeople` returns the saved list so ids come back; at most two enforced client-side too). **4.3 Questions** (read the embedded questions; if none are stored, load the latest assessments, run the generator, call `save_appointment_suggestions` with the **local calendar date**, re-read). **4.4 Consent and answers** (the server time is returned; `CONSENT_REQUIRED` is its own `AppError`). **4.5 Tests** with fake clients.

### Phase 5: Settings > Support Persons
Replace the placeholder people with `listMySupportPersons` / `saveSupportPerson` / `deleteSupportPerson`; name `maxLength` 100; mobile validation; loading, error and empty states; `useMySupportPersons.ts` with a test.

### Phase 6: Front-end deltas
6.1 At least one question (disable Save, surface `NO_QUESTIONS`). 6.2 Cap of two support people. 6.3 Consent before answers. 6.4 Health service options (blocked on M1). 6.5 Planner "Explore questions" shortcut. 6.6 Types: `supportPersonId`, nullable `generatedOn`, local-format phones, the returned list used.

### Phase 7: Stub removal
Delete and confirm by grep (no matches): `MOCK_APPOINTMENTS`, `SAMPLE_SUPPORT_PEOPLE`, `MOCK_SUGGESTED_GROUPS`, `MOCK_DEFAULT_SELECTED_IDS`, `MOCK_DOCTOR_ANSWERS`, the in-memory maps, `clearMockCreatedAppointments`, `INITIAL_PEOPLE`.

### Phase 8: Docs, checks and QA
**8.1 Docs.** **8.2 Full checks** (`npm run typecheck`, `npm run lint`, `npm test`; push and confirm CI is green). **8.3 Manual QA** with two test patients (dev OTP numbers only):
1. Create an appointment: the draft is not in the list; finish the flow and it appears.
2. The date and time show the same wall-clock after a reload.
3. Questions are generated once; a reload shows the same questions and ids; deselecting all is blocked; deselecting one that has an answer removes the answer.
4. Support people: add two, a third is blocked; removing from the appointment keeps the person in Settings; the same number twice updates, no duplicate; a landline is rejected; saving the same two again works.
5. Answers are blocked until consent; after signing, answers save; the consent time is the server's.
6. Patient B cannot see or open patient A's appointment by id.
7. Dictation produces text only; nothing is uploaded.

---

## 5. Testing plan (CI-only)

### 5.1 Strategy
Tests are written with every change; none of the database tests are run locally. Jest, lint and typecheck may be run locally; pgTAP, `supabase db lint` and the generated-types diff run only in CI. Each rule is proved in the lowest layer that can prove it; every security rule (RLS, grants, function access) has a pgTAP test. A migration and its pgTAP file go in the same commit.

| Layer | What it proves | Where | CI job |
|---|---|---|---|
| L0 Static | lint, types, generated types match the migrations, no merged migration edited | `ci.yml` | `static-checks`, `database-tests`, `migrations-immutable` |
| L1 Pure logic | error mapping, access-type and phone conversion, row mappers, question generator, friendly messages, signature guard | `src/**/*.test.ts` | `unit-tests` |
| L2 Service | the right function and arguments, bad input never reaches Supabase, errors map, retries are safe | `src/services/*.test.ts` with a fake client | `unit-tests` |
| L3 Database | constraints, grants, RLS, function behaviour and atomicity, patient isolation | `supabase/tests/database/NNN_*.test.sql` | `database-tests` |
| L6 Manual | the two-patient journeys in 8.3 | checklist in the PR | n/a |

### 5.2 Existing tests that must stay green
`000_rls_enabled` (no new tables), `025_table_privileges`, `040_appointment_schema`, `060_profile_privileges`, `061_create_profile`. If one fails because of a new migration, stop and show the user rather than editing it.

### 5.3 Service tests
For each service function: the happy path returns the mapped value; bad input makes zero client calls; the function name and every `p_*` argument are exactly as in section 3 and **no `patient_id` or `users_id` is ever sent**; each database error code maps through `mapError`; `date_time` is passed and returned as the same local string; generation happens once and uses the local date; `saveSupportPeople` returns the saved people with ids; a lost-response retry of `save_appointment` succeeds.

### 5.4 pgTAP files
`080`–`087` as in Phase 3, plus `088_support_people_relink` (section 7). Pattern: `begin; create extension if not exists pgtap with schema extensions; select plan(N); …; select * from finish(); rollback;` where N equals the exact number of assertions.

### 5.5 Not automated
Screen rendering and navigation (no component tests); that Save is disabled with no question selected and the two-support-person limit hiding the form; the consent signature pad, the consent prompt on the review screen and the read-only Explore questions screen; dictation producing text only; real SMS delivery of sign-in codes.

### 5.6 Evidence to capture
Screenshots of `supabase test db` passing (`080`–`088`), `npm test` passing and green CI on the pull request, saved under `docs/screenshots/`, and the manual journey (8.3) written up in the PR description.

### 5.7 CI things to expect
The first push of each migration fails the types diff; copy the generated file from the log or artifact and commit it. `supabase db lint --local --fail-on error` lints the plpgsql; if it reports an error, show the user the fix before changing the file. Fix CI failures in a **new commit**.

---

## 6. Requirements traceability
| Requirement | Where |
|---|---|
| Appointment details (date, practitioner, service) | `save_appointment_details`, 4.1 |
| Suggested questions from the health profile | 2.5, `save_appointment_suggestions`, 4.3 |
| Select questions, minimum one | `save_appointment_questions`, 6.1 |
| Up to two support people per appointment, with access levels | support persons migrations, 6.2 |
| Doctor signs recording consent | `save_recording_consent`, 4.4 |
| Record the doctor's answers (text) | `save_appointment_answers`, 4.4, 6.3 |
| Review a saved plan / My Appointments | `list_my_appointments`, 4.1 |
| Privacy: a patient sees only their own data | privileges and policies, tests 081 and 083–088 |

---

## 7. What changed during implementation

- **Extra migration `support_people_relink_and_link_policy` (test `088_support_people_relink`).** The two-person trigger runs before `on conflict do nothing` can skip an existing link, so re-saving an appointment that already had two support people failed with `TOO_MANY_SUPPORT_PEOPLE`. `save_appointment_support_people` now inserts only the links that are missing. The same migration restricts the `ahsp_insert` policy so a link can only join a patient's own appointment to that patient's own support person.
- **Appointment details return only an id.** `createAppointment` and `updateAppointmentDetails` return `{ appointmentId }`, because the database function returns just the id.
- **Explore questions shortcut (6.5).** It opens a new read-only screen, `planner/explore-questions`, that shows the generated questions without an appointment and stores nothing.
- **Saved support people in the wizard.** The support person step offers the patient's saved support people (from Settings) so nobody has to be typed in twice.
- **No questions to choose.** When no questions can be generated yet (the generation gate is not met), the questions step continues without saving, instead of rejecting an empty selection.
- **One suggestions load at a time.** Two loads of the same appointment at once share one, so the default ticks are not lost.
- **`SupportPerson.status`** belongs to the support-person plan and is not added here.
- **Generated types were hand-written** for these migrations because Docker and the CI logs were not available; the CI types-diff step must confirm them.
- **Appendix A (migration SQL) and Appendix B (behaviour script)** are the migration files in `supabase/migrations/` and the pgTAP files `080`–`088`.
