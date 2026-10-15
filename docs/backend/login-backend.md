# Login back end

How phone sign-in and profile creation work in MPowered, and how to sign in as a developer. The build history and decisions are in `login-backend-build-plan.md`; the Supabase settings production needs are in `production-auth-checklist.md`.

## Flow

```text
Splash -> Onboarding slides
   |                 |
   | Get started     | Sign in
   v                 v
user-type -> name -> consent -> (patient only) sex -> demographics -> health-conditions
                       |                                              |
                       | (support person)                  diagnosis-conditions (if yes)
                       |                                              |
                       |                                      other-conditions
                       v                                              v
                    login-bridge  <-----------------------------------+
                       |
                       | not signed in               signed in, no profile
                       v                             -> create profile here, then confirmation
                     phone  -> sendVerificationCode (SMS code)
                       |
                       v
                     verify -> verifyCode (code accepted = signed in)
                       |
                       +-- profile exists ........... root guard opens the tabs (home)
                       +-- no profile, answers complete -> createProfile -> confirmation slides -> home
                       +-- no profile, no answers ...... onboarding (user-type), profile made at login-bridge
```

Sign in (from the slides) goes straight to `phone`. Sign-in and sign-up are the same call: an unknown number gets a code like any other, and the app never says whether an account exists. Whether the user has a profile is checked only **after** the code is accepted.

The onboarding answers live in memory only (`OnboardingProvider` inside the `(auth)` layout) until the profile is written. The provider is unmounted when the auth screens are hidden, so signing out leaves it empty.

## Root guard (`app/_layout.tsx`)

- `(tabs)` is reachable only with a **session and a profile** (`hasProfile === true`).
- Everything else stays in `(auth)`, including a signed-in user whose profile check is still running.
- If the profile check fails (for example no connection) a retry screen is shown.
- `EXPO_PUBLIC_BYPASS_AUTH=true` makes every route reachable, in development builds only.

`AuthContext` exposes `session`, `user`, `loading`, `hasProfile` (`null` while checking), `profileError` and `refreshProfile()`. The confirmation screen calls `refreshProfile()` when the user taps Continue, which is what opens the tabs for a new user.

## Services

All services return `Result<T>` (`{ ok: true, data } | { ok: false, error }`), never throw to the UI, and take the Supabase client as the last optional argument.

| Function | File | Does |
| --- | --- | --- |
| `sendVerificationCode(rawPhone)` | `src/services/auth.ts` | Normalises to E.164 and sends an SMS code (`signInWithOtp`, `shouldCreateUser: true`). Returns `{ phone }`. |
| `verifyCode(rawPhone, code)` | `src/services/auth.ts` | Checks the phone and a six digit code locally, then `verifyOtp`. Returns `{ userId }` only. |
| `signOut()` | `src/services/auth.ts` | Ends the session on this device. |
| `hasProfile()` | `src/services/auth.ts` | Whether a `users` row exists for the signed-in `auth_id`. `NO_SESSION` when signed out. |
| `createProfile(answers)` | `src/services/profile.ts` | Maps the onboarding answers and calls `create_profile`. `PROFILE_EXISTS` counts as success. |

Pure helpers (no Supabase, no React Native) are in `src/features/auth/`:

| Module | Exports |
| --- | --- |
| `phone.ts` | `toE164`, `isValidAuMobile`, `formatForDisplay` |
| `otp.ts` | `OTP_LENGTH`, `RESEND_SECONDS`, `sanitiseCode`, `isCodeComplete` |
| `messages.ts` | `authErrorMessage(code)` |
| `profile.ts` | `toProfileArgs(answers)` |

## `create_profile` (database function)

`create_profile(p_name, p_user_type, p_sex, p_year_of_birth, p_conditions, p_other_conditions, p_phone)`. Security invoker, takes the user from `auth.uid()`, one call so any failure rolls everything back.

- Always creates a `users` row (`user_type` is `patient` or `support_person`).
- For a patient, also creates one `patients` row and one `patient_musko_skeletal_pain` row per condition.
- A support person gets the `users` row only; sex, year and conditions are ignored.
- Existing users, and any row created before `user_type` existed, are `patient`.

