# Sign up vs sign in — Fix Plan

> **Scope:** what happens after the one-time code is verified when someone signs up with a number that already
> has an account, or signs in with a number that has none; and a visible back arrow on the sign-up and sign-in
> screens (section 4.6, added 3 Nov 2026).
> **Branch:** `fix/sign-up-sign-in-mismatch`, from `main` (2 Nov 2026). Owner: Ryan Pham.
> **Status:** plan only. Decisions in section 3 are proposals until approved.
> **No database changes.** The check uses the existing `hasProfile()`; no migration, pgTAP test or Edge Function.

---

## 1. The problem

### How it works today
- **Get started** (`app/(auth)/onboarding.tsx`) → the sign-up questions (user type, name, consent, sex, year of birth,
  conditions) → `login-bridge` → `phone` → `verify`.
- **Sign in** → `phone` → `verify`.
- Both send the code with the same `sendVerificationCode()` (decision L6).
- After a correct code, `finishSignIn()` in `app/(auth)/verify.tsx` decides where to go. It doesn't know which button
  the person started from. It only checks `hasProfile()` and whether the sign-up answers are complete
  (`toProfileArgs(data).ok`).

### The four cases

| Started from | Number | Today | Should be |
| --- | --- | --- | --- |
| Get started | new | Profile created → "verified" slides → Home | Same |
| **Get started** | **has an account** | **Signed straight in to the existing account.** The sign-up answers are thrown away without a word. If the old account is the other user type (patient vs support person), they land in the other app. | Told an account already exists, and asked to sign in to it or use a different number |
| Sign in | has an account | Home | Same |
| **Sign in** | **new** | **Dropped into the sign-up questions** ("I am a…") with no explanation (`router.replace('/(auth)/user-type')`) | Told there's no account for this number, and asked to create one or use a different number |

A number with a login but no profile (someone who stopped part-way through sign-up before) counts as **new**. This
is already true and stays true.

### Why the check happens after the code
Decision **L6** (`login-backend-build-plan.md`) rules out saying whether a number has an account **before** a code is
sent. Anyone could otherwise type numbers in and learn who uses a health app. After a correct code the person has
proved the number is theirs, so telling them about their own account reveals nothing. All new messages appear only
after verification.

## 2. Guardrails

1. Never say whether a number has an account before the code is verified (L6).
2. The existing account's data is never changed by the sign-up answers. A profile is only created for a number with
   none (unchanged rule from L7).
3. Screens follow the new-work styling rules: flex layout, theme colours and spacing, 48dp tap targets, labels for
   screen readers.
4. Don't log phone numbers or codes.
5. One commit per step; `npm run typecheck`, `npm run lint`, `npm test` before each.

## 3. Decisions to approve

| ID | Question | Recommendation | Why |
| --- | --- | --- | --- |
| SU-1 | How does `verify` know which button the person started from? | **An explicit `intent: 'sign-up' \| 'sign-in'` in `OnboardingContext`**, set by **Get started** and **Sign in** | Inferring it from "are the answers complete?" breaks if someone half-fills sign-up, goes back and taps Sign in |
| SU-2 | Sign up with a number that **has an account** | **A "You already have an account" screen**: "There's already an MPowered account for 04xx xxx xxx. The answers you just gave won't be saved." Buttons: **Sign in to my account** (primary → Home, or the support person app) and **Use a different number** (signs out, back to the phone screen with the answers kept) | Says what's happening, and the person chooses. No data is lost from the existing account |
| SU-3 | Sign in with a **new** number | **A "No account found" screen**: "We couldn't find an MPowered account for 04xx xxx xxx." Buttons: **Create an account** (primary → the sign-up questions, still signed in; `login-bridge` then creates the profile, the existing path) and **Use a different number** (signs out, back to the phone screen) | Same reason. The sign-up flow afterwards is the one that already works |
| SU-4 | Where do these messages live? | **One new screen, `app/(auth)/account-check.tsx`**, showing either message from a route param | Keeps `verify.tsx` (already 440 lines on the old canvas layout) from growing. It's built to the new styling rules |
| SU-5 | Existing account is the **other** user type (signed up as a patient, the number is a support person) | **Same SU-2 screen, no extra wording.** Sign in goes to whichever app the account belongs to | One user type per account (S6). Mentioning the type would add little |
| SU-6 | "Use a different number" leaves a login with no profile behind (SU-3) | **Accept it.** Nothing can read it, and today's abandoned sign-ups already leave the same thing | Deleting logins needs the service role (the `delete-account` Edge Function), which is more risk than it removes |
| SU-7 | Wording and layout | **Designer to confirm**; build with the wording above until then | Copy is product's call |
| SU-8 | How to add the back arrow (4.6) | **The navigation stack's own header**, made transparent and showing only the platform back arrow (`app/(auth)/_layout.tsx`) | One change in one file instead of eleven. Each platform gets its own standard arrow, already accessible, sized and labelled. It only appears when there's a screen to go back to |
| SU-9 | Which screens get it (4.6) | **All except** the welcome splash, the "Get started / Sign in" screen, the "verified" slides and `account-check`; and `verify` hides it once the code is accepted | Those are the start, the end, or a point where the person is already signed in and going back would mislead (section 4.6) |

