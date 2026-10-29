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
- [~] A2 Skipped for now: upgrade asks for ID and tax details, so staying on trial; revisit only if B6 is blocked (trial prefix or template limits)
- [x] A3 Geo permissions: Australia only (Twilio default also had Cocos and Christmas Island, same +61 code)
- [x] A4 Messaging Service (MPowered Test OTP) with a US trial-credit number as sender, for the plumbing test only; AU delivery unverified until B6
- [~] A5 Not needed: values are copied straight from the Twilio console into Supabase at B1 (nothing stored elsewhere)

## Phase B: Supabase dashboard (user)
- [x] B1 Phone provider: Twilio, three values entered in the dashboard only
- [x] B2 OTP length 6, expiry 120 s, message template
- [x] B3 Hosted test numbers checked, left unchanged: 006 present with 123456; 007 is NOT on the hosted project (local/CI only); an extra entry (61400000000) exists on the dashboard that is not in the repo, origin unknown. Neither may exist on production.
- [x] B4 Rate limits: SMS per hour set to 10 (project-wide; raise before launch), OTP interval already 60 s (locked unless custom SMTP)
- [ ] B5 Developer-login check (no SMS sent)
- [ ] B6 Real-SMS smoke test on own mobile

## Phase C: production project
Deferred by D1.
