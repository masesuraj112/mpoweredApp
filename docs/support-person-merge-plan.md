# Support person frontend: merging main and removing workarounds

Branch: `feature/support-person-frontend`. Status: **done.** Commits 0 to 16 are on the branch (commit 0 is the plan itself).

This branch was built before the app could sign people in or remember whether they're a patient
or a support person, so it used a few stand-ins. `main` now has both (PR #31, onboarding login
backend), along with 157 other commits. This plan brings `main` in and removes the stand-ins
that are no longer needed, in small commits that can each be reverted on their own.

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

Every commit must pass `npm run lint`, `npx tsc --noEmit` and `npm test` on its own, so any one of them
can be reverted without breaking the others.

**How the merge stays undoable:** a merge commit is the hardest kind to undo. Reverting one needs
`git revert -m 1`, and merging `main` again afterwards becomes awkward. So the merge commit **takes
`main`'s version** of every file where this branch's change is risky, and changes nothing else. This
branch's changes to those files are then redone in their own small commits (2 to 4), each of which
reverts cleanly with a plain `git revert <commit>`.

### Phase 0: record the plan
0. **Add this plan** (`docs/support-person-merge-plan.md`). Docs only.

### Phase A: merge
1. **Merge `origin/main`, taking main's version of the risky files.**
   - Take `main`'s version of:
     - `app/_layout.tsx`
     - `app/(tabs)/settings/index.tsx`
     - `app/(auth)/verification-confirmation.tsx`
     - `.env.example`
   - Combine both sides only where the code won't build otherwise:
     - `jest.config.js`: both coverage lists
     - `src/constants/theme.ts`: `main`'s new tokens plus this branch's `surfaceContainer`, which the support person components use
   - **After this commit:**
     - The patient app is exactly `main`'s.
     - The support person app is temporarily unreachable after sign-in, until commit 4. It's still reachable with `BYPASS_AUTH=true`.

### Phase B: redo this branch's changes on top of main's code
2. **`SettingsHome` signs out through `signOut()` from `services/auth`.** This is `main`'s change, carried into the shared component the support person Settings uses. One file.
3. **The patient Settings home uses `SettingsHome` again.** Redoes this branch's refactor of `app/(tabs)/settings/index.tsx`. Nothing should look different.
4. **Add the `(support)` group to `main`'s root layout.** It sits on top of `main`'s profile check (`canUseApp`, the error screen). For now it's still chosen by the dev setting.

### Phase C: use the saved account type
5. **Add `getProfile()` to `services/auth.ts`.** It returns `{ userType, name } | null`, filtered by `auth_id`, with tests. Nothing calls it yet. `hasProfile()` is **not** changed, because the verify screen uses it.
6. **`AuthContext` uses `getProfile()` and exposes `profile`.** It also returns `hasProfile` (now worked out from `profile`), with the same values and timing as before.
7. **The root layout chooses `(support)` or `(tabs)` from `profile.userType`.** It stops reading the dev setting.
8. **Restore `main`'s `app/(auth)/dev-login.tsx`.** It no longer imports `homeRouteFor`.
9. **Delete `src/features/support-person/account-type.ts`.** Nothing uses it after commits 7 and 8. This also removes `EXPO_PUBLIC_DEV_USER_TYPE`; the merge already dropped it from `.env.example`.
10. **Greet the real name.** Use `profile.name` on the Care Planner home, and delete `SAMPLE_SUPPORT_PERSON_NAME`.

### Phase D: tidy up (optional)
11. **Use `Radius.pill`** instead of `borderRadius: 999` / `100` in the support person components. Nothing should look different.
12. **Use `main`'s colour tokens** (e.g. `Colors.light.primaryContainer` for `#EADDFF`) in the support person components. Nothing should look different.
13. **Update the "coming soon" TODO.** Point it at `main`'s Planner and explain why it isn't linked yet (risk 5). Comment only.
14. **Add a second local test phone number** *(changes the shared `supabase/config.toml`)*. For example `61491570007 = "123456"`, so testers can have a patient account and a support person account side by side.

### Phase E: docs
15. **`docs/support-person-frontend.md`: testing.** Replace the `DEV_USER_TYPE` instructions with "onboarding plus a test number", and the `BYPASS_AUTH` shortcut.
16. **`docs/support-person-frontend.md`: status.** Mark the account type question as answered, and list what still uses placeholder data and why.

### What the app does at each point

| After commit | Patient app | Support person app after real sign-in |
| --- | --- | --- |
| 1 to 3 | Same as `main` | Unreachable. Lands in the patient tabs (as on `main` today) |
| 4 to 6 | Same as `main` | Only with `EXPO_PUBLIC_DEV_USER_TYPE=support-person` (as on this branch today) |
| 7 onwards | Same as `main` | Opens automatically for accounts saved as `support_person` |

