# MPowered Login & Onboarding Back-End: Build Plan

**Owner:** Mohammad  |  **Repo:** `masesuraj112/mpoweredApp`  |  **Revision:** 1 (2026-10-14)
**Stack:** Expo SDK 57 (Expo Router) · Supabase (Postgres, Auth, RLS) · supabase-js ^2.112.4 · TypeScript strict · Jest (`jest-expo`) · pgTAP · GitHub Actions
**Companion file:** `testing-and-cicd.md` (CI-only testing, CI/CD, and how to drive Claude Code)

---

## 0. Scope, basis and how to read this

### 0.1 What this plan builds
Phone-number login for MPowered using **Supabase phone OTP**, plus creation of the user's profile from the onboarding answers.

| In scope | Out of scope (deferred, see Appendix B) |
| --- | --- |
| `src/services/auth.ts` (send code, verify code, phone normalisation, error mapping) | Twilio account, billing and live SMS |
| 6-digit OTP in `verify.tsx`; wiring `phone.tsx` and `verify.tsx` | Server-side rate limits tuning, captcha |
| Developer test OTP numbers (no SMS sent) | Session encryption, session length |
| One atomic **profile-creation RPC** run after OTP verify | Phone-change re-verification flow |
| Returning-user routing and a "has profile" guard | Face ID / password login |
| Removing the dev harness (`dev-login`, `AuthDebug`) before release | Home screen differences for patient vs support person |

### 0.2 Basis
Written against the **updated repo snapshot** (`UPDATED_main_with_most_backends-merged-repomix-output.xml`). Anything marked **(verify)** is something I could not confirm from the repo or docs. Claude Code must check it before relying on it.

### 0.3 How to use this document
- **One step = one commit.** Each step has a suggested commit message (Conventional Commits) and a **Done when** line.
- Work **one step at a time**. Never ask Claude Code to "do the whole phase".
- Each step lists *Files*, *Do*, *Tests* and *Done when*. Tests are written in the same commit as the code.
- **CI is the only test runner for database and integration work** (no local Docker). See `testing-and-cicd.md`.
- Branch names: `feature/`, `fix/`, `chore/`, `refactor/`, `test/`, `docs/` + short description. One PR per phase is a sensible size.
- Steps marked **[B]** only apply if decision L11 resolves to Option B. Steps marked **[GATE]** need a decision or admin task finished first.

### 0.4 Corrected first-time login flow (what exists in the repo today)

| # | Screen (`app/(auth)/…`) | Goes to | Back end needed? |
| --- | --- | --- | --- |
| 1 | `index` (splash, 3 s) | `onboarding` (or `verify` if `hasOnboarded`) | Routing change |
| 2 | `onboarding` (3-slide carousel) | "Get started" → `user-type`; "Sign in" → `verify` | **Bug:** Sign in must go to `phone` |
| 3 | `user-type` | `name` | No (memory only) |
| 4 | `name` (max 50) | `consent` | No |
| 5 | `consent` | `sex` | No (nothing recorded) |
| 6 | `sex` | `demographics` | No |
| 7 | `demographics` (optional year of birth) | `health-conditions` | No |
| 8 | `health-conditions` | Yes → `diagnosis-conditions`; No → `other-conditions` | No |
| 9 | `diagnosis-conditions` | `other-conditions` | No |
| 10 | `other-conditions` | `login-bridge` (confirm in code) | No |
| 11 | `login-bridge` | `phone` | No |
| 12 | `phone` | `verify` | **Yes:** send OTP |
| 13 | `verify` | `verification-confirmation` | **Yes:** verify OTP, create profile |
| 14 | `verification-confirmation` (2 timed slides) | `(tabs)/home` | No |
| 15 | `(tabs)/home` | n/a | Root guard; sign out |

Onboarding answers (screens 3 to 10) live **only in memory** (`OnboardingProvider`) until OTP verify succeeds. That is why the profile is written once, after verify.

---

## 1. Guardrails (paste into every Claude Code prompt)

