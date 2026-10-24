# Support person frontend: merging main and removing workarounds

Branch: `feature/support-person-frontend`. Status: **plan, waiting for approval.**

This branch was built before the app could sign people in or remember whether they're a patient
or a support person, so it used a few stand-ins. `main` now has both (PR #31, onboarding login
backend), along with 157 other commits. This plan brings `main` in and removes the stand-ins
that are no longer needed, in small commits that each leave the app working.

## What main now provides, and what it doesn't

| Stand-in on this branch | Still needed? | Why |
| --- | --- | --- |
| `EXPO_PUBLIC_DEV_USER_TYPE` and `src/features/support-person/account-type.ts` | **No** | Sign-up now saves `users.user_type` (`'patient'` / `'support_person'`) through `create_profile` |
| `homeRouteFor()` in `dev-login.tsx` and `verification-confirmation.tsx` | **No** | On `main`, the root layout decides where to go after sign-in (`refreshProfile`) |
| Placeholder name "Alex" (`SAMPLE_SUPPORT_PERSON_NAME`) | **No** | `users.name` is saved at sign-up |
| Hardcoded colours in `src/components/mpowered/support-person/` | Partly | `main` added `primaryContainer`, `error`, `Radius.pill` and more to `theme.ts` |
| Placeholder patients and requests, and accept / reject / unpair in memory | **Yes** | There's no support person backend: nothing links a support person's account to a patient (`support_persons.users_id` is never set), there's no "pending request" state, and `main`'s `src/services/care-planner.ts` is itself placeholder data |
| "Coming soon" screen for Add/View questions and answers | **Yes, for now** | `main`'s Planner screens only show the patient's *own* appointments. See risk 5 |

## Commits

Each commit should pass `npm run lint`, `npx tsc --noEmit` and `npm test` on its own.

1. **Merge `origin/main` and resolve the 6 conflicts.** Behaviour stays as it is today.
   - `jest.config.js`: keep both coverage lists.
   - `src/constants/theme.ts`: keep `main`'s new tokens plus this branch's `surfaceContainer`. `main` already has the same `secondaryContainer`.
   - `app/(tabs)/settings/index.tsx`: keep the `SettingsHome` refactor, and move `main`'s change (sign out through `signOut()` in `services/auth`) into `SettingsHome.tsx`.
   - `app/_layout.tsx`: combine `main`'s profile check (`canUseApp`, the error screen) with this branch's `(support)` group. The group still uses the dev setting until commit 3.
   - `app/(auth)/verification-confirmation.tsx`: take `main`'s version (`refreshProfile`) and drop this branch's routing.
   - `.env.example`: take `main`'s version and keep the `DEV_USER_TYPE` line until commit 3.
2. **Load the account type and name with the profile check.** This changes the login code (see risk 1).
   - `src/services/auth.ts`: `hasProfile` also selects `user_type, name` and returns them, still filtered by `auth_id`.
   - `src/context/AuthContext.tsx`: expose `profile: { userType, name } | null`. `hasProfile` keeps working as before.
   - Update the `services/auth` tests, and add tests for:
     - returning `user_type` and `name`
     - a support person profile
     - the query still filtering by `auth_id`
3. **Choose the app from the saved account type, and remove the dev setting.**
   - `app/_layout.tsx`: use `profile.userType === 'support_person'` for the `(support)` and `(tabs)` groups.
   - Delete `account-type.ts`, `homeRouteFor` and `EXPO_PUBLIC_DEV_USER_TYPE`, including from `.env.example`.
   - Restore `main`'s `dev-login.tsx`.
4. **Greet the real name.** Use `profile.name` on the Care Planner home, and delete `SAMPLE_SUPPORT_PERSON_NAME`.
5. **Use main's colour tokens** *(optional)*. Replace hardcoded values in `src/components/mpowered/support-person/` with `Colors.light.primaryContainer`, `Radius.pill` and so on. Nothing should look different.
6. **Update the "coming soon" TODO.** Point it at `main`'s Planner and explain why it isn't linked yet. Comment only.
7. **Add a second local test phone number** *(optional; changes the shared `supabase/config.toml`)*. For example `61491570007 = "123456"`, so testers can have a patient account and a support person account side by side.
8. **Docs.** Update `docs/support-person-frontend.md`:
   - the new way to test
   - mark the account type question as answered
   - list what still uses placeholder data, and why