## Error codes

| App code | Where it comes from | What the user sees |
| --- | --- | --- |
| `INVALID_PHONE` | Not an Australian mobile (app), or `P0001 INVALID_PHONE` | Enter a valid Australian mobile number |
| `INVALID_OTP` | The code is not six digits (app only) | That code isn't right |
| `OTP_EXPIRED` | Supabase `otp_expired`. Supabase uses it for a **wrong** code too | That code is wrong or has expired |
| `RATE_LIMITED` | Supabase `over_sms_send_rate_limit`, `over_request_rate_limit` | Too many attempts, wait a moment |
| `SMS_FAILED` | Supabase `sms_send_failed` | We couldn't send the code |
| `NETWORK` | Lost connection | Check your connection and try again |
| `PROFILE_EXISTS` | `P0001 PROFILE_EXISTS` | Treated as success by `createProfile` |
| `NO_SESSION` | `P0001 NO_SESSION`, or no signed-in user | Please sign in again |
| `VALIDATION` | App answer checks; `P0001 INVALID_NAME`, `INVALID_SEX`, `INVALID_YEAR`, `INVALID_USER_TYPE`, `INVALID_CONDITION` (in `detail`) | Check your answers |
| `NOT_ALLOWED` | Postgres `42501` | Please sign in again |

## Before you test: the database must have the migrations

CI builds a throwaway local database from the migrations every time, so a green CI run says nothing about the hosted dev project. The app cannot create profiles there until the pending migrations are pushed. Signs that they are missing: after a correct code the app says "Something went wrong. Please try again." and the Try again button keeps failing.

```bash
supabase migration list        # a version with a Local entry and no Remote entry is pending
supabase db push --dry-run     # shows exactly what would be applied
supabase db push
```

- Check the dry run before pushing. If it lists migrations you did not expect, another branch's migrations have not been pushed either; ask whoever merged them.
- Do not paste migrations into the SQL editor: that does not record them in the migration history, and a later `db push` will try to apply them again.
- Do this against the **dev** project only. The project the CLI is linked to is in `supabase/.temp/project-ref` (it must match the project ref in `EXPO_PUBLIC_SUPABASE_URL`).
- The login migrations are `20261014100000_grant_profile_insert_privileges`, `20261014100100_add_users_user_type` and `20261014100200_create_profile`. The first one revokes all privileges on `users`, `patients` and `patient_musko_skeletal_pain` from `anon` and `authenticated` and re-grants select and insert to `authenticated`.

## Signing in as a developer

SMS is not connected yet. The dev project and the local/CI stack use a **test OTP**: a fictional number mapped to a fixed code, so no SMS is sent.

1. Point `.env` at the dev project (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; see `.env.example`) and set `EXPO_PUBLIC_BYPASS_AUTH=false`.
2. Start the app with `npx expo start -c` and open it in Expo Go.
3. Choose **Get started**, answer the onboarding questions, and enter the test number on the phone screen.
4. Enter the code for that number within the expiry time (60 seconds on the dev project).

The number and code are configured in two places, both **development only**: the dev project's Phone provider settings (dashboard) and `[auth.sms.test_otp]` in `supabase/config.toml`. Ask a teammate for the number; use a different fictional number for each developer. Never add test numbers to the production project (see `production-auth-checklist.md`).

Each test number gets a profile the first time. To sign in again as a "new" user, either use another test number or delete the user in the dashboard (Authentication, then Users) on the dev project.

The old email and password harness (`dev-login`) only exists in development builds, and a user created there has no `users` row, so the guard keeps it out of the tabs.

## Not built yet

- Twilio and real SMS (decision L1 and the Twilio sprint), including the resend interval and code expiry (L3).
- Session length and storage encryption (L12, L13).
- Phone number change and re-verification (L17).
- What happens to password and Face ID settings for phone users (L16). The Account screen still assumes an email and password.