> **GUARDRAILS: obey all of these on every step**
> 1. **Never edit an existing migration.** Add a new file in `supabase/migrations/` with a `-- Rollback:` comment. Do not touch files already in that folder.
> 2. **Never disable RLS or weaken a policy.** Never grant to `anon` unless the step says so.
> 3. **Never use the service-role key in the app.** Never commit `.env`, tokens, Twilio credentials or OTP codes. Secrets in `config.toml` use `env(NAME)` only.
> 4. **Test OTP numbers go in the dev project / local config only. Never in production.**
> 5. Database functions are `plpgsql`, `security invoker`, `set search_path = public`, derive the user from `auth.uid()` / `current_users_id()`, raise `P0001` with a message code, and end with `revoke all … from public, anon; grant execute … to authenticated`. Follow `save_pain_assessment` and `save_social_health_assessment`.
> 6. Always filter `public.users` by `auth_id` (the `users_select` policy also returns a patient's row to support persons).
> 7. Services take the Supabase client as the **last optional argument**, return `Result<T>` (`src/lib/result.ts`), and wrap calls in `run()`. Map errors through `mapError` / `AppError` (`src/lib/errors.ts`).
> 8. Pure modules **never import** `@/lib/supabase`, `react-native` or `expo-*`.
> 9. Do not import from `app/` inside `src/`.
> 10. Do not log OTP codes or phone numbers. Remove, do not add, `console.log` of identifiers.
> 11. Service tests start with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))`. Add every new tested file to `collectCoverageFrom` in `jest.config.js`.
> 12. pgTAP files: `supabase/tests/database/NNN_name.test.sql`, `begin; select plan(N); … select * from finish(); rollback;`.
> 13. Re-read each file before editing it. Make the **minimum** change. Do not reformat unrelated code (the repo has mixed line endings; keep each file's existing endings).
> 14. Run `npm run lint` and `npm run typecheck` before committing. **Do not run `supabase start`, `supabase test db` or anything needing Docker**; CI runs those. Jest may be run locally.
> 15. One commit per step, using the suggested message. If a step needs a decision that is not recorded in section 2, stop and ask.

---

## 2. Decisions register

Status: ✅ settled · 🟡 recommended, needs your yes · ⏳ deferred · ❓ open

| ID | Decision | Choice / recommendation | Status |
| --- | --- | --- | --- |
| L1 | SMS provider | Twilio via Supabase. **Dev uses preset test OTPs now; Twilio next sprint.** | ✅ |
| L2 | OTP length | **6 digits.** Changes `verify.tsx`, `phone.tsx` helper text ("four digit"), and Figma/requirements wording (needs MHA sign-off) | ✅ (sign-off pending) |
| L3 | Resend interval | UI countdown currently 120 s; server minimum is Supabase's (60 s default, local `max_frequency = "5s"`). Build the countdown as a constant; decide the real value in the Twilio sprint. Check OTP expiry in the dev dashboard (docs conflict) | ⏳ |
| L4 | Dev sign-in | Supabase **test OTP** phone→code map. One fixed number per developer | ✅ |
| L5 | Phone normalisation | UI keeps local `04xx xxx xxx`. **`auth.ts` converts to E.164 `+614…`.** `users.phone_number` stores E.164 (`varchar(12)` fits exactly) | ✅ (my call, delegated) |
| L6 | Sign-in vs sign-up | Both call the **same** `sendVerificationCode`. No "account exists?" message (avoids account enumeration) | 🟡 |
| L7 | Returning-user routing | Stop using `hasOnboarded` for routing. After verify, check whether a profile exists: yes → home; no → onboarding. Root guard also checks "has profile" | 🟡 |
| L8 | Profile write | **One atomic RPC** after verify | ✅ |
| L9 | RPC security model | `security invoker` + explicit minimal insert grants (matches existing pattern). Alternative: `security definer` with fixed `search_path`. Recommend invoker | 🟡 |
| L10 | Value mapping | `sex` lower→DB casing; conditions → `patient_musko_skeletal_pain`; `otherConditions` → `patients.other_conditions`. **Name length:** DB `varchar(45)` vs UI 50. Recommend limiting UI to 45 (no schema change) | ✅ mapping / 🟡 length |
| L11 | Support person | Keep the screen. **A:** cosmetic, store nothing. **B (recommended):** add `users.user_type`; RPC creates only a `users` row for support persons. B also raises whether they see sex/diagnosis screens | ❓ |
| L12 | Session storage | Keep `expo-sqlite` localStorage (matches Supabase Expo quickstart). Encryption is a production-hardening item | ✅ |
| L13 | Session length | Parked: you decide when relevant | ⏳ |
| L14 | Retire dev harness | Gate `dev-login` behind `__DEV__`; remove `AuthDebug`; disable email provider / `signUp` in production | 🟡 |
| L15 | Production config record | Record production Auth settings in a doc (not `config.toml`) | 🟡 |
| L16 | Password / Face ID login | Settings assets exist (`password.svg`, `faceid.svg`) and Account settings already has change-password and Face ID UI that assume email/password. Decide whether these survive | ❓ |
| L17 | Phone change | Re-verification flow needed if users may change number | ⏳ |

> **Heads-up on L16:** `settings/account` already calls `signInWithPassword` to verify an "existing password" and `updateUser({ password })`. Phone-OTP users have no password, so that screen will not work for them. Not in this plan; flag to the team.

---

## 3. Phase map

| Phase | Name | Steps | Needs |
| --- | --- | --- | --- |
| 0 | Admin and setup | A1–A5 | You (no code) |
| 1 | Recon and groundwork | S1.1–S1.4 | n/a |
| 2 | Phone and error foundations (pure) | S2.1–S2.4 | n/a |
| 3 | `auth.ts` service | S3.1–S3.5 | Phase 2 |
| 4 | UI wiring (6-digit, phone, verify) | S4.1–S4.5 | Phase 3 |
| 5 | Routing fixes | S5.1–S5.5 | L6, L7 |
| 6 | Profile database (RPC) | S6.1–S6.6 | L9, L10, L11 |
| 7 | Profile mapping and service | S7.1–S7.4 | Phase 6 |
| 8 | End-to-end wiring and root guard | S8.1–S8.4 | Phases 4–7 |
| 9 | Dev harness retirement | S9.1–S9.3 | L14 |
| 10 | Docs and handover | S10.1–S10.3 | all |

---

## Phase 0: Admin and setup (not code; start now, some take up to 7 days)

| ID | Task | Who | Notes |
| --- | --- | --- | --- |
| A1 | Decide **Twilio account owner** (an organisation, not a student's personal account); set spending cap and alerts | You + MHA | Needed before the Twilio sprint |
| A2 | Start **ACMA sender-ID registration** (needs an ABN holder; up to ~7 days; mandatory from 1 July 2026 per my research, **verify**) | MHA | Only if using an alphanumeric sender |
| A3 | Get MHA sign-off on **6-digit OTP** wording in Figma/requirements | You | L2 |
| A4 | Product call on **support person** (L11) | MHA / team | Blocks [B] steps |
| A5 | **Spike: test OTP on the hosted dev project.** In Supabase dashboard → Authentication → Providers → Phone: enable phone, and add the test number(s) with a fixed code. Check (a) whether the dashboard demands an SMS provider to be selected (if so, enter **placeholder** credentials; no SMS is sent for test numbers; **verify**), (b) expected number format (with or without `+`), (c) OTP expiry shown | You | Record answers in the PR for S1.2. Use numbers in ACMA's reserved fictional mobile range (0491 570 xxx; **verify on acma.gov.au**) |

Costs reference for the Twilio sprint (USD, my research, **verify before quoting**): AU SMS ≈ $0.0515/segment; Verify adds ≈ $0.05 per successful verification; leased AU number ≈ $8.25/month; alphanumeric sender ID free but needs registration. Programmable Messaging is cheaper than Verify. Twilio trial sends only to verified numbers. Developers do **not** pay per login while on test OTPs.

---

## Phase 1: Recon and groundwork

### S1.1 Schema recon note (no code change)
- **Goal:** Stop Claude Code guessing column names.
- **Do:** Read `supabase/migrations/20260902052010_remote_schema.sql` and `src/types/database.ts`. Produce `docs/backend/login-schema-notes.md` listing for `users`, `patients`, `patient_musko_skeletal_pain`: columns, types, nullability, defaults (including whether `created_at` has a default), PKs/FKs, check constraints, RLS policies, and current `authenticated` grants. Note `sex` check values and `year_of_birth` range.
- **Done when:** The notes file exists and every column used in Phase 6 is listed.
- **Commit:** `docs(auth): record schema facts needed for profile creation`

### S1.2 Local test-OTP config (for CI and future local use)
- **Files:** `supabase/config.toml`
- **Do:** Under `[auth.sms]` set `enable_signup = true`. Uncomment `[auth.sms.test_otp]` and add one fictional number mapped to a fixed 6-digit code (format per A5). Keep `[auth.sms.twilio] enabled = false`. Add a comment: `# DEV/CI ONLY. Never push this to production.` Keep `jwt_expiry` and `max_frequency` unchanged.
- **Tests:** None (config). CI's `supabase start` proves it parses.
- **Done when:** CI `database-tests` still passes.
- **Commit:** `chore(auth): enable phone sign-in with test OTP for dev/CI`
- **(verify):** local Supabase may require an enabled SMS provider for phone sign-in even with a test number. If CI fails on that, enable `[auth.sms.twilio]` with dummy `account_sid`, `message_service_sid`, and `auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"`, and set a dummy env value in CI.

