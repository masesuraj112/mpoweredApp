# Twilio SMS integration: briefing and guided walkthrough

**For:** Mohammad (MPowered) | **Revision 2:** 29 Oct 2026 (decisions recorded) | **Basis:** the `repomix-output.xml` snapshot of 28 Oct plus Twilio, Supabase and ACMA sources (links at the end).
Anything marked **(verify)** is something I could not confirm from a source. Check it before relying on it.

---

## 0. Read this first (for Claude Code)

### 0.1 Decisions already made (these override anything below that disagrees)

| ID | Decision | Status |
| --- | --- | --- |
| D1 | **Keep one Supabase project for now.** Real SMS and the developer test numbers share it, so **no real patient data goes in it** until a separate production project exists (Phase C) | Settled |
| D2 | **OTP expires after 120 s; resend interval 60 s** (UI countdown and server minimum). This differs from the requirements PDF ("resend in 2 minutes"), so it needs MHA sign-off | Settled, MHA sign-off pending |
| D3 | **Twilio Programmable Messaging** through a Messaging Service SID. Not Twilio Verify | Settled |
| D4 | **Twilio account owner: for now a personal account made by Mohammad** (the team has no shared email). Plumbing only, same rules as a team-owned account (below). MHA must own the account before launch | Settled for the plumbing stage (29 Oct 2026) |
| D5 | Sender: alphanumeric ID (needs an ABN holder) or a leased AU number | Open, waits on D4 and MHA |
| D6 | Abuse controls: Australia-only geo permissions, low SMS-per-hour limit, small prepaid balance | Proposed |
| D7 | SMS notifications beyond login codes | Deferred (section 8) |

**Team-owned account rule (D4).** Until MHA owns the account: use it only to prove the plumbing. Do **not** register an alphanumeric sender ID, do **not** buy or KYC an AU number, and do not use it for real patient sign-ins. Because Twilio credentials live only in three Supabase dashboard fields (Account SID, Auth Token, Messaging Service SID), moving to MHA's account later means replacing those three values. No code change and no ownership transfer is needed. (Twilio does support ownership changes, but they need an upgraded pay-as-you-go account, matching corporate email domains or a support request, and the docs do not say what happens to numbers or registrations.)

### 0.2 How Claude Code should run this guide

The user wants to be walked through this guide, one atomic step at a time, until SMS login works. Operating rules:

1. **Work one step at a time.** State the step, say who does it (**You** = the user in a dashboard or console, **Code** = Claude Code in the repo), do it or give exact instructions, then **stop and wait** for the user to confirm or paste the result. Never batch steps. Never assume a user step is done.
2. **Track progress** in `docs/backend/sms-progress.md` (a checklist of the step IDs in section 7: done / blocked / skipped). Update it after each step.
3. **Code steps** (Phase D): apply the guardrails in section 3, run `npm run lint`, `npm run typecheck` and `npm test`, make one commit per step. Do not run Docker-based commands; CI does that.
4. **Dashboard and console steps are done by the user**, not by Claude Code. Give exact click-paths, say what to look for, and ask what they saw. Dashboard labels may have changed **(verify)**; follow the intent and ask the user to describe differences.
5. **Secrets.** Never ask the user to paste the Twilio Auth Token, Account SID, Messaging Service SID, or any API key into the chat or into a file. They type those only into the Supabase dashboard. If they paste one by accident, tell them to rotate it in Twilio. Do not put a Supabase access token or service-role key in the repo or in commands that are logged.
6. **Allowed read-only checks:** `supabase migration list` and `supabase projects list` against the dev project the CLI is already linked to (the ref in `supabase/.temp/project-ref` must match `EXPO_PUBLIC_SUPABASE_URL`). Do not run `supabase config push`, `db reset`, `db push`, or any command against another project.
7. **Never claim success without evidence.** For each user step, ask for what proves it (a screenshot with secrets hidden, a Twilio log line, or "both dev logins still reach home").
8. If a step needs a decision that is not in 0.1, stop and ask.
9. Commit messages: imperative form, no `type:` prefix. End each with the attribution lines your session gives you.

---

## 1. The short version

