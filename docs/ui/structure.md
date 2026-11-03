# UI structure

Audience: developers and AI assistants (Claude Code) fixing a UI bug or changing a screen. This is the map of how the UI is put together today. The rules and tokens are in [styling.md](styling.md); how the code got here is in [refactor-history.md](refactor-history.md).

## The short version

- Every screen is a thin route file in `app/` that composes components and calls hooks. Layout, text and controls come from `src/components`. Data and logic come from `src/features`, `src/services` and `src/context`.
- One styling system: tokens in `src/constants/theme.ts`, text through `AppText`, the page through `Screen` (or a shell built on it). No scale helpers, no fixed canvas, no hard-coded colours. `__tests__/unit/styling-guard.test.ts` enforces this.
- Before you write a component, look in `src/components/ui` and in the folder for the area you are in. Most of what a screen needs already exists.

## Layers

| Layer | Folder | Holds | May import |
| --- | --- | --- | --- |
| Routes | `app/` | Expo Router files. Compose components, call hooks, navigate. No business logic. | components, features, services, context |
| Primitives | `src/components/ui` | Generic building blocks with no app logic. | `constants/theme` only |
| Area components | `src/components/<area>` | Built from the primitives for one area: `auth`, `care-planner`, `health`, `navigation`, `settings`, `splash`, `support-person`, `tracker`. | `ui`, theme, features (types and hooks) |
| Features | `src/features/<area>` | Types, pure logic, hooks, message strings. | the pure modules never import `@/lib/supabase`, `react-native` or `expo-*` |
| Services | `src/services` | Data access. Return `Result<T>`, take the Supabase client as the last optional argument. | `lib` |
| Context | `src/context` | `AuthContext` (session and profile) and `Onboarding-Context` (the answers collected during sign-up). | services |
| Theme | `src/constants/theme.ts` | Colours, spacing, radii, elevation, type scale, `MinTapTarget`, `MaxContentWidth`, `BottomTabInset`, `SplashColors`. | nothing |

`src/` never imports from `app/`. There is no shared "misc" component folder: a component lives with its area, or in `ui` if it is generic.

## Navigation and route groups

`app/_layout.tsx` wraps the app in `AuthProvider` and shows the welcome splash. A `Stack` with `Stack.Protected` guards chooses one of three groups from the signed-in state:

| Group | Who | Layout |
| --- | --- | --- |
| `(auth)` | signed out, or signed in but not finished onboarding | `Stack` with a transparent back-arrow-only header (`BACK_ARROW_ONLY`) wrapped in `OnboardingProvider`. `index`, `onboarding`, `account-check` and `verification-confirmation` have no header. |
| `(tabs)` | patients | Bottom tabs: `home`, `health`, `planner`, `settings`. `tracker` is a hidden tab (reached from Home, no tab icon). |
| `(support)` | support persons | Its own tabs: `care-planner` and `support-settings`. |

Each tab folder has a `_layout.tsx` with a `Stack` and `headerShown: false`; screens draw their own header (`ScreenHeader`, `TrackerHeader`, `PrescriptionsHeader`, `TrackingScreenHeader`). The tab icon is `components/navigation/TabIcon`, shared by both tab bars.

On Android the window does not shrink for the keyboard (`softwareKeyboardLayoutMode: "pan"` in `app.json`), so the tab bar stays under the keyboard. Do not use `tabBarHideOnKeyboard`: it makes the bar flash above the keyboard.

## Which shell does a screen use?

Pick the shell for the area. Do not build a screen on a bare `View`.

| Area | Routes | Shell | Notes |
| --- | --- | --- | --- |
| Sign-up and sign-in | `app/(auth)/*` (12 steps) | `AuthScreen` | Safe area, padding, scrolling, room for the back arrow, tap-outside closes the keyboard. Props: `backArrow`, `center`, `scroll`, `footer`. |
| Onboarding carousel | `app/(auth)/onboarding.tsx` | `SafeAreaView` + a horizontal pager | Measures its own width (`onLayout`). Dots are tappable. |
| Home | `app/(tabs)/home.tsx` | `Screen` | |
| My Health | `app/(tabs)/health/*` | `HealthSubpage` with a `header` | Pinned header, scrolling content. `index` uses `Screen`. |
| Tracker questions | `app/(tabs)/tracker/<module>/*` (26 screens) | `TrackerQuestionScreen` | Page title above a question card. The card fills the page; options scroll inside it. |
| Tracker summaries | `app/(tabs)/tracker/<module>/summary.tsx` (5) | `SummaryReport` | Load with `useWeekSummary`, pass props. |
| Care Planner (patient) | `app/(tabs)/planner/*` | `PlannerFlowScreen` | |
| Settings | `app/(tabs)/settings/*` | `SettingsHome`, `SettingsSubpage` | |
| Support person | `app/(support)/*` | `Screen`, `PlannerFlowScreen`, `SettingsHome`, `SettingsSubpage` | |