## Most likely problems, the options, and the recommendation

### 1. Changing the login code (commit 2): medium risk

To show the support person app, the root layout needs the user's `user_type` as soon as they sign in.
`AuthContext` currently only knows *whether* a profile exists (`hasProfile`). The login teammate's
handover note lists this as a known gap for someone to pick up (point 3: "`AuthContext` and
`hasProfile()` don't expose `user_type`"), so the change is expected rather than a surprise.
It still edits their code, so tell them first.

**Must keep:** the query must stay filtered by `auth_id`. `users_select` also returns a
patient's `users` row to their support persons. Without the filter, the check could pick up the
patient's name or type instead of the signed-in user's. `hasProfile` already filters this way;
commit 2 must not break it, and will add a test proving it.

| Option | Upside | Downside |
| --- | --- | --- |
| **A. Make the existing profile check also return `user_type` and `name`** | One query instead of two. The type arrives at the same moment as `hasProfile`, so the app never shows the wrong group first. Reuses the login teammate's careful handling: results tied to the user they were checked for, and errors | Changes code another teammate owns. Their tests need updating |
| B. Run a second query in the root layout for the user type | Doesn't touch `AuthContext` or `services/auth.ts` | Two loading states to coordinate. Between the two queries, a support person could briefly be sent into the patient tabs |
| C. Save the type on the device during onboarding (AsyncStorage) | No database call | Wrong after reinstalling, on a new phone, or for anyone signing in on an existing account. The database is the source of truth |

**Recommendation: A.** It's the only option without a window where the wrong app shows, and it keeps
one source of truth. Because it changes the login teammate's code, **tell them before starting**,
keep the change small (extra columns plus one extra field in the context), and leave the
existing `hasProfile` behaviour exactly as it is so their screens aren't affected.

### 2. Combining the two versions of `app/_layout.tsx` (commits 1 and 3)

Both sides changed the root layout: `main` added "needs a session **and** a profile", and this
branch added the `(support)` group. A mistake here can leave someone stuck on a blank screen,
or show a support person the patient app.

- **What can go wrong:**
  - While the profile is loading (`hasProfile === null`), neither app may open. That's intended on `main`: the user stays in `(auth)` so signing in isn't interrupted.
  - Getting the condition wrong could open both apps, or neither.
- **Options:**
  - **(a) One `canUseApp` check, then choose the group by type:** `(tabs)` when `canUseApp && !isSupport`, `(support)` when `canUseApp && isSupport`.
  - (b) Separate rules per group that each repeat the session and profile checks.
- **Recommendation: (a).** One place decides whether the user can use the app at all, and the type only picks which app. `BYPASS_AUTH` keeps opening every group, as it does today.
- **Why it matters:** support persons have a `users` row but **no `patients` row** (handover note). Patient screens that look up a `patient_id` would fail for them, so they must never reach `(tabs)`.
- **App-side only:** this guard only stops the *app* showing patient features. The database has no `user_type` checks (handover note, point 4), so a support person could still, for example, save a pain entry through the API. Database checks are backend follow-up (see "Still open"). Say this in the PR.
- **Checks after merging:**
  - sign in as a patient
  - sign in as a support person
  - sign out of each
  - the "We could not load your account" error screen still appears with no connection

### 3. Removing the dev setting makes the support person app harder to reach (commit 3)

Today anyone can flip `EXPO_PUBLIC_DEV_USER_TYPE` to see the support person app. Afterwards, you need a
real support person account, which means local Supabase and an SMS code. Twilio isn't connected,
so only the numbers in `[auth.sms.test_otp]` work, and there is currently **one**.

| Option | Upside | Downside |
| --- | --- | --- |
| **Remove the setting and add a second test number (commit 7)** | No fake paths in the app. Testers use the real sign-up | Needs local Supabase running. Changes the shared `config.toml` |
| Keep `DEV_USER_TYPE` as a dev-only override on top of the real type | Quickest way to switch apps | Exactly the kind of stand-in this plan removes. Two ways to decide the app, so "works for me" bugs |
| Rely only on `BYPASS_AUTH=true` and going to `/care-planner` directly | No setup | No signed-in user, so anything that needs a profile (like the name greeting) shows its fallback |

**Recommendation:** remove the setting and do commit 7. Also document the `BYPASS_AUTH` shortcut for
quick visual checks. If changing `config.toml` isn't welcome, skip commit 7 and testers can delete
and recreate the one test account to switch type.

### 4. Losing main's change in the Settings conflict (commit 1)

This branch moved the patient Settings home into `SettingsHome.tsx`. `main` changed the same file's
sign-out to go through `signOut()` from `services/auth`, which returns a `Result` instead of throwing.
Git will only show the conflict in `settings/index.tsx`, so the fix has to be carried over to
`SettingsHome.tsx` **by hand**. If that's missed, it's silently lost.

- **Options:**
  - **(a) Keep the refactor and port `main`'s change into it**
  - (b) Take `main`'s file and duplicate the layout for the support person Settings again
- **Recommendation: (a).** Duplicating would bring back 150 lines of copied styles.
- **After resolving:** compare `SettingsHome.tsx` against `main`'s `settings/index.tsx` line by line, and test signing out in both apps.

### 5. Linking the appointment buttons to main's new Planner screens (decided against, for now)

`main` now has real-looking Planner screens (`questions.tsx`, `review.tsx`, answer popups), so it's
tempting to send "Add questions" / "View doctor's answer" there.

**Why not yet:**
- **The screens are built around the signed-in patient's own appointments.** They take an `appointmentId` from the patient's own placeholder data (`src/services/care-planner.ts`, marked MOCK). This branch's placeholder appointment ids don't exist there, so the screens would show nothing or the wrong appointment.
- **They don't know about support person permissions.** A support person with only "Add questions" could reach the answer controls, which US18 and the security requirement (2.2.2) rule out.

**Options:**
- **(a) Keep the "coming soon" screen and update its TODO** (commit 6)
- (b) Link now and accept the wrong data and missing permission checks
- (c) Build support person versions of those screens in this branch

**Recommendation: (a).** Option (b) would look done but behave wrongly. Option (c) is a separate
piece of work that needs the Planner owner involved, because the screens need to accept "whose
appointment" and "what am I allowed to do".

### 6. Merge or rebase

- **Options:**
  - **(a) Merge `origin/main` into the branch** (as was done on 15 Oct)
  - (b) Rebase the branch's commits onto `main`
- **Recommendation: (a).** The branch is already on GitHub, and rebasing rewrites commits other people may have pulled. A merge resolves the conflicts once, in one commit, and keeps the commit list readable.

### Smaller things to know

- **Stale typed routes:** `.expo/types/router.d.ts` is generated and ignored by git. The local copy is stale (from 15 Oct), so `npx tsc --noEmit` reports false errors until you run `npx expo start` once. CI isn't affected.
- **In-between commits:** between commits 1 and 3, a support person who signs up for real still lands in the patient tabs, because the dev setting still decides. Every commit still builds and passes its tests. Just don't test the support person sign-up until commit 3.
- **Dev login:** on `main`, accounts made through `/dev-login` have no profile row, so they stay in the sign-in screens. That's already true on `main` and isn't something this branch changes. Use onboarding plus a test number instead.
- **Theme:** both sides added `secondaryContainer` with the same value, so keeping one is enough.

## Still open after this plan

- **Support person versions of the Planner question and answer screens**, with permission checks (see risk 5).
- **Designer questions** listed in `docs/support-person-frontend.md`.

**Backend follow-up**, from the login teammate's handover note
("Support person: what's already done on `feature/onboarding-login-backend`"):
- **Point 1: link the support person's account to the patient.** Nothing sets `support_persons.users_id`. The likely approach is matching by phone number, which also fits the requests screen ("Requests can be sent by a patient through your phone number"). Note that `phone_number` isn't unique. This branch's placeholder requests, accept/reject and unpair stay until this exists, along with a pending/accepted state.
- **Point 2: `support_persons.email` is NOT NULL**, but support persons sign up with phone and name only.
- **Point 4: database checks on `user_type`** for patient-only features. This branch only guards the app side.
- **Point 5: pgTAP tests** for a support person reading a patient's data, and for the `support_persons` table.
- **Point 6: review the privileges on `support_persons`.** `authenticated` currently has none.
- **Point 7: define the `access_type` values.** The frontend uses `canAddQuestions` / `canAddAnswers`, so converting from whatever format is chosen happens in one place.
- **Queries for a supported patient's appointments.** `main`'s `src/services/care-planner.ts` is still placeholder data.
