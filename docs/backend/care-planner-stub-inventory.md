# Care Planner stub inventory (patient side)

Recon for `care-planner-build-plan.md` step 1.2. Taken from `main` at `f2e60f1`. The support-person app (`app/(support)`, `src/services/support-person.ts`) is out of scope and untouched.

## Importers of `@/services/care-planner`

| File | Imports |
|---|---|
| `app/(tabs)/planner/review.tsx` | `markAppointmentSaved`, `saveAnswers` |
| `src/features/care-planner/useAppointmentPlan.ts` | `getAppointmentPlan` |
| `src/features/care-planner/useAppointmentQuestions.ts` | `getQuestionSuggestions`, `saveAppointmentQuestions` |
| `src/features/care-planner/useAppointments.ts` | `listAppointments` |
| `src/features/care-planner/useCreateAppointment.ts` | `createAppointment`, `updateAppointmentDetails` |
| `src/features/care-planner/useRecordingConsent.ts` | `saveRecordingConsent` |
| `src/features/care-planner/useSupportPerson.ts` | `getSupportPeople`, `saveSupportPeople` |
| `src/services/care-planner.test.ts` | the service itself plus `clearMockCreatedAppointments` |

## Placeholders to remove

In `src/services/care-planner.ts` (all removed in Phase 4/7):

- `MOCK_APPOINTMENTS` (exported), `SAMPLE_SUPPORT_PEOPLE`
- `MOCK_SUGGESTED_GROUPS`, `MOCK_SUGGESTIONS_GENERATED_ON`, `MOCK_DEFAULT_SELECTED_IDS`, `MOCK_DOCTOR_ANSWERS`
- In-memory state: `createdAppointments`, `appointmentOverrides`, `supportPeople`, `selectedQuestionIds`, `doctorAnswers`, `savedConsents`
- Helpers over that state: `allAppointments`, `findAppointment`, `withAppointment`, `supportPeopleFor`, `allSuggestedQuestionIds`, `selectedIdsFor`, `answersFor`, `buildPlanGroups`, `supportNamesFor`
- `clearMockCreatedAppointments` (exported test helper)
- A private copy of `run`; replace with `run` from `@/lib/result`
- The `APPOINTMENT_NOT_FOUND` stub error (becomes a real `NOT_FOUND` from the database)

In the app:

- `app/(tabs)/settings/support-persons.tsx`: `INITIAL_PEOPLE` (John Doe, Jane Doe) and the "placeholder data" comment (step 5.1)
- `src/features/care-planner/healthServiceOptions.ts`: placeholder list awaiting MHA (decision M1, step 6.4)

## Tests that depend on the placeholders

- `src/services/care-planner.test.ts` (imports `clearMockCreatedAppointments`, relies on the sample appointments). Rewritten in step 4.5.

`MOCK_SUPPORTED_PATIENTS`, `MOCK_SUPPORT_REQUESTS` and `src/features/support-person/context.test.tsx` belong to the support-person service and stay as they are.

## Files the plan says do not exist yet

Confirmed missing: `src/features/care-planner/messages.ts` (step 2.6), `accessType.ts` (step 2.2), `mappers.ts` (step 2.3). `src/features/care-planner/question-generation.ts` exists but is empty (step 2.5).

## Repo recon (step 1.1)

Matches section 3 of the plan:

- Latest migration is `20261020025837_restrict_prescription_privileges.sql`; none after it.
- `appointment` has `practitioner_name` (renamed, varchar(100), nullable), `health_service` (nullable), `recording_consent_at`, `recording_consent_signature`; privileges select/insert/update for `authenticated`.
- `appointment_questions` (`question varchar(200)`, `answer text`) and `support_persons` (phone `varchar(12)`, email `varchar(45)`, name `varchar(45)`, all NOT NULL) are still as first created; `appointment_has_support_persons` FK has no `on delete`.
- Policies on these tables still call `can_access_patient`; `ahsp_delete` does not exist; trigger `support_persons_protect_access_type` exists.
- Helpers `current_users_id`, `patient_id_for_user`, `can_access_patient`, `is_own_patient_record`, `is_support_person_for_patient` exist (security definer, in the first remote schema).