### S1.3 Remove stray client logging
- **Files:** `src/lib/supabase.ts`
- **Do:** Delete `console.log('URL loaded:', …)`. Change nothing else.
- **Done when:** lint/typecheck pass; grep finds no other logging of URLs/keys.
- **Commit:** `chore(auth): remove debug logging from supabase client`

### S1.4 Fix `OnboardingContext.reset`
- **Files:** `src/context/Onboarding-Context.tsx`
- **Do:** `reset` is `() => () => setData(initData)` (returns a function and never resets). Change to `() => setData(initData)`.
- **Tests:** Add a small RNTL/hook test if `@testing-library/react-native` is available; otherwise note as manual.
- **Done when:** calling `reset()` clears the data.
- **Commit:** `fix(auth): make OnboardingContext.reset actually reset`

---

## Phase 2: Phone and error foundations (pure, no Supabase)

### S2.1 `toE164` phone normaliser
- **Files:** new `src/features/auth/phone.ts` (pure) and `src/features/auth/phone.test.ts`
- **Do:** Export `toE164(input: string): Result<string>` and `isValidAuMobile(input)`. Accept local `04xxxxxxxx`, spaced `04xx xxx xxx`, `+614xxxxxxxx`, `614xxxxxxxx`, `+61 4xx xxx xxx`. Strip spaces/dashes/brackets. Output `+614xxxxxxxx`. Reject everything else (landlines, wrong length, letters). Also export `formatForDisplay(e164)` returning `04xx xxx xxx`.
- **Tests:** each accepted shape; rejects empty, 9 digits, 11 digits, `03…`, letters, `+1…`; idempotent (`toE164(toE164(x))`).
- **Add to `collectCoverageFrom`.**
- **Done when:** tests pass in CI.
- **Commit:** `feat(auth): add AU mobile to E.164 normaliser`

