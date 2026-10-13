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
- [ ] S3.5 Coverage

## Phase 4: UI wiring
- [ ] S4.1 Six-digit verify
- [ ] S4.2 phone.tsx send
- [ ] S4.3 verify action
- [ ] S4.4 Resend
- [ ] S4.5 Show target number

## Phase 5: Routing fixes
- [ ] S5.1 Sign in -> phone
- [ ] S5.2 Stop using `hasOnboarded` [GATE L7]
- [ ] S5.3 `_layout.tsx` order
- [ ] S5.4 Verify login-bridge hops
- [ ] S5.5 Returning user, no profile [GATE L7]

## Phase 6: Profile database
- [ ] S6.1 Insert privileges migration [GATE L9]
- [ ] S6.2 `users.user_type` [B] [GATE L11]
- [ ] S6.3 Name length (L10)
- [ ] S6.4 `create_profile` function
- [ ] S6.5 pgTAP tests
- [ ] S6.6 Regenerate types

## Phase 7: Mapping and service
- [ ] S7.1 Pure mapper
- [ ] S7.2 `createProfile` service
- [ ] S7.3 Payload hygiene test
- [ ] S7.4 Coverage list

## Phase 8: End-to-end wiring
- [ ] S8.1 After verify routing
- [ ] S8.2 AuthContext `hasProfile`
- [ ] S8.3 Root guard
- [ ] S8.4 Sign out

## Phase 9: Dev harness retirement [GATE L14]
- [ ] S9.1 Gate `dev-login`
- [ ] S9.2 Remove `AuthDebug`
- [ ] S9.3 Production auth checklist

## Phase 10: Docs and handover
- [ ] S10.1 Testing docs
- [ ] S10.2 Login back-end doc
- [ ] S10.3 `.env.example`

## Open decisions
| ID | Decision | Status |
| --- | --- | --- |
| L3 | Resend interval / OTP expiry | ⏳ |
| L6 | Sign-in and sign-up share `sendVerificationCode` | 🟡 |
| L7 | Returning-user routing, stop using `hasOnboarded` | 🟡 |
| L9 | RPC security model (invoker vs definer) | 🟡 |
| L10 | Name length 45 vs 50 (mapping settled) | 🟡 |
| L11 | Support person: A cosmetic or B `users.user_type` | ❓ |
| L13 | Session length | ⏳ |
| L14 | Retire dev harness | 🟡 |
| L15 | Production config record | 🟡 |
| L16 | Password / Face ID login | ❓ |
| L17 | Phone change | ⏳ |