## 4. Design

### 4.1 Intent (SU-1)
- `OnboardingContext` gets `intent: 'sign-up' | 'sign-in' | null` (`null` until a button is tapped).
- `onboarding.tsx`: **Get started** sets `'sign-up'`, **Sign in** sets `'sign-in'`.
- It clears itself like the rest of the onboarding answers: `OnboardingProvider` lives in `app/(auth)/_layout.tsx`,
  so its state is thrown away when the person leaves the sign-in screens (signing in) and starts empty when they
  come back (signing out). Nothing calls `reset()` today, and this plan doesn't need it to.

### 4.2 Deciding the next step (pure)
`src/features/auth/afterVerify.ts`:

```ts
type NextStep = 'home' | 'create-profile' | 'sign-up-questions' | 'account-exists' | 'no-account';

nextStepAfterVerify({ intent, hasProfile, answersComplete }): NextStep
```

| intent | hasProfile | answers complete | Next |
| --- | --- | --- | --- |
| sign-up | false | true | `create-profile` (today's path) |
| sign-up | **true** | any | **`account-exists`** (SU-2) |
| sign-in | true | any | `home` |
| sign-in | **false** | any | **`no-account`** (SU-3) |
| null (shouldn't happen; e.g. a deep link) | true | any | `home` |
| null | false | true / false | `create-profile` / `sign-up-questions` (today's behaviour) |

### 4.3 `verify.tsx`
`finishSignIn()` calls `nextStepAfterVerify()` and acts on it:
- `home`: `refreshProfile()`, as today.
- `create-profile`: `createProfile()`, then the slides, as today.
- `sign-up-questions`: `/(auth)/user-type`, as today.
- `account-exists` and `no-account`: `router.replace('/(auth)/account-check', { reason })`.

### 4.4 `account-check.tsx` (SU-2, SU-3, SU-4)
- Shows the right message and the phone number (`formatForDisplay`).
- **Sign in to my account:** `refreshProfile()`. The root guard then moves them to the tabs or the support app, as it
  does today.
- **Create an account:** sets `intent` to `'sign-up'` and goes to `/(auth)/user-type`. `login-bridge` already creates
  the profile for a signed-in user.
- **Use a different number:** `signOut()` (which also cancels reminders on the notifications branch), then
  `/(auth)/phone`. The sign-up answers stay in `OnboardingContext`, so the person only changes the number.
- While it's showing, the person is signed in but has no profile, or hasn't been sent home yet. The root guard keeps
  them in `(auth)`, which is where this screen lives.

### 4.6 Back arrows (SU-8, SU-9)

**Today:** none of the 15 screens in `app/(auth)` has an on-screen back button. The only way back is the iOS swipe or
the Android Back button. That breaks the rule that nothing may depend on a swipe alone, and isn't obvious to
everyone.

**Change:** in `app/(auth)/_layout.tsx`, show the stack's header on the flow screens, transparent, with no title and
the platform's back arrow only:

```tsx
<Stack screenOptions={{
  headerShown: true,
  headerTransparent: true,
  headerTitle: '',
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal', // the arrow only, no "Back" text
  headerTintColor: Colors.light.primary,
}}>
```

| Screen | Back arrow | Why |
| --- | --- | --- |
| `index` (welcome splash), `onboarding` (Get started / Sign in) | No (`headerShown: false`) | The start of the flow |
| `user-type`, `name`, `consent`, `sex`, `demographics`, `health-conditions`, `diagnosis-conditions`, `other-conditions`, `login-bridge`, `phone` | Yes | Ordinary steps |
| `verify` | Yes, **until the code is accepted**. Then hidden (`navigation.setOptions({ headerBackVisible: false })`) | After a correct code the person is signed in; going back to the phone screen would mislead |
| `account-check` (new) | No | The person is signed in; its own "Use a different number" button is the way back (it signs out first) |
| `verification-confirmation` (the "verified" slides) | No | The account exists; the end of the flow |

- The arrow only shows when there's a screen to go back to. `user-type` reached by `router.replace` after a sign-in
  with no profile has none, which is correct.
- Going back keeps what was entered. The answers live in `OnboardingContext` for the whole flow.
- The older screens use the 412×823 canvas. Their first element sits about 168 points down (scaled), clear of the
  header, so nothing is covered. Check on small phones (section 6).
- The iOS swipe and the Android Back button keep working as now.

### 4.7 What doesn't change
- `sendVerificationCode`, `verifyCode`, `hasProfile` and `createProfile`.
- The database.
- The root guard in `app/_layout.tsx`.

## 5. Steps

| Step | What | Commit |
| --- | --- | --- |
| F0 | This plan, and the decisions approved | `Add the sign up vs sign in fix plan` |
| F1 | `intent` in `OnboardingContext`, set by the two buttons. Context test | `Remember whether the person is signing up or signing in` |
| F2 | `nextStepAfterVerify()` with a test for every row of 4.2 | `Decide where to go after the code is verified` |
| F3 | `account-check.tsx` with screen tests: both messages, all three buttons | `Tell people when the account already exists or doesn't exist` |
| F4 | `verify.tsx` uses F2 and routes to F3; update the verify tests | `Check sign up and sign in against the account after verifying` |
| F5 | Back arrows (4.6): the header in `app/(auth)/_layout.tsx`; `verify` hides it once the code is accepted. Route test | `Add a back arrow to the sign-up and sign-in screens` |
| F6 | Docs (`login-backend.md`, `docs/testing.md`) and progress; full checks; manual QA (section 6) | `Update the docs for sign up vs sign in` |

## 6. Testing

### Automated
- `afterVerify.test.ts`: every row of the table in 4.2.
- `Onboarding-Context` test: the intent starts empty and is set by `updateData`.
- `account-check` screen test: the right message for each reason; the number shown; Sign in calls `refreshProfile`;
  Create goes to `user-type`; Use a different number calls `signOut`, then goes to `phone`.
- `verify` test: `account-exists` and `no-account` go to `account-check`; the existing three paths are unchanged.
- Route test (`expo-router/testing-library`): a back arrow on `name` and `phone` returns to the previous screen; none
  on `onboarding` or `verification-confirmation`.

### Manual (local Supabase or dev)
Use a number **with** an account (patient `0491 570 006`) and one **without** (locally: `0491 570 007` before it has
signed up; on dev, a throwaway account deleted first via Settings → Delete account).

1. Get started with `006`, answer everything, verify → "You already have an account".
   - **Sign in to my account** → Home, with the old account's data.
   - **Use a different number** → back on the phone screen, answers kept.
2. Sign in with the number without an account, verify → "No account found".
   - **Create an account** → "I am a…", finish, profile created.
   - **Use a different number** → back on the phone screen, signed out.
3. The existing paths are unchanged: Get started with a new number; Sign in with `006`.
4. **Back arrows:** from "I am a…" through to Verify, tap the arrow on each screen. It goes back one step and keeps
   the answer. There's none on the first screen, on the "verified" slides or on "You already have an account". After
   a correct code on Verify, it disappears. Check on a small phone (iPhone SE size) that it doesn't cover the screen
   title.
5. Signed up as a patient using a support person's number (`007` once it's a support person) → "You already have an
   account" → Sign in goes to the support person app.

## 7. Risks
- **Conflicts:** `verify.tsx` is also changed by #65 (`fix/auth-screens-bottom-inset`) and by
  `fix/verify-code-input-focus`, both in different parts of the file. Merge `main` in before F4.
- **The old canvas layout:** `verify.tsx` and `onboarding.tsx` aren't restyled here. Only the new screen follows the
  new rules.
- **The header and #65 (`fix/auth-screens-bottom-inset`):** #65 fits the canvas between the system bars. A transparent
  header sits over the top of that space. If the arrow overlaps content on short phones, give the flow screens a top
  inset equal to the header height. #65 is already merged (`src/features/auth/canvas.ts`), so check this in F5.