Tracker modules (`management`, `movement`, `pain`, `personal-care`, `social-health`) each have a `_layout.tsx`, question screens and a `summary.tsx`. Their answers live in a per-module context made by `src/features/assessments/createAssessmentContext.tsx` and are saved through the `save_*_assessment` database functions.

## The shared pieces, by job

The full catalogue with where each lives is in [styling.md](styling.md#shared-components). By job:

- **Page and text:** `Screen`, `AppText`, `ScreenHeader`, `ActionBar` (bottom bar below the scrolling content), `Card`, `Divider`.
- **Controls:** `Button` (`elevated`, `tonal`, `primary`, `outlined`; `pill`; `busy`), `ChipButton`, `IconButton`, `TextField`, `Select`, `Checkbox`, `CheckboxOptionRow`, `SearchBar`, `PagerDots`, `TimeWheel`, `CalendarMonth`, `SignaturePad`.
- **States:** `LoadingState`, `ErrorState`, `EmptyState`.
- **Keyboard:** `KeyboardDoneBar` and `useKeyboardDoneBar` (the iOS Done bar for number, phone and multi-line keyboards).
- **Sign-in:** `AuthScreen`, `AuthTitle`, `AuthButton` (a `Button` pill; `pale` looks disabled but can still be pressed, so a step can say what is missing), `AuthOption` (radio pill), `AuthInput`, `UserTypeCard`, `CodeInput` (one box per digit over a single real, hidden input so paste and the code suggestion work), `OnboardingArtwork` (the screenshot collage, scaled from a 412x454 design size, hidden from screen readers).
- **Tracker:** `TrackerQuestionScreen`, `TrackerHeader`, `ChoiceCard` with `SingleChoiceInput`, `MultiChoiceList` and `ScaleSliderInput`; `SummaryReport`, `ReportSection`, `ResultSection`, `SummaryStatus`.

## Where to look for a bug

| Symptom | Start at |
| --- | --- |
| Text size, weight or colour looks wrong | `AppText` and `Typography` in `theme.ts` |
| Spacing, page padding, content cut off by the notch or tab bar | `Screen` (or the area shell) and its `edges` prop |
| A sign-in step looks or behaves wrong | the route in `app/(auth)/`, then `components/auth`. Step logic is in `src/features/auth` (`afterVerify`, `otp`, `phone`, `profile`). |
| Keyboard covers a button, or the tab bar moves with it | `AuthScreen` / `TrackerQuestionScreen` (tap-to-dismiss), `KeyboardDoneBar`, the keyboard mode in `app.json` |
| A tracker question or slider | `components/tracker`, answers in `src/features/assessments/<module>` |
| A tracker summary | `SummaryReport` and `useWeekSummary` |
| A control is too small or has no screen reader label | the control in `components/ui`, then the call site |
| A colour literal slipped in | `styling-guard.test.ts` names the file and line |

## Tests for the UI

- Component tests sit next to the component (`*.test.tsx`), for example `src/components/auth/AuthComponents.test.tsx`.
- Screen and flow tests are in `__tests__/`: `auth-screens.test.tsx` (every sign-up step, with the real `OnboardingProvider`), `verify-routing`, `account-check`, `auth-back-arrows`, `onboarding-intent`, `login-bridge-intro`, `root-routing`, `tracker-routes`, `pain-subprompt`, `plan-action-bar`.
- `__tests__/unit/` holds guards: `styling-guard` (colours, removed helpers, absolute layout), `keyboard-layout-mode`, `app-config-assets`, `sms-config-guard`.
- Use `@testing-library/react-native` v14: `await render(...)`, `await fireEvent...`; query by role and accessible name.
- `__tests__/care-planner/` and two `ui` tests (`Checkbox`, `Select`) are excluded from git on the maintainer machine (`.git/info/exclude`) and are not run by CI. Some fail against current code; do not treat those failures as caused by your change.
- Run `npm run typecheck`, `npm run lint` and `npm test` before finishing. A stale, gitignored `.expo/types/router.d.ts` can make typecheck report an unknown route locally; CI regenerates it. Move `.expo/types` aside to see what CI sees.

## Conventions that catch people out

- Appointment dates are local wall-clock time. Never convert them to UTC or use `toISOString()`.
- Name a component by its role (`QuestionRow`), file name equal to component name, and split it when it repeats, has its own state, or passes about 150 lines.
- A screen may not use `position: 'absolute'`. An overlay (badge, slider thumb, artwork, hidden input) is a component.
- Use `successStrong` for green text, not `success` (below 4.5:1 contrast on white).
- A new colour goes into `theme.ts` for both `light` and `dark`; `theme.test.ts` fails if the keys differ.
- Keep each file's line endings (the repo has mixed CRLF and LF). Do not run Prettier over the repo.