1. **This stage is mostly dashboard and admin work, not code.** The app already calls `signInWithOtp({ phone, options: { channel: 'sms' } })` and `verifyOtp({ type: 'sms' })` (`src/services/auth.ts`). Supabase sends the SMS. Twilio credentials go into the **Supabase dashboard only**, never into the app, EAS or GitHub.
2. **The developer logins are not hardcoded in the app.** They are Supabase *test OTP* entries: `0491 570 006` (patient) and `0491 570 007` (support person), both with code `123456`, in `supabase/config.toml` (`[auth.sms.test_otp]`, local and CI) and in the dev project's Phone provider settings (dashboard). They survive Twilio if we follow section 3.
3. **There is no production Supabase project yet** (D1). Real SMS and the test-number backdoor will share one project, so no real patient data may go in it. A separate production project comes before launch.
4. **Australian sender rules are in force.** Since 1 July 2026, alphanumeric sender IDs must be registered with ACMA or messages show as "Unverified". Registration needs an ABN holder, so launch needs MHA to own the Twilio account and registration (D4/D5).
5. **Cost is small but abuse is the real exposure.** About US$0.06 per sign-in including resends. A bot hammering the send endpoint at Supabase's default limit (30 SMS/hour) could cost about US$37 a day. Geo permissions, a lower rate limit and a small prepaid balance are the controls.
6. **Do not build SMS notifications yet.** OTP only (section 8).

---

## 2. What the repo does today

| Area | Current state |
| --- | --- |
| Send code | `sendVerificationCode` normalises to E.164 (`+614…`) then `signInWithOtp` with `channel: 'sms'`, `shouldCreateUser: true` |
| Verify | `verifyCode` checks a 6-digit code locally, then `verifyOtp` with `type: 'sms'` |
| OTP length | 6 (`OTP_LENGTH`). The requirements PDF still says 4 digits; MHA sign-off is pending (L2/A3) |
| Resend | UI countdown `RESEND_SECONDS = 120` today; **D2 changes it to 60** (step T1) |
| Expiry | 60 seconds on the dev project today; **D2 sets 120 s** in the dashboard (step B2) |
| Error mapping | `otp_expired`, `over_sms_send_rate_limit`, `over_request_rate_limit`, `sms_send_failed` already map to app codes and friendly messages |
| Local config | `[auth.sms] enable_signup = true`, `max_frequency = "5s"`, `[auth.sms.test_otp]` has two numbers, `[auth.sms.twilio] enabled = false` |
| Hosted projects | One test/dev project. The production job in `deploy-db.yml` is not built. `production-auth-checklist.md` already lists "no test OTP entries" and "SMS sent per hour" |

Almost every code path for Twilio exists. What is missing is the provider, the sender, the settings and the decisions above.

---

## 3. Preserving the developer logins

### Where they live
| Place | What it is | Affected by Twilio? |
| --- | --- | --- |
| `supabase/config.toml` `[auth.sms.test_otp]` | `61491570006 = "123456"` and `61491570007 = "123456"` (no `+`) | Only local Supabase and CI. Keep `[auth.sms.twilio] enabled = false` here and it is untouched |
| Dev project dashboard: Authentication, Providers (Sign In / Providers), Phone, test phone numbers | The same numbers for the hosted project | Test numbers skip the SMS provider. The earlier spike found the dev project accepted a test number with placeholder Twilio credentials. **(verify)** after real credentials go in |
| App code | **Nothing hardcoded** | No change |

### Risks
- **Twilio Verify.** One unconfirmed GitHub comment says Verify ignores test numbers. D3 (Programmable Messaging) avoids it.
- **Backdoor on the wrong project.** Anyone who knows `0491 570 006` and `123456` can sign in as that user on any project where they are configured. With D1 this is accepted for now, which is why no real patient data may be on this project. They must never exist on a future production project.
- **`supabase config push`** against production would copy the test OTPs. Never run it there.

