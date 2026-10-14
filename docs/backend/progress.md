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
- [!] S5.5 Returning user, no profile (L7 settled; blocked: needs S8.1 verify routing and Phase 7 createProfile; do it in Phase 8)

## Phase 6: Profile database
- [x] S6.1 Insert privileges migration (revoke-then-grant, approved)
- [x] S6.2 users.user_type (migration written; types pending S6.6)
- [x] S6.3 Name length (L10)
- [x] S6.4 `create_profile` function
- [x] S6.5 pgTAP tests
- [x] S6.6 Regenerate types (hand-written; CI types-diff passed)

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
| L6 | Sign-in and sign-up share `sendVerificationCode` | ✅ settled (2026-10-14) |
| L7 | Returning-user routing, stop using `hasOnboarded` | ✅ settled (2026-10-14) |
| L9 | RPC security model (invoker vs definer) | 🟡 |
| L10 | Name length 45 vs 50 (mapping settled) | 🟡 |
| L11 | Support person: A cosmetic or B `users.user_type` | ❓ |
| L13 | Session length | ⏳ |
| L14 | Retire dev harness | 🟡 |
| L15 | Production config record | 🟡 |
| L16 | Password / Face ID login | ❓ |
| L17 | Phone change | ⏳ |
