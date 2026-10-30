# Login back-end progress

Resume point for a new session. Plan: `login-backend-build-plan.md`. Status key: `[ ]` todo, `[x]` done, `[!]` blocked, `[-]` skipped.

## Phase 0: Admin (user's tasks, not code)
- [ ] A1 Twilio account owner
- [ ] A2 ACMA sender-ID registration
- [ ] A3 MHA sign-off on 6-digit OTP
- [ ] A4 Product call on support person (L11)
- [x] A5 Test OTP spike on hosted dev project

## Phase 1: Recon and groundwork
- [x] S1.1 Schema recon note
- [x] S1.2 Local test-OTP config (A5 answered; CI to prove local stack accepts it without an SMS provider)
- [x] S1.3 Remove stray client logging
- [x] S1.4 Fix `OnboardingContext.reset`

## Phase 2: Phone and error foundations
- [x] S2.1 `toE164`
- [x] S2.2 OTP helpers
- [x] S2.3 AppError codes
- [x] S2.4 Auth messages

## Phase 3: `auth.ts` service
- [x] S3.1 `sendVerificationCode`
- [x] S3.2 `verifyCode`
- [x] S3.3 `signOut`
- [x] S3.4 `hasProfile`
- [x] S3.5 Coverage

## Phase 4: UI wiring
- [x] S4.1 Six-digit verify
- [x] S4.2 phone.tsx send
- [x] S4.3 verify action
- [x] S4.4 Resend
- [x] S4.5 Show target number

## Phase 5: Routing fixes
- [x] S5.1 Sign in -> phone
- [x] S5.2 Stop using `hasOnboarded` [GATE L7]
- [x] S5.3 `_layout.tsx` order
- [x] S5.4 Verify login-bridge hops (checked: other-conditions -> login-bridge -> phone; no change needed)
- [x] S5.5 Returning user with no profile (login-bridge creates the profile directly when already signed in)

## Phase 6: Profile database
- [x] S6.1 Insert privileges migration (revoke-then-grant, approved)
- [x] S6.2 users.user_type (migration written; types pending S6.6)
- [x] S6.3 Name length (L10)
- [x] S6.4 `create_profile` function
- [x] S6.5 pgTAP tests
- [x] S6.6 Regenerate types (hand-written; CI types-diff passed)

## Phase 7: Mapping and service
- [x] S7.1 Pure mapper
- [x] S7.2 `createProfile` service
- [x] S7.3 Payload hygiene test
- [x] S7.4 Coverage list

## Phase 8: End-to-end wiring
- [x] S8.1 After verify routing
- [x] S8.2 AuthContext `hasProfile`
- [x] S8.3 Root guard
- [x] S8.4 Sign out

## Phase 9: Dev harness retirement [GATE L14]
- [x] S9.1 Gate `dev-login`
- [x] S9.2 Remove `AuthDebug`
- [x] S9.3 Production auth checklist

## Phase 10: Docs and handover
- [x] S10.1 Testing docs
- [x] S10.2 Login back-end doc
- [x] S10.3 `.env.example`

## CI/CD
- [x] Migration-immutability check (`migrations-immutable` job)
- [x] Auto-deploy migrations to the `test` project after merge (`deploy-db.yml`)
- [ ] GitHub: `test` environment secrets and branch protection on `main` (done by hand in GitHub)
- [ ] `production` deploy job (blocked: no production project yet)

## Open decisions
| ID | Decision | Status |
| --- | --- | --- |
| L3 | Resend interval / OTP expiry | ⏳ |
| L6 | Sign-in and sign-up share `sendVerificationCode` | ✅ settled (2026-10-14) |
| L7 | Returning-user routing, stop using `hasOnboarded` | ✅ settled (2026-10-14) |
| L9 | RPC security model (invoker vs definer) | ✅ settled: invoker |
| L10 | Name length 45 vs 50 (mapping settled) | ✅ settled: UI limited to 45 |
| L11 | Support person: A cosmetic or B `users.user_type` | ✅ settled: B, patient screens skipped |
| L13 | Session length | ⏳ |
| L14 | Retire dev harness | ✅ settled (2026-10-14) |
| L15 | Production config record | ✅ settled: docs/backend/production-auth-checklist.md |
| L16 | Password / Face ID login | ❓ |
| L17 | Phone change | ⏳ |

# Care Planner (patient side) progress

Plan: `care-planner-build-plan.md` (copied to `docs/backend/` in step 8.1). Branch `feature/care-planner-backend`. Status key as above; `[!]` blocked.

## Phase 0: Admin
- [x] 0.1 Branch
- [x] 0.2 Read the decisions

## Phase 1: Recon
- [x] 1.1 Schema and policy recon (matches the plan)
- [x] 1.2 Stub inventory (`care-planner-stub-inventory.md`)