### GUARDRAILS (Claude Code: apply to every step)
> 1. Do not remove or change the two `[auth.sms.test_otp]` entries (`61491570006`, `61491570007`) in `supabase/config.toml`.
> 2. Keep `[auth.sms.twilio] enabled = false` in `config.toml`. The hosted SMS provider is configured in the Supabase dashboard only.
> 3. Never commit a Twilio Account SID, Auth Token, Messaging Service SID or any real phone number. Names of variables only.
> 4. Never run `supabase config push`, `db reset` or anything against production.
> 5. Add no phone or code bypass to app code. No new `EXPO_PUBLIC_*` variables for Twilio.
> 6. One step, one commit, imperative commit messages with no `type:` prefix. Run `npm run lint`, `npm run typecheck` and `npm test` before committing. Do not run Docker-based commands; CI does that.

### Check that proves they survived (after every dashboard change)
Sign in as `0491 570 006` and `0491 570 007` with `123456`. Both must reach the right home screen, with no SMS sent (Twilio Console, Monitor, Logs, Messaging shows nothing for them).

---

## 4. Decisions and how they were reached

See 0.1 for the settled list. Notes:
- **D2 timing.** A 120 s expiry with a 60 s resend means a user can request a fresh code while the first is still valid, and removes the old clash (60 s expiry versus a 120 s wait). A new code replaces the old one **(verify)**. It changes the PDF's "resend in 2 minutes", so MHA must approve it, together with the six-digit change.
- **D1 consequence.** Until a production project exists, treat everything in the project as test data.

---

## 5. Costs (Twilio bills in USD)

| Item | Price | Source status |
| --- | --- | --- |
| Outbound SMS to an Australian mobile | **$0.0515 per segment** | Twilio AU pricing page |
| Failed-message processing fee | $0.001, only on failed messages | Same page |
| AU mobile number (if leased) | $8.25 per month | Same page |
| Alphanumeric sender ID | Free on Twilio | Same page. Registration fees may be charged by whoever submits it **(verify)** |
| Carrier fees | "May apply"; amount not shown | **(verify)** in the Twilio console |
| Verify (not used) | $0.05 per *successful* verification **plus** the SMS | Twilio Verify pricing page |

A one-line OTP in plain GSM-7 characters is **one segment**. Curly quotes or emoji switch to a shorter-segment encoding and can double the cost. Keep the template plain, e.g. `MPowered: your code is {{ .Code }}. Do not share it.` with straight apostrophes.

**Scenarios** (sign-ins per month, 1.2 sends each, Programmable Messaging):

| Sign-ins / month | SMS sent | Monthly cost |
| --- | --- | --- |
| 100 | 120 | $6.18 |
| 500 | 600 | $30.90 |
| 1,000 | 1,200 | $61.80 |
| 5,000 | 6,000 | $309.00 |

Add $8.25 if you lease a number. Users stay signed in (refresh tokens), so you pay per sign-in or new device, not per app open.

**Worst-case abuse at Supabase's default 30 SMS/hour:** about $1.55 per hour, about $37 per day, until someone notices.

**Twilio trial:** 5 verified recipient numbers, 30-day expiry, free units, shared trial numbers, and pre-defined templates only (custom message bodies may not work). Upgrade before end-to-end testing. **(verify)** what top-up the upgrade asks for.

**Supabase limits:** SMS send limit is per project (default 30 per hour); verification is per IP (default 30 per 5 minutes); per-user resend minimum is 60 s by default. All configurable under Authentication, Rate Limits (API settings `rate_limit_sms_sent`, `rate_limit_verify`, `rate_limit_otp`). Whether phone login depends on the Supabase plan: **(verify)**.

---

## 6. Australian rules and risk points

- **ACMA SMS Sender ID Register.** From 1 July 2026 all alphanumeric sender IDs sending to Australian mobiles must be registered; unregistered ones are relabelled "Unverified" (not blocked). ABN holders register through a participating telco or partner as an authorised representative on the Australian Business Register, with a use case: a registered business name, an active company name, a registered trademark, or a WHOIS-registered domain used on a live site or email. Numeric senders (a leased number) are not affected. Timeline and fees **(verify)**.
- **Twilio mobile-number KYC.** Businesses need proof of business name, address and business ID; individuals need ID and an Australian address. Twilio states its services are for business use only.
- **SMS pumping (fraud).** `signInWithOtp` is reachable with the public anon key, so the app's "Australian mobiles only" check does not stop direct API calls. Controls: Twilio geo permissions **Australia only**; a low Supabase SMS-per-hour limit; captcha later (own task); a small prepaid balance with auto-recharge off **(verify)**.
- **Privacy.** Phone numbers are personal information sent to Twilio (a US company). That belongs in MHA's privacy policy and overseas-disclosure assessment (MHA/legal to confirm; not legal advice). Never put health details in an SMS.
- **Reminders** may need consent and opt-out handling; confirm with MHA before building them.