### S2.2 OTP code validator
- **Files:** `src/features/auth/otp.ts`, `otp.test.ts`
- **Do:** `OTP_LENGTH = 6`, `sanitiseCode(raw)` (digits only, max 6), `isCodeComplete(code)`. Constant `RESEND_SECONDS = 120` with a comment pointing to L3.
- **Tests:** strips non-digits, truncates, completeness at exactly 6.
- **Commit:** `feat(auth): add OTP code helpers`

### S2.3 New `AppError` codes
- **Files:** `src/lib/errors.ts`, `src/lib/errors.test.ts`
- **Do:** Add codes `INVALID_PHONE`, `INVALID_OTP`, `OTP_EXPIRED`, `RATE_LIMITED`, `PROFILE_EXISTS`, `SMS_FAILED`. Extend `mapError` for: Supabase auth errors (map by `error.code`, e.g. `otp_expired`, `over_sms_send_rate_limit`, `over_request_rate_limit`, `sms_send_failed`; **verify exact codes in installed `@supabase/auth-js`** and fall back to message matching only as a last resort) and for `P0001` messages `PROFILE_EXISTS`, `INVALID_NAME`, `INVALID_SEX`, `INVALID_YEAR`. Unknown stays `UNKNOWN`; network stays `NETWORK`.
- **Tests:** one test per mapping, plus unknown→`UNKNOWN`. Existing tests must still pass.
- **Commit:** `feat(auth): map OTP and profile errors to AppError codes`

### S2.4 Friendly auth messages
- **Files:** `src/features/auth/messages.ts`, `messages.test.ts`
- **Do:** `authErrorMessage(code)` returns user-facing copy for each new code (e.g. `INVALID_OTP`: "That code isn't right. Check it and try again."). Never reveal whether an account exists. Add to coverage list.
- **Commit:** `feat(auth): add user-facing auth error messages`

---

## Phase 3: `auth.ts` service

### S3.1 `sendVerificationCode`
- **Files:** `src/services/auth.ts` (currently empty), `src/services/auth.test.ts`
- **Do:** `sendVerificationCode(rawPhone, client = supabase): Promise<Result<{ phone: string }>>`. Steps: `toE164` → on failure return `INVALID_PHONE`; call `client.auth.signInWithOtp({ phone, options: { channel: 'sms', shouldCreateUser: true } })` inside `run()`; map errors. Return the normalised phone so the UI does not recompute it.
- **Tests (client injected):** invalid phone makes **no** client call; success; rate-limited; network failure; unknown error.
- **Commit:** `feat(auth): add sendVerificationCode service`

### S3.2 `verifyCode`
- **Do:** `verifyCode(rawPhone, code, client = supabase)`: validate phone and 6-digit code locally first (no network call if invalid), then `client.auth.verifyOtp({ phone, token: code, type: 'sms' })`. Return `Result<{ userId: string }>`; never return the whole session object to the UI.
- **Tests:** bad code format makes no call; wrong code → `INVALID_OTP`; expired → `OTP_EXPIRED`; success returns user id; missing user in response → `UNKNOWN`.
- **Commit:** `feat(auth): add verifyCode service`

