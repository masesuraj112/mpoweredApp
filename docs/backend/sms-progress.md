# SMS (Twilio) integration progress

Guide: `docs/backend/twilio-otp-integration-guide.md` (steps in section 7). Resume a new session from here.
Status: done / blocked / skipped / todo.

## Phase T: code and docs
- [x] T1 Resend interval 60 s, `formatResendWait` helper, docs updated
- [ ] T2 Error handling for real SMS failures
- [ ] T3 Guard test for test numbers, Twilio disabled in config, secret scan
- [ ] T4 Docs after Phase B (blocked until Phase B is done)

## Phase A: Twilio (user)
- [ ] A0 Send MHA the confirmations email (not blocking)
- [ ] A1 Create the Twilio account
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
