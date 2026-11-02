# Support person stub inventory

Recon for `support-person-backend-build-plan.md` step T0.2. Taken from `feature/support-person-backend` at `473293a`
(`main` at `53efac8`, after the Settings back end merged).

## Recon: the repo matches section 0.2 and section 4

| Check | Result |
| --- | --- |
| The ten Care Planner migrations exist, up to `20261027013340_enforce_care_planner_rules` | Yes (10 files dated `20261027`) |
| The Settings migrations are in, so this branch's migrations sort after `20261029121213_delete_account` | Yes |
| `src/lib/errors.ts` has `NOT_ALLOWED_MESSAGES` (checked first) and `CONSENT_REQUIRED` | Yes (`['NOT_A_PATIENT']`) |
| `accessType.ts`, `mappers.ts`, `messages.ts`, `supportPerson.ts` in `src/features/care-planner/` with the exports section 0.2 names | Yes, including `SupportPersonRow`, `mapSupportPerson`, `mapAppointmentPlan`, `mapQuestionSuggestions`, `carePlannerMessage`, `MAX_SUPPORT_PEOPLE` |
| `SupportPerson` has no `status` yet (T1.2 adds it) | Yes |
| `save_support_person` is `(text, text, text, text, int)` returning `public.support_persons` (A9 keeps this) | Yes, defined once, in `20261027013040_rpc_support_people` |
| The ten policies A10 replaces exist under those names and are not dropped by any later migration | Yes |
| They still let a linked support person in (`can_access_patient`, `users_id = current_users_id()`, `is_support_person_for_patient`), which A10 closes | Yes |
| Trigger `support_persons_protect_access_type` exists and nothing drops it | Yes |

## Importers of `@/services/support-person`

| File | Imports |
| --- | --- |
| `src/features/support-person/context.tsx` | `listSupportedPatients`, `listSupportRequests`, `acceptSupportRequest`, `rejectSupportRequest`, `unpairFromPatient` |
| `src/features/support-person/useSupportedAppointmentPlan.ts` | `getSupportedAppointmentPlan` |
| `src/features/support-person/useSupportedAppointmentQuestions.ts` | `getSupportedQuestionSuggestions`, `saveSupportedQuestions` |
| `app/(support)/care-planner/appointment/[appointmentId]/index.tsx` | `saveSupportedAnswers` |
| `src/features/support-person/context.test.tsx` | the service (`* as service`), `MOCK_SUPPORT_REQUESTS`, `MOCK_SUPPORTED_PATIENTS` |
| `src/features/support-person/useSupportedAppointmentQuestions.test.ts` | the service (`* as service`) for `resetMockSupportPerson`, `resetMockSupportedPlans` |
| `src/services/support-person.test.ts` | the service, `resetMockSupportPerson`, `resetMockSupportedPlans` |

The exported function signatures stay the same in T3.1; only the client becomes the last optional argument.

## Placeholders to remove (T5.1)

In `src/services/support-person.ts`:
- `MOCK_SUPPORTED_PATIENTS`, `MOCK_SUPPORT_REQUESTS` (exported)
- `MOCK_SUGGESTED_GROUPS`, `MOCK_SUGGESTIONS_GENERATED_ON`, `MOCK_DEFAULT_SELECTED_IDS`, `MOCK_PAST_ANSWERS`
- the in-memory state: `patients`, `requests`, `selectedQuestionIds`, `doctorAnswers`, and the helpers built on them
- `resetMockSupportPerson()`, `resetMockSupportedPlans()` (exported)
- the copied `run` (line 83); use `run` from `@/lib/result`

Outside it, these use the placeholders and are rewritten in T3.2 / T4:
- `src/services/support-person.test.ts`
- `src/features/support-person/context.test.tsx` (uses `MOCK_*` for expected counts and ids)
- `src/features/support-person/useSupportedAppointmentQuestions.test.ts`

## Findings for later steps

- **`SupportRequest` wraps a whole patient:** `{ id, patient: SupportedPatient }`. So the T1.3 mapper builds
  `{ id: String(patient_id), patient: { id, name, condition: '', canAddQuestions, canAddAnswers, appointments: [] } }`.
  `condition` is `''` because `list_my_support_requests` returns no conditions (S5).
- **The request card already shows only the name.** `SupportRequestCard` renders "{name} has added you as a
  support person" and no condition, so S5 needs no screen change. Only A11 and the T1.3 mapper change.
- **Conditions are shown** for accepted patients: `SupportedPatientCard` and `app/(support)/care-planner/[patientId].tsx`
  render `patient.condition`. T4's "hide the condition line when it's empty" applies to these two.