### S3.3 `signOut`
- **Do:** `signOut(client)` wrapping `client.auth.signOut()`; returns `Result<void>`.
- **Commit:** `feat(auth): add signOut service`

### S3.4 `hasProfile`
- **Do:** `hasProfile(client)`: get the session user, then `client.from('users').select('id').eq('auth_id', userId).maybeSingle()`. Return `Result<boolean>`. `NO_SESSION` if no user. **Filter by `auth_id` (guardrail 6).**
- **Tests:** no session; row exists; no row; database error.
- **Commit:** `feat(auth): add hasProfile check`

### S3.5 Barrel and coverage
- **Do:** Add `src/services/auth.ts` and the `src/features/auth/*.ts` files to `collectCoverageFrom`. Confirm no Supabase import leaks into pure modules.
- **Commit:** `test(auth): include auth modules in coverage`

---

## Phase 4: UI wiring

### S4.1 Six-digit `verify.tsx`
- **Files:** `app/(auth)/verify.tsx`
- **Do:** replace hard-coded 4 with `OTP_LENGTH`: `Array.from({ length: OTP_LENGTH })`, `maxLength`, `.slice`, `isCodeComplete`. **Adjust the cell layout** (currently `left: index * 59 * scale` inside a 228-wide row, which fits four cells; six need re-spacing, e.g. cell 40, gap 10, row width 290). Use `sanitiseCode`. Keep `autoComplete="one-time-code"`.
- **Done when:** six cells render without overflow on a small device; typing >6 digits is ignored.
- **Commit:** `feat(auth): switch verify screen to six-digit code`

### S4.2 `phone.tsx` copy and send
- **Do:** helper text "four digit" → "six digit". `handleContinue`: call `sendVerificationCode(data.phoneNumber)`; show a spinner/disabled button while pending; on `ok` navigate to `/(auth)/verify`; on error show `authErrorMessage`. Keep the existing local-format validation for the inline error.
- **Commit:** `feat(auth): send verification code from phone screen`

### S4.3 `verify.tsx` verify action
- **Do:** `handleVerify` calls `verifyCode(data.phoneNumber, code)`; on `ok` continue (S8 wires profile creation); on error show message and clear the code on `INVALID_OTP`. Disable the button while pending to prevent double submit.
- **Commit:** `feat(auth): verify code on verify screen`

### S4.4 Resend
- **Do:** `handleResend` calls `sendVerificationCode` again and starts the countdown using `RESEND_SECONDS`. Fix copy: "You can resend codes in two minutes" must come from the constant (e.g. "in 2 minutes"). Show `RATE_LIMITED` message if the server refuses.
- **Commit:** `feat(auth): wire resend with server rate-limit handling`

### S4.5 Display the number being texted
- **Do:** The title "We're sending the verification code to this number" shows nothing. Show `formatForDisplay` of the number beneath it (do not log it).
- **Commit:** `feat(auth): show target phone number on verify screen`

---

## Phase 5: Routing fixes

### S5.1 "Sign in" → phone
- **Files:** `app/(auth)/onboarding.tsx`
- **Do:** "Sign in" currently goes to `/(auth)/verify`, which has no number. Route to `/(auth)/phone`. Splash `index.tsx` must also route returning users to `phone`, not `verify`.
- **Commit:** `fix(auth): route Sign in through phone entry`

### S5.2 Stop using `hasOnboarded` for routing [GATE L7]
- **Files:** `app/(auth)/index.tsx`
- **Do:** Splash always goes to `onboarding`. Remove the `AsyncStorage` read. Leave the key harmlessly unused or remove the constant.
- **Commit:** `refactor(auth): route splash without hasOnboarded flag`

### S5.3 Fix `_layout.tsx` order
- **Files:** `app/(auth)/_layout.tsx`
- **Do:** `name` is listed before `user-type`; navigation is `user-type` then `name`. Reorder. Remove or keep orphan `welcome-loading.tsx` (decide; recommend delete if unreferenced).
- **Commit:** `chore(auth): align auth stack order with navigation`

### S5.4 Verify `login-bridge` and `other-conditions` hops
- **Do:** Read `other-conditions.tsx` and `login-bridge.tsx`; confirm `other-conditions` → `login-bridge` → `phone`. Fix if not.
- **Commit:** `fix(auth): ensure other-conditions leads to login-bridge`

### S5.5 Returning user with no profile [GATE L7]
- **Do:** After a successful verify (S8.1), `hasProfile` false and onboarding data empty → route to `/(auth)/user-type` with the user already authenticated; at the end (`login-bridge`) skip `phone`/`verify` and call profile creation directly. Implement via a `isAuthenticatedOnboarding` flag derived from `session`.
- **Commit:** `feat(auth): let signed-in users without a profile complete onboarding`