## Phase 2: Pure foundations
- [x] 2.1 Error codes and messages
- [x] 2.2 Access type and phone helpers
- [x] 2.3 Row mappers
- [x] 2.4 Signature guard
- [x] 2.5 Question generator (design questions only; M2 and M3 still open, conditions marked PROPOSED)
- [x] 2.6 Friendly messages

## Phase 3: Migrations, pgTAP, generated types
- [x] 3.1 A1 appointment_status
- [x] 3.2 A2 appointment_questions_plan_columns
- [x] 3.3 A3 support_persons_align
- [x] 3.4 A4 care_planner_privileges_policies
- [x] 3.5 A5 rpc_appointment_details
- [x] 3.6 A6 rpc_suggestions_questions
- [x] 3.7 A7 rpc_support_people
- [x] 3.8 A8 rpc_consent_answers_save (generated types hand-written; CI types diff matched after one ordering fix; pgTAP passes in CI)

- [x] 3.9 Extra: `support_people_relink_and_link_policy` (re-save of two support people; owner-only link policy; test 088)
- [x] 3.10 Extra (review feedback): `enforce_care_planner_rules` (consent and NO_QUESTIONS rules also for direct writes, row locks, numeric id check; test 089). Passes in CI (after one test-fixture fix in 089)

## Phase 4: Services
- [x] 4.1 Appointments
- [x] 4.2 Support people
- [x] 4.3 Questions
- [x] 4.4 Consent and answers (4.1 to 4.4 and 4.5 are one commit: the service was rewritten as one file)
- [x] 4.5 Service tests

## Phase 5: Settings > Support Persons
- [x] 5.1 Real support persons

## Phase 6: Front-end deltas
- [x] 6.1 Require one question
- [x] 6.2 Cap two support people
- [x] 6.3 Consent before answers
- [!] 6.4 Health service options (blocked on M1: placeholder list kept, MHA has not confirmed)
- [x] 6.5 Explore-questions shortcut (new read-only screen `planner/explore-questions`, no appointment needed)
- [x] 6.6 Types for real data (`supportPersonId`, nullable `generatedOn`, local-format phones, saved list used; `status` belongs to the support person plan)

## Phase 7: Stub removal
- [x] 7.1 Remove stub data

## Phase 8: Docs, checks, QA
- [x] 8.1 Docs
- [x] 8.2 Full checks run locally (typecheck, lint, 64 tracked jest suites). CI is green (pgTAP, `db lint`, types diff)
- [!] 8.3 Manual QA (needs two test patients on a device with the dev project; not done)

## Open care planner decisions
| ID | Decision | Status |
| --- | --- | --- |
| M1 | Health service list (MHA) | ❓ |
| M2 | Generation rule content beyond the 17 design questions (MHA clinical review) | ❓ |
| M3 | Generation gate: all five assessments completed | ❓ |
| M4 | Data retention / account deletion (deleting a patient fails while appointments exist) | ❓ out of scope |
| M5 | No server rule on past/future appointment dates | ❓ optional |
| M6 | Draft appointments are never cleaned up | ❓ optional |

# Support person back-end progress

Plan: `support-person-backend-build-plan.md` (Revision 3). Branch `feature/support-person-backend`. The Settings back end (PR #52) merged first and is on dev.

## Phase T0: Branch and recon
- [x] T0.1 Branch from `main`, then `main` merged in after Settings (`473293a`)
- [x] T0.2 Recon: the repo matches sections 0.2 and 4; stub inventory in `support-person-stub-inventory.md`

## Phase T1: Pure foundations
- [x] T1.1 Error codes (`eaf4d03`)
- [x] T1.2 Friendly messages and invitation status (`3a11eb2`)
- [x] T1.3 Support person row mappers

## Phase T2: Migrations, pgTAP, generated types
- [ ] T2.1 A9 `support_link_state` (090)
- [ ] T2.2 A10 `restrict_support_person_table_access` (091)
- [ ] T2.3 A11 `support_person_functions` (092)
- [ ] T2.4 `settings_support_person_status` (097), from Settings commit 19; same PR as A9

## Phase T3: Service
- [ ] T3.1 Service rewrite
- [ ] T3.2 Service tests

## Phase T4: Front-end deltas
- [ ] T4 Consent gating and the other screen changes
- [ ] T4 Invitation status on the patient's Support persons screen (from Settings commit 18)

## Phase T5–T7
- [ ] T5.1 Remove the placeholders and update the docs
- [ ] T6.1 Full checks and green CI
- [ ] T7.1 Manual QA with two accounts

## Decisions
S2–S6 and M7 settled on 29 Oct 2026 (see the plan's section 2). The designer approved S3 and S5.
