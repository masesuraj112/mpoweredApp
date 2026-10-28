# SMS (Twilio) integration progress

Guide: `docs/backend/twilio-otp-integration-guide.md` (steps in section 7). Resume a new session from here.
Status: done / blocked / skipped / todo.

## Decisions recorded during the walkthrough
- D4 (29 Oct 2026): the Twilio account is a personal one made by Mohammad, because the team has no shared email. Plumbing only: no alphanumeric sender ID, no purchased or KYC'd AU number, no real patient sign-ins. MHA must own the account before launch (moving later means replacing the three dashboard values). Do not record the account email here.

## Phase T: code and docs
- [x] T1 Resend interval 60 s, `formatResendWait` helper, docs updated
- [x] T2 Error handling for real SMS failures
- [x] T3 Guard test for test numbers, Twilio disabled in config, secret scan
- [ ] T4 Docs after Phase B (blocked until Phase B is done)

## Phase A: Twilio (user)
- [ ] A0 Send MHA the confirmations email (not blocking)
- [x] A1 Create the Twilio account (named mpowered-test, personal account)
- [ ] A2 Upgrade out of trial, small balance, auto-recharge off, usage alert
- [ ] A3 Geo permissions: Australia only
- [ ] A4 Messaging Service
- [ ] A5 Store Account SID, Auth Token, Messaging Service SID in a password manager

## Phase B: Supabase dashboard (user)
- [ ] B1 Phone provider: Twilio, three values entered in the dashboard only
- [ ] B2 OTP length 6, expiry 120 s, message template
- [ ] B3 Test numbers `0491 570 006` and `0491 570 007` present with `123456`
- [ ] B4 Rate limits: SMS per hour low, OTP interval 60 s
- [ ] B5 Developer-login check (no SMS sent)
- [ ] B6 Real-SMS smoke test on own mobile

## Phase C: production project
Deferred by D1.