---

## Phase 6: Profile database

### S6.1 Insert privileges migration [GATE L9]
- **Files:** new `supabase/migrations/<timestamp>_grant_profile_insert_privileges.sql`
- **Do:** `grant insert on public.users, public.patients, public.patient_musko_skeletal_pain to authenticated;` (nothing for `anon`; no update/delete). Rollback comment. RLS insert policies already exist (`users_insert`: `auth_id = auth.uid()`; `patients_insert`: `users_id = current_users_id()`; `pmsp_insert`: `is_own_patient_record`), so confirm each in the schema notes.
- **Commit:** `feat(db): grant authenticated insert on profile tables`

### S6.2 [B] `users.user_type` column
- **Do:** Add `user_type text not null default 'patient' check (user_type in ('patient','support_person'))`. Existing rows default to patient. Regenerate `src/types/database.ts` **via CI instructions** (see testing doc: the types-diff check tells you what to commit).
- **Commit:** `feat(db): add user_type to users`

### S6.3 Name length (L10)
- **Option 1 (recommended):** change UI `maxLength` 50 → 45 and validation message in `name.tsx`; no migration.
- **Option 2:** migration widening `users.name` to 100.
- **Commit:** `fix(auth): align name length limit with database`

### S6.4 `create_profile` function
- **Files:** new migration `<timestamp>_create_profile.sql`
- **Signature (illustrative; confirm columns from S1.1):**
  `create_profile(p_name text, p_user_type text, p_sex text, p_year_of_birth int, p_has_diagnosis boolean, p_conditions text[], p_other_conditions text, p_phone text) returns void`
- **Behaviour:**
  1. `auth.uid()` null → `raise exception 'NO_SESSION' using errcode = 'P0001'`.
  2. Profile already exists for this `auth_id` → `PROFILE_EXISTS`.
  3. Validate: trimmed non-empty name ≤ 45; sex ∈ allowed DB values or null; year within 1900 to current year or null; phone matches `^\+614\d{8}$`; each condition non-blank, ≤ 45 chars; de-duplicate conditions.
  4. Insert `users` row (`auth_id = auth.uid()`, name, phone, [B] user_type).
  5. If patient: insert `patients` row (sex, year_of_birth, other_conditions) linked via `users_id`; insert one `patient_musko_skeletal_pain` row per condition (`disease`).
  6. [B] support person: only the `users` row.
  7. All in one function call, so any failure rolls everything back.
- **Security:** invoker, `set search_path = public`, `revoke all … from public, anon; grant execute … to authenticated`.
- **Commit:** `feat(db): add atomic create_profile function`

### S6.5 pgTAP tests for grants and function
- **Files:** `supabase/tests/database/060_profile_privileges.test.sql`, `061_create_profile.test.sql`
- **Cases:** see `testing-and-cicd.md` §5. Minimum: function exists; anon cannot execute; authenticated can; success creates expected rows; second call → `PROFILE_EXISTS`; no session → `NO_SESSION`; name too long / blank; bad sex; year out of range; bad phone; duplicate/blank conditions; atomicity (invalid 2nd condition leaves no `users` row); user B cannot see user A's rows; `anon` has no insert on the three tables; `authenticated` has no update/delete.
- **Commit:** `test(db): cover create_profile and profile table privileges`

### S6.6 Regenerate types
- **Do:** CI's "Generated types match the migrations" step will fail with a diff. Take the diff output (or run `supabase gen types typescript --local > src/types/database.ts` on any machine that has the stack; otherwise copy the generated file from the CI log/artifact) and commit.
- **Commit:** `chore(db): regenerate database types`

---

## Phase 7: Mapping and service

### S7.1 Pure mapper
- **Files:** `src/features/auth/profile.ts`, `profile.test.ts`
- **Do:** `toProfileArgs(onboarding): Result<CreateProfileArgs>`: trims name, maps `sex` (`'female'`→`'Female'`, `'male'`→`'Male'`, `'prefer not to say'`→`'Prefer not to say'`), `userType` `'support-person'`→`'support_person'`, uses E.164 phone from `toE164`, drops blank conditions, trims `otherConditions` (empty → null), empties conditions when `hasDiagnosis === false`, and returns a typed `VALIDATION` error with `field` for the first problem.
- **Tests:** every mapping; each failure field; support-person output.
- **Commit:** `feat(auth): map onboarding answers to profile arguments`

### S7.2 `createProfile` service
- **Files:** `src/services/profile.ts`, `profile.test.ts`
- **Do:** `createProfile(onboardingData, client = supabase)`: map → `client.rpc('create_profile', args)` in `run()`. Treat `PROFILE_EXISTS` as success (idempotent retry after a lost response).
- **Tests:** mapper failure makes no rpc call; success; `PROFILE_EXISTS` → ok; other errors mapped.
- **Commit:** `feat(auth): add createProfile service`

