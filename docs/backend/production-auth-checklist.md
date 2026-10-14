# Production auth checklist

Record of the Supabase Auth settings the **production** project must have before real users sign in. These live in the Supabase dashboard, not in `supabase/config.toml` (the file holds local/CI values, including a test OTP). Tick each item in the dashboard and note who did it and when.

Items marked **(verify)** are facts I could not confirm from the repo; check them in the dashboard.

## 1. Never apply the local config to production

- [ ] Do not run `supabase config push` or `supabase db reset` against production. `config.toml` contains a test OTP number and `enable_signup = true` for SMS.
- [ ] A migration reaches production only by merging to `main`, passing the `test` environment, then a human approving the `production` environment (see `testing-and-cicd.md` §7).

## 2. Providers

- [ ] **Phone** provider: enabled.
- [ ] **Email** provider: **disabled** (the dev harness and the Account screen's password change use it; neither is a production sign-in path). Decision L16 covers what happens to those screens.
- [ ] **Anonymous** sign-ins: disabled.
- [ ] Email `signUp` cannot be used to create accounts (follows from the email provider being off). **(verify)** by calling `signUp` against production with a throwaway email: it must be rejected.

## 3. Test OTP

- [ ] **No** entries under Phone → "test phone numbers and OTPs". Test numbers exist only in the dev project and in local `config.toml`.
- [ ] Re-check after every dashboard change to the Phone provider.

## 4. SMS provider (Twilio sprint)

- [ ] Twilio account owned by an organisation, not a personal account (A1). Spending cap and alerts set.
- [ ] Provider choice made: Programmable Messaging or Verify. **(verify)** the open report that test OTPs are ignored with Verify before choosing it.
- [ ] Account SID, Message Service SID and auth token entered in the dashboard only. The token is never committed (`env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)` in `config.toml`, held as a GitHub environment secret).
- [ ] Sender ID registration done if an alphanumeric sender is used (A2). **(verify)** ACMA requirements.
- [ ] SMS message template reads sensibly ("Your code is {{ .Code }}").

## 5. Rate limits and abuse

- [ ] **SMS sent per hour** (`sms_sent`): set to a value the budget can absorb. Local value is 30.
- [ ] **Minimum interval between OTP requests** (`max_frequency`): decided together with the UI countdown (`RESEND_SECONDS` in `src/features/auth/otp.ts`, currently 120 s). Decision L3.
- [ ] **OTP expiry:** the dev project shows 60 s. Confirm the production value and make sure the resend countdown and the expiry make sense together (L3).
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