### Undoing a commit
- **Commits 0 and 2 to 16:** `git revert <commit>`. Each changes one idea, and later commits only build on it where noted. For example, reverting commit 5 also needs 6 and 7 reverted first, because they use `getProfile()`.
- **Commit 1 (the merge):** `git revert -m 1 <commit>`. Avoid this if possible. Because it only takes `main`'s files, problems are much more likely to come from commits 2 to 4, which revert normally.
- **Before pushing:** everything is local, so nothing affects anyone else until `git push`.

## Will this break anything?

### For the patient app and other teammates: no expected changes, with three things to watch

- **Patient app:** after commit 3, the patient Settings home should match `main` exactly, including `main`'s `signOut()`. Every other patient screen comes straight from `main`. Check: compare the commit 3 diff against `main`'s `settings/index.tsx`, and sign out as a patient.
- **Login:** `verify.tsx` keeps using the unchanged `hasProfile()`. `AuthContext` keeps returning `hasProfile` with the same values; it now comes from one query that also reads `user_type` and `name`.
- **⚠️ Local databases without the newest migrations.** `getProfile()` reads the `users.user_type` column (`20261014100100_add_users_user_type.sql`). On a local database that hasn't had that migration applied, the query fails, and **every** signed-in user sees "We could not load your account". Fix: `supabase db reset` (or apply the migrations). The hosted database gets migrations automatically since PR #37, so it isn't affected. Tell the team when this lands.
- **⚠️ Anyone relying on `EXPO_PUBLIC_DEV_USER_TYPE`:** after commit 9 it does nothing. Leaving it in `.env` is harmless, but it no longer switches apps. Testers need a real support person account (risk 3).
- **⚠️ Other open branches may conflict with:**
  - the `SettingsHome` refactor, for anyone editing `app/(tabs)/settings/index.tsx`
  - the root layout change, for anyone editing `app/_layout.tsx`
  - the `AuthContext` change
  
  These are normal merge conflicts, not broken behaviour. Your own paused `feature/settings-backend` touches the Settings sub-pages, not the home, so it should be unaffected.

### For the support person app
- **During the series:** see the table above. Between commits 1 and 3 it can't be reached after a real sign-in. Every commit still builds and passes its tests.
- **After the series:**
  - It needs an account saved as `support_person`. Onboarding plus a test number does this (risk 3).
  - Anyone signing up as a support person today lands in the patient tabs. After this series they get the support person app, which is the intended change.
  - A `profile` is always loaded before either app opens, so the greeting's "no name" fallback only shows with `BYPASS_AUTH=true`.
- **Not fixed here:** the database still doesn't stop a support person using patient features through the API (handover note, point 4). This branch only guards the app.

### Things that look broken but aren't
- **Type check errors on routes like `/(auth)/sex`:** the stale `.expo/types/router.d.ts` on this machine. Run `npx expo start` once to regenerate it. CI isn't affected.
- **`/dev-login` accounts stay on the sign-in screens:** they have no profile row. That's already true on `main`.

## Most likely problems, the options, and the recommendation

### 1. Changing the login code (commits 5 and 6): low to medium risk

To show the support person app, the root layout needs the user's `user_type` as soon as they sign in.
`AuthContext` currently only knows *whether* a profile exists (`hasProfile`). The login teammate's
handover note lists this as a known gap for someone to pick up (point 3: "`AuthContext` and
`hasProfile()` don't expose `user_type`"), so the change is expected rather than a surprise.
It still edits their `AuthContext`, so tell them first.

**Must keep:** the query must stay filtered by `auth_id`. `users_select` also returns a
patient's `users` row to their support persons. Without the filter, the check could pick up the
patient's name or type instead of the signed-in user's. Commit 5 includes a test proving it.

| Option | Upside | Downside |
| --- | --- | --- |
| **A. A new `getProfile()` next to `hasProfile()`, used by `AuthContext`** | `hasProfile()` and `verify.tsx` stay exactly as they are. The type arrives at the same moment as `hasProfile`, so the app never shows the wrong group first. Reuses the login teammate's handling in `AuthContext`: results tied to the user they were checked for, and errors | Still edits `AuthContext`. Two similar functions in `services/auth.ts` |
| B. Change `hasProfile()` itself to return the profile | One function | Changes what `verify.tsx` gets back, and their tests |
| C. A second query in the root layout | Doesn't touch `AuthContext` | Two loading states. A support person could briefly see the patient tabs |
| D. Save the type on the device during onboarding (AsyncStorage) | No database call | Wrong after reinstalling, on a new phone, or for anyone signing in on an existing account |

**Recommendation: A.** It's the only option with no moment where the wrong app shows, and it leaves the
login teammate's existing function and screen untouched. Splitting it into commit 5 (add the
function) and commit 6 (use it) means `AuthContext` can be reverted without losing the tested function.