---

## 7. Step-by-step

Legend: **You** = user in a dashboard/console. **Code** = Claude Code in the repo.

### Phase T: code and docs (no dependency on Twilio)
| ID | Who | Step | Done when |
| --- | --- | --- | --- |
| T1 | Code | Set `RESEND_SECONDS = 60`; update the comment (L3 settled: 60 s resend, 120 s expiry set in the dashboard), `otp.test.ts`, and the resend copy on `verify.tsx`. It derives minutes with `Math.round(RESEND_SECONDS / 60)`, so check the wording is right for one minute ("in 1 minute", not "in 1 minutes"); prefer a small pure helper in `otp.ts` with a test. Update docs that say 120 s or two minutes | lint, typecheck, tests pass; one commit |
| T2 | Code | Review error handling for real SMS failures: `mapError` and `authErrorMessage` for `sms_send_failed`, both rate-limit codes, and invalid or unsupported numbers. Add a test per case. Messages must be calm and never reveal whether an account exists | tests pass; one commit |
| T3 | Code | Guard test: a Jest test that reads `supabase/config.toml` and fails if either test number is missing or `[auth.sms.twilio] enabled` is not `false`, and that scans tracked source for Twilio-style secrets (`AC` + 32 hex, `SK`/`MG` + 32 hex, long token-like strings next to "twilio") | tests pass; one commit |
| T4 | Code | Docs, after Phase B: update `docs/backend/login-backend.md` ("Not built yet"), `production-auth-checklist.md` (geo permissions, template wording, spend controls, dev/production split, D1 caveat), create `docs/backend/sms-setup.md` (variable names and dashboard steps only, no values) and `sms-progress.md` | docs committed |

### Phase A: Twilio (You)
| ID | Step |
| --- | --- |
| A0 | **Send MHA the confirmations email** (account owner/ABN holder and sender-name basis; six-digit code; 60 s resend and 120 s expiry). Not blocking for A1 to B6 |
| A1 | Create the Twilio account. Use an email on a company or team domain if you have one (not an alias). Verify email and phone. Turn on two-factor authentication. Record who owns it |
| A2 | Upgrade out of trial (Console, "Upgrade") and add a small balance (e.g. US$20). Keep auto-recharge **off**. Set a usage alert |
| A3 | Messaging, Settings, **Geo permissions**: enable **Australia only** |
| A4 | Messaging, Services, **Create** a Messaging Service. For the plumbing test, add the sender Twilio allows on your account **(verify what Twilio offers for AU without registration; stop and report if it needs a number purchase or KYC)**. Do not register an alphanumeric ID or buy an AU number on the team account (0.1) |
| A5 | Copy Account SID (`AC…`), Auth Token and Messaging Service SID (`MG…`) into a password manager only |

### Phase B: Supabase dashboard (You, on the one project)
Dashboard labels move around; follow the intent. **(verify)** each.
| ID | Step |
| --- | --- |
| B1 | Authentication, Sign In / Providers, **Phone**: enabled. SMS provider **Twilio** (not Twilio Verify). Enter the three values into the dashboard fields only |
| B2 | Set **SMS OTP length 6**, **expiry 120 s**, and the **message template** (plain characters, one segment) |
| B3 | Leave **test phone numbers and OTPs** as they are. Confirm both `0491 570 006` and `0491 570 007` are present with `123456` (no `+`). Earlier checks only confirmed one |
| B4 | Authentication, **Rate Limits**: set "SMS sent per hour" low (e.g. 20); set the minimum interval between OTP requests to **60 s**; leave verification limits at default or stricter |
| B5 | Run the developer-login check (section 3). Both must still work, no SMS sent |
| B6 | Real-SMS smoke test with your **own** Australian mobile (add it as a verified recipient in Twilio if still on trial rules). Then check Twilio Console, Monitor, Logs, Messaging for status and cost |

