# Production auth checklist

Record of the Supabase Auth settings the **production** project must have before real users sign in. These live in the Supabase dashboard, not in `supabase/config.toml` (the file holds local/CI values, including a test OTP). Tick each item in the dashboard and note who did it and when.

Items marked **(verify)** are facts I could not confirm from the repo; check them in the dashboard.

## 1. Never apply the local config to production

- [ ] Do not run `supabase config push` or `supabase db reset` against production. `config.toml` contains a test OTP number and `enable_signup = true` for SMS.
- [ ] A migration reaches production only by merging to `main`, passing the `test` environment, then a human approving the `production` environment (see `testing-and-cicd.md` §7).
- [ ] Every migration in `supabase/migrations/` is applied to production: run `supabase migration list` against it and check that no version has a Local entry with no Remote entry. Passing CI does not mean the hosted project has the migration (CI uses a local database). The `Deploy database` workflow pushes migrations to the `test` project only; it has no production job yet, so the login ones (`20261014100000`, `20261014100100`, `20261014100200`) must be pushed to production by hand until a `production` job with required reviewers is added.
- [ ] `create_profile` exists on the production project and `users` has a `user_type` column, or sign-up will fail after a correct code.

## 2. Providers

- [ ] **Phone** provider: enabled.
- [ ] **Email** provider: **disabled** (the dev harness and the Account screen's password change use it; neither is a production sign-in path). Decision L16 covers what happens to those screens.
- [ ] **Anonymous** sign-ins: disabled.
- [ ] Email `signUp` cannot be used to create accounts (follows from the email provider being off). **(verify)** by calling `signUp` against production with a throwaway email: it must be rejected.

## 3. Test OTP

- [ ] **No** entries under Phone → "test phone numbers and OTPs". Test numbers exist only in the dev project and in local `config.toml`.
- [ ] Re-check after every dashboard change to the Phone provider.
- [ ] Note: the dev project currently has `0491 570 006` (`61491570006`) and one extra entry (`61400000000`) that is not in the repo. `61491570007` is local/CI only. None of these may be copied to production.

## 4. SMS provider (Twilio sprint)

- [ ] Twilio account owned by an organisation (MHA), not a personal account (A1). The dev project uses a personal trial account named `mpowered-test` for plumbing only (decision D4); its credentials must not be reused for production. Spending controls set: small prepaid balance, auto-recharge **off**, a usage alert.
- [ ] Provider: **Twilio** (Programmable Messaging through a Messaging Service SID), not Twilio Verify (decision D3).
- [ ] Twilio geo permissions: **Australia only** (the Twilio default also enabled Cocos and Christmas Island, which share the +61 code; turn them off if not wanted).
- [ ] Account SID, Message Service SID and auth token entered in the dashboard only. The token is never committed (`env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)` in `config.toml`, held as a GitHub environment secret).
- [ ] Sender: an Australian number or an alphanumeric sender ID registered with ACMA under the ABN holder (decision D5, open). The dev project sends from a US trial-credit number, which is not a production sender. **(verify)** ACMA requirements and fees.
- [ ] SMS message template: plain straight characters only so it stays one segment, for example `MPowered: your code is {{ .Code }}. Do not share it.` Curly quotes or emoji can double the cost.
- [ ] A real-SMS test with a number that is not a developer's, checking Twilio logs for status and price (about US$0.0515 per segment on the dev test).
- [ ] Dev/production split (decision D1): until a separate production project exists, the single project holds test data only, because real SMS and the test-number logins share it. No real patient data goes in it.

## 5. Rate limits and abuse

- [ ] **SMS sent per hour** (`sms_sent`): set to a value the budget can absorb. Local value is 30; the dev project is set to 20. This limit is project-wide, not per user, so choose the production value from expected sign-ins per hour and the cost of a bot filling it (at 30 an hour, roughly US$37 a day).
- [ ] **Minimum interval between OTP requests** (`max_frequency`): 60 s, matching the UI countdown (`RESEND_SECONDS` in `src/features/auth/otp.ts`). Decision L3 (settled). On the dev project this field is locked at 60 s unless a custom SMTP provider is set; **(verify)** whether that applies to the production plan.
- [ ] **OTP expiry:** set to 120 s in the dashboard (L3, settled). Confirm the production value matches and that the 60 s resend countdown and the 120 s expiry still make sense together.
- [ ] **Captcha** decision recorded (hCaptcha or Turnstile, or "not now" with the reason).
- [ ] Request/verification rate limits left at least as strict as the defaults.

## 6. Sessions and tokens

- [ ] **JWT expiry:** local value is 3600 s. Confirm production. Session length beyond that is decision L13 (parked).
- [ ] **Refresh token rotation:** enabled (local `config.toml` has it on). **(verify)** in production.
- [ ] **Session storage encryption** on the device is a known hardening item (L12): the session is stored through `expo-sqlite` localStorage today. Decide before launch whether that is acceptable.
- [ ] Time-boxed or inactivity sessions (`[auth.sessions]`) decided (L13).

## 7. URLs

- [ ] **Site URL** set to the production app/site (local value is `http://127.0.0.1:3000`).
- [ ] **Redirect URLs** limited to production values. Remove local and localhost entries.

## 8. Data and access

- [ ] Row level security is enabled on every table (`000_rls_enabled` passes in CI).
- [ ] `anon` has no table privileges on the profile tables and cannot execute `create_profile` (`060_profile_privileges` passes in CI). **(verify)** the same on the hosted project, since local default privileges differ from hosted:
  ```sql
  select grantee, table_name, privilege_type
    from information_schema.role_table_grants
   where table_schema = 'public'
     and table_name in ('users', 'patients', 'patient_musko_skeletal_pain')
     and grantee in ('anon', 'authenticated')
   order by table_name, grantee, privilege_type;
  ```
  Expect `authenticated` with `INSERT` and `SELECT` only, and nothing for `anon`.
- [ ] Leftover dev-harness users (email/password, no `users` row) removed from the dev project, and none exist in production.
- [ ] The service-role key is not present in the app or any `EXPO_PUBLIC_*` variable.

## 9. Before the first real sign-in

- [ ] The manual checklist in `login-backend-build-plan.md` §5 passes on a build that uses the production project and a real phone number.
- [ ] `EXPO_PUBLIC_BYPASS_AUTH` is not set in the production build (it is `__DEV__`-only, but check the env file used for the build).
- [ ] Open decisions that affect production behaviour are settled or consciously deferred: L3 (resend and expiry), L13 (session length), L16 (password / Face ID), L17 (phone change).