### 2. Combining the two versions of `app/_layout.tsx` (commits 1, 4 and 7)

Both sides changed the root layout: `main` added "needs a session **and** a profile", and this
branch added the `(support)` group. A mistake here can leave someone stuck on a blank screen,
or show a support person the patient app.

- **How the plan limits the risk:**
  - The merge takes `main`'s file unchanged (commit 1).
  - Commit 4 only *adds* the group.
  - Commit 7 only changes *which* group opens.
  - Each step can be tested and reverted on its own.
- **What can go wrong:**
  - While the profile is loading (`hasProfile === null`), neither app may open. That's intended on `main`: the user stays in `(auth)` so signing in isn't interrupted.
  - Getting the condition wrong could open both apps, or neither.
- **Options:**
  - **(a) One `canUseApp` check, then choose the group by type:** `(tabs)` when `canUseApp && !isSupport`, `(support)` when `canUseApp && isSupport`.
  - (b) Separate rules per group that each repeat the session and profile checks.
- **Recommendation: (a).** One place decides whether the user can use the app at all, and the type only picks which app. `BYPASS_AUTH` keeps opening every group, as it does today.
- **Why it matters:** support persons have a `users` row but **no `patients` row** (handover note). Patient screens that look up a `patient_id` would fail for them, so they must never reach `(tabs)`.
- **App-side only:** this guard only stops the *app* showing patient features. The database has no `user_type` checks (handover note, point 4), so a support person could still, for example, save a pain entry through the API. Database checks are backend follow-up (see "Still open"). Say this in the PR.
- **Checks after commits 4 and 7:**
  - sign in as a patient
  - sign in as a support person
  - sign out of each
  - the "We could not load your account" error screen still appears with no connection

### 3. Removing the dev setting makes the support person app harder to reach (commit 9)

Today anyone can flip `EXPO_PUBLIC_DEV_USER_TYPE` to see the support person app. Afterwards, you need a
real support person account, which means local Supabase and an SMS code. Twilio isn't connected,
so only the numbers in `[auth.sms.test_otp]` work, and there is currently **one**.

| Option | Upside | Downside |
| --- | --- | --- |
| **Remove the setting and add a second test number (commit 14)** | No fake paths in the app. Testers use the real sign-up | Needs local Supabase running. Changes the shared `config.toml` |
| Keep `DEV_USER_TYPE` as a dev-only override on top of the real type | Quickest way to switch apps | Exactly the kind of stand-in this plan removes. Two ways to decide the app, so "works for me" bugs |
| Rely only on `BYPASS_AUTH=true` and going to `/care-planner` directly | No setup | No signed-in user, so anything that needs a profile (like the name greeting) shows its fallback |

**Recommendation:** remove the setting and do commit 14. Also document the `BYPASS_AUTH` shortcut for
quick visual checks. If changing `config.toml` isn't welcome, skip commit 14 and testers can delete
and recreate the one test account to switch type.

### 4. Losing main's Settings change (commits 1 to 3)

This branch moved the patient Settings home into `SettingsHome.tsx`. `main` changed the same file's
sign-out to go through `signOut()` from `services/auth`, which returns a `Result` instead of throwing.

- **Options:**
  - **(a) Take `main`'s file in the merge, carry its change into `SettingsHome` (commit 2), then redo the refactor (commit 3)**
  - (b) Resolve it all inside the merge commit
  - (c) Keep `main`'s file and duplicate the layout for the support person Settings
- **Recommendation: (a).**
  - With (b), the change is easy to miss, because Git only flags `settings/index.tsx` and not `SettingsHome.tsx`, and it would be buried in the merge.
  - With (a), commit 2 is a one-file change that shows `main`'s fix arriving in `SettingsHome`, and commit 3 can be compared directly against `main`'s file.
  - (c) would bring back 150 lines of copied styles.
- **After commit 3:** sign out in both apps.

### 5. Linking the appointment buttons to main's new Planner screens (decided against, for now)

`main` now has real-looking Planner screens (`questions.tsx`, `review.tsx`, answer popups), so it's
tempting to send "Add questions" / "View doctor's answer" there.

**Why not yet:**
- **The screens are built around the signed-in patient's own appointments.** They take an `appointmentId` from the patient's own placeholder data (`src/services/care-planner.ts`, marked MOCK). This branch's placeholder appointment ids don't exist there, so the screens would show nothing or the wrong appointment.
- **They don't know about support person permissions.** A support person with only "Add questions" could reach the answer controls, which US18 and the security requirement (2.2.2) rule out.

**Options:**
- **(a) Keep the "coming soon" screen and update its TODO** (commit 13)
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