### Phase C: production project (before any real patient data; deferred by D1)
1. Create a separate Supabase project. Apply **all** migrations by hand (`supabase db push` linked to it). The login ones are `20261014100000`, `20261014100100`, `20261014100200`, but check the full `migration list`; the deploy workflow only pushes to the test project.
2. Dashboard, Phone: enabled, **MHA's** Twilio credentials, same OTP settings. **No test numbers.** Email provider off. Anonymous sign-ins off.
3. Work through `docs/backend/production-auth-checklist.md`.
4. Point only the EAS `production` environment at the new project. `EXPO_PUBLIC_BYPASS_AUTH` must not exist there.
5. Test with a real number that is not yours; confirm Twilio logs and costs.

### Test plan (after B6)
1. Developer logins work (both numbers) and send no SMS.
2. Own mobile: onboarding, phone screen, SMS arrives (note the sender shown on iPhone and Android), code autofills, profile created.
3. Wrong code three times: friendly error each time.
4. Resend before the 60 s countdown ends: blocked in the UI. Force it: the server limit message shows.
5. Wait past 120 s: "wrong or expired" shows and a new code works.
6. Call the API directly with a non-Australian number: it must fail (geo permissions). **(verify)** the actual error in Twilio logs.
7. Twilio logs show one message per send, status Delivered, price matches section 5.

---

## 8. SMS notifications (later)

- Supabase Auth sends **only** login codes. Any other SMS (appointment or assessment reminders, support-person invites) needs a separate path: a Supabase Edge Function calling Twilio's API with credentials held as Supabase secrets, triggered by a schedule or database event.
- Reminders repeat: 500 users each getting one a week is about 2,000 SMS a month, about $103. Push notifications cost nothing per message.
- Recommendation: OTP only for now. Project context says push notification scope is unresolved and infrastructure should not be built until confirmed.
- Support-person invitations are shown in-app once the invited person signs up with the same number. Texting a third party who has not consented raises privacy questions; do not add it without MHA's say-so.
- If MHA wants SMS reminders, write a separate plan (consent, opt-out, quiet hours, no health details, Edge Function, queue table, tests).

---

## 9. Things I could not verify

- Fee and timeline for AU alphanumeric registration on Twilio (the help article did not load).
- What sender Twilio allows for AU messaging on an unregistered account.
- Whether the account upgrade requires a minimum top-up, and whether auto-recharge off gives a hard spend ceiling.
- Exact Supabase dashboard labels, and whether phone login depends on the Supabase plan.
- Whether a new OTP invalidates the previous one (expected yes).
- Test OTP behaviour with Twilio Verify (avoided by D3).
- Carrier fees on AU SMS.
- What happens to numbers and registrations if a Twilio account owner is changed.

## Sources

- Twilio SMS pricing, Australia: https://www.twilio.com/en-us/sms/pricing/au
- Twilio Verify pricing: https://twilio.com/verify/pricing
- Twilio Australia regulatory guidelines: https://www.twilio.com/en-us/guidelines/au/regulatory
- Twilio trial account: https://www.twilio.com/docs/usage/trials
- Changing the owner of a Twilio account: https://support.twilio.com/hc/en-us/articles/223183428-Can-I-change-the-owner-of-a-Twilio-account
- Ownership change via Organizations: https://support.twilio.com/hc/en-us/articles/31317552236827-Twilio-Account-ownership-change-by-adding-existing-Account-to-Organization
- Twilio alphanumeric sender ID registration for Australia: https://help.twilio.com/articles/47624808819483-Register-your-Alphanumeric-Sender-ID-for-Australia-in-the-Twilio-Console
- ACMA sender ID rules (Infobip): https://www.infobip.com/docs/essentials/australia-registration/australia-sms-alphanumeric-sender-id-registration
- ACMA sender ID rules (Tall Bob): https://tallbob.com/2025/09/02/acma-sender-id-register-changes-2025/
- Supabase phone login: https://supabase.com/docs/guides/auth/phone-login
- Supabase Twilio phone auth: https://supabase.com/docs/guides/auth/auth-twilio
- Supabase Auth rate limits: https://supabase.com/docs/guides/auth/rate-limits
- Supabase fixed-OTP test numbers discussion: https://github.com/orgs/supabase/discussions/5358