### S7.3 Payload hygiene test
- **Do:** Test that the RPC args never include a user id (the function derives it) and contain no `undefined` values.
- **Commit:** `test(auth): ensure profile payload carries no user id`

### S7.4 Coverage list
- **Commit:** `test(auth): add profile modules to coverage`

---

## Phase 8: End-to-end wiring

### S8.1 After verify: decide where to go
- **Do:** In `verify.tsx` after `verifyCode` ok: call `hasProfile`. If true → `/(tabs)/home` (skip the confirmation slides for returning users). If false and onboarding data is complete → `createProfile`, then `/(auth)/verification-confirmation`. If false and data empty → S5.5 path.
- **Failure handling:** if `createProfile` fails, keep the user signed in, show a retry button that calls `createProfile` only (not `verifyCode` again).
- **Commit:** `feat(auth): create profile or route returning user after verify`

### S8.2 `AuthContext` profile state
- **Files:** `src/context/AuthContext.tsx`
- **Do:** expose `hasProfile: boolean | null` (null while loading). Refresh on session change and after `createProfile`.
- **Commit:** `feat(auth): expose hasProfile from AuthContext`

### S8.3 Root guard
- **Files:** `app/_layout.tsx`
- **Do:** `Stack.Protected` guards: `(tabs)` when `session && hasProfile`; `(auth)` otherwise. Show the splash/loader while `loading || hasProfile === null`. Keep the dev `bypassAuth` flag but make it `__DEV__`-only.
- **Commit:** `feat(auth): guard tabs behind session and profile`

### S8.4 Sign out
- **Do:** `AuthDebug` and Account → Sign out call `signOut` from `auth.ts`; on success the guard returns the user to `(auth)`; clear `OnboardingContext`.
- **Commit:** `feat(auth): sign out via auth service and reset onboarding`

---

## Phase 9: Dev harness retirement [GATE L14]

### S9.1 Gate `dev-login`
- **Do:** Make the route usable only when `__DEV__`; otherwise redirect to `(auth)`. Update the route so developers can still use it until test OTP is proven. 
- **Commit:** `chore(auth): restrict dev-login to development builds`

### S9.2 Remove `AuthDebug`
- **Files:** `app/(tabs)/home.tsx`
- **Do:** remove the temporary panel once S8.4 provides real sign-out.
- **Commit:** `chore(auth): remove AuthDebug panel from home`

### S9.3 Production auth settings (record, do not automate)
- **Do:** Write `docs/backend/production-auth-checklist.md`: email provider and `signUp` disabled; phone enabled; **no test OTP entries**; rate limits; `jwt_expiry`; refresh-token rotation on; captcha decision; session-encryption decision (L12); redirect URLs.
- **Commit:** `docs(auth): add production auth checklist`

---

## Phase 10: Docs and handover

- **S10.1** Update README Testing section and `docs/testing.md` (see `testing-and-cicd.md` §9). Commit: `docs: describe CI-only testing and auth tests`
- **S10.2** Add `docs/backend/login-backend.md`: flow diagram, service API, error codes, how to sign in as a developer (test number and code). Commit: `docs(auth): document login back end`
- **S10.3** Update `.env.example` (if present) with any new variable names, **names only**. Commit: `docs: list auth environment variables`

---

## 4. Verification matrix

| Requirement | Proven by | Layer | CI job |
| --- | --- | --- | --- |
| Local numbers become `+614…`; bad numbers rejected | `phone.test.ts` | Unit | `unit-tests` |
| OTP is exactly 6 digits | `otp.test.ts` | Unit | `unit-tests` |
| Bad phone/code never reaches Supabase | `auth.test.ts` (no client call) | Service | `unit-tests` |
| Auth errors map to app codes and friendly text | `errors.test.ts`, `messages.test.ts` | Unit | `unit-tests` |
| Onboarding answers map correctly to DB values | `profile.test.ts` (features) | Unit | `unit-tests` |
| Profile creation is atomic | `061_create_profile` | Database | `database-tests` |
| Second profile creation rejected | `061_create_profile` | Database | `database-tests` |
| User cannot read another user's profile rows | `061_create_profile` / RLS tests | Database | `database-tests` |
| `anon` cannot call `create_profile` or insert | `060_profile_privileges` | Database | `database-tests` |
| Types match migrations | types-diff step | Static | `database-tests` |
| Existing migrations unchanged | migration-immutability step | Static | `static-checks` |
| No secrets committed | secret scan | Static | `static-checks` |
| End-to-end OTP sign-in works against real Supabase | Manual dev checklist (§5) or optional CI integration job | Manual / Integration | n/a |

### 5. Manual dev checklist (before merging Phase 8)
1. Fresh install → onboarding → phone (test number) → code → profile created → home.
2. Sign out → Sign in → phone → code → home directly (no onboarding).
3. Wrong code three times → friendly error each time, no crash.
4. Resend before countdown ends → blocked in UI; server limit message if forced.
5. Kill the app mid-verify and reopen → no half-created profile (check the dev dashboard).
6. In the dashboard, confirm one `users` row and one `patients` row, correct casing, E.164 phone.

---

## Appendix A: Known gaps to raise with the schema owner
- Helper functions (`current_users_id`, `is_own_patient_record`, …) are `security definer` **without a fixed `search_path`**. Fix in a separate PR.
- `users.name` is `varchar(45)` while the UI allowed 50 (see L10).
- No columns for consent, `hasDiagnosis`, or user type (consent is intentionally not recorded for now; confirm with MHA that this satisfies privacy obligations).
- `settings/account` assumes email/password (see L16).

## Appendix B: Deferred to the Twilio sprint
- Create Twilio account (A1), choose Programmable Messaging vs Verify, configure in dashboard → Auth → Phone; auth token via `env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)`.
- Sender ID registration (A2) or leased number.
- Decide resend interval and OTP expiry (L3); rate limits (`sms_sent`, `max_frequency`); captcha.
- Remove test numbers from any non-dev project; add a spend alert.
- Session encryption and session length (L12, L13).
- Phone-change re-verification (L17).

---

# Part 2: Driving Claude Code with this plan

## 2.1 One-time setup
1. Save this file and `testing-and-cicd.md` into the repo at `docs/backend/` (commit on a `docs/` branch). Claude Code can then read them with `@docs/backend/login-backend-build-plan.md`.
2. Create `CLAUDE.md` in the repo root containing **only** the guardrails block from section 1 plus one line: "Build plan: `docs/backend/login-backend-build-plan.md`; testing: `docs/backend/testing-and-cicd.md`." Claude Code loads `CLAUDE.md` automatically, so guardrails apply even if you forget to paste them.
3. Commit attribution: the repo's `.claude/settings.local.json` currently blanks commit attribution (`attribution.commit: ""`). Leave it unless you want co-author lines.

## 2.2 The prompt template (one per step)

```text
Read @CLAUDE.md and @docs/backend/login-backend-build-plan.md.

Do ONLY step S3.1 ("sendVerificationCode") from Phase 3. Do not start any other step.

Context from the plan: decisions L1–L6 are settled (E.164 normalisation lives in
src/features/auth/phone.ts, already merged).

Rules:
- Re-read every file before editing it; make the minimum change.
- Write the tests listed in the step in the same commit.
- Run `npm run lint` and `npm run typecheck`. You may run `npm test`.
  Do NOT run supabase start / supabase test db or anything needing Docker.
- Make ONE commit using exactly the suggested message.
- Then stop and tell me: files changed, anything you were unsure about, and
  anything in the step you could not verify.
```

## 2.3 Rhythm
- **Branch per phase** (`feature/auth-phase-3-service`), steps as commits, **PR per phase**.
- After each step: read the diff (`git diff HEAD~1`), then say "next: S3.2".
- When a step needs a **(verify)** item, tell Claude Code to check and report instead of assuming.
- If Claude Code drifts (touches other files, edits a migration), reply: "Revert that and redo only the step. Guardrail 1/13."

## 2.4 Attaching files
| Need | How |
| --- | --- |
| The plan | `@docs/backend/login-backend-build-plan.md` in the prompt |
| A specific source file | `@src/lib/errors.ts` (Claude Code reads it) |
| The schema | `@supabase/migrations/20260902052010_remote_schema.sql` and `@src/types/database.ts` |
| A sibling example to copy | `@supabase/migrations/20261007102120_save_social_health_assessment.sql` ("follow this pattern") |
| Figma/PDF requirements | Drop the PDF in the repo's `docs/` folder or drag it into the session; reference it by path |

Tip: for Phase 6, always include the sibling migration and its pgTAP test (`050_save_social_health_assessment.test.sql`) as the pattern to copy.

## 2.5 Suggested first prompts
1. **Setup:** "Create CLAUDE.md with the guardrails from section 1 of @docs/backend/login-backend-build-plan.md. One commit: `docs: add Claude Code guardrails`."
2. **Phase 1:** run S1.1, then S1.3, S1.4 (S1.2 after A5 is answered).
3. **Phase 6:** start with "Do only S6.1; before writing SQL, show me the exact grants you will add and the policies they rely on."
