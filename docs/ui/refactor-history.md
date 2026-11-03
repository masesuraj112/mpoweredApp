# UI refactor history (Oct to Nov 2026)

Audience: anyone asking "why is the UI built like this?" or "can I still use X?". It records what the refactor changed, in what order, and what was left alone. The current structure is in [structure.md](structure.md); the rules are in [styling.md](styling.md).

## Why

Before the refactor the app ran two styling systems side by side:

- **New:** `components/ui`, `components/care-planner` and `app/(tabs)/planner` used theme tokens.
- **Legacy:** `components/mpowered`, the tracker, health and sign-in screens used about 600 hard-coded hex values and `services/scale.ts` (`scaleWidth`, `scaleHeight`, `scaleFont`, about 1,200 calls) that stretched sizes against a 412x823 Figma frame. The seven sign-in "canvas" screens were laid out with absolute pixel positions.
- Whole files were copied between screens: four tracker summaries shared one stylesheet, 19 files repeated the same `pageTitle` style, 11 sign-in screens each defined their own continue button, and there were five header components, two dropdowns and two `TabIcon`s.
- About 35 pressables had no accessibility role or label.

Goal: one token-driven system, shared layout and text primitives, no copy-pasted styles, and screens that follow the CLAUDE.md rules (flex layout, tokens, 48dp targets, labels, font scaling on).

## Decisions

| Decision | Choice |
| --- | --- |
| Rollout | Phased, lowest risk first, one mergeable PR each |
| Visual drift | Normalised: near-duplicate colours merged into tokens, scale helpers replaced by fixed tokens, so small visible differences are expected |
| Dark mode | Light only (`userInterfaceStyle: "light"`), but every colour has a `dark` value so dark mode is a later, mechanical change |
| Enforcement | No new lint tooling. A Jest guard test (`styling-guard.test.ts`) instead |
| Out of scope | Moving OTP and profile logic out of `verify.tsx` into a hook; database, services and generated types |

## Phases

| Phase | PR | What changed |
| --- | --- | --- |
| 1. Tokens | #75 `refactor/ui-tokens` | Added `surface`, `surfaceGrouped`, `textTertiary`, `outlineMedium` and other colours to `light` and `dark`; the missing Material 3 type styles; `Spacing.mid`; `Radius` size steps; `Elevation.level1`. Removed unused template code. Light mode only. `theme.test.ts` asserts `light` and `dark` have the same keys. The old-colour mapping table was written. |
| 2. Primitives | #76 `refactor/ui-primitives-and-dedupe` | New `AppText`, `Screen`, `ScreenHeader`, `Divider`, shared `TabIcon`. Existing primitives moved onto tokens (`fieldStyles`, `ErrorState`, `Button` shadow); `CalendarMonth` tap target 44 to 48. |
| 3. De-duplication | #76 (same PR) | Five tracker summaries rebuilt on `SummaryReport` (about 1,000 duplicated lines gone). Tracker question screens rebuilt on `TrackerQuestionScreen`. The five header components replaced by `ScreenHeader`. |
| 4. Legacy screens | #78 `refactor/ui-migrate-legacy` | Health, tracker, settings, home, support person and the root layout moved to tokens, `AppText`, `Screen` and labelled 48dp controls, folder by folder. Tracker question building blocks rebuilt on flex. Android tab bar stays under the keyboard (`pan` mode). |
| 5. Sign-in off the canvas | `refactor/ui-auth-and-cleanup` | All 13 `app/(auth)` screens rebuilt on `AuthScreen` and the `components/auth` pieces. `canvas.ts` (`fitCanvas`) and its tests removed; behaviour tests added. |
| 6. Clean-up | same branch | `services/scale.ts` deleted. `components/mpowered` emptied and removed (its pieces moved to `ui`). `styling-guard.test.ts` added. Docs rewritten. |

## What moved where (Phase 5 and 6)

| Was | Is now |
| --- | --- |
| `components/mpowered/KeyboardDoneBar` | `components/ui/KeyboardDoneBar` |
| `components/mpowered/EmbeddedSite` (and `.web`) | `components/ui/EmbeddedSite` |
| `components/mpowered/SearchBar` (a duplicate) and `components/tracker/SearchBar` | `components/ui/SearchBar` (one) |
| `components/tracker/CheckboxOptionRow` | `components/ui/CheckboxOptionRow` |
| `services/scale.ts` | deleted. Use `Spacing`, `Radius`, `Typography` and flex. |
| `features/auth/canvas.ts` and `canvas.test.ts` | deleted |
| `__tests__/auth-canvas-inset.test.tsx`, `onboarding-inset.test.tsx` | deleted. Replaced by `__tests__/auth-screens.test.tsx` and `components/auth/AuthComponents.test.tsx` |
| Per-screen `continueButton` (11 copies) | `AuthButton` |
| Inline code-box row in `verify.tsx` | `CodeInput` |
| Inline screenshot collage in `onboarding.tsx` | `OnboardingArtwork` |

Theme additions in Phase 5: `Typography.headlineMedium` (28/36). `Button` gained `busy`; `PagerDots` gained `itemLabel`.

## What stayed the same on purpose

- Sign-in logic, copy, routing and the account rules (never reveal whether a number has an account before the code is verified; `account-check`; signed-in verify has no back).
- Text and labels that tests rely on: "Verify", "Try again", "Continue", "Get started →", "Sign in", the "Verification code" input label.
- `app/(auth)/_layout.tsx`, `index.tsx`, `account-check.tsx`.
- `pdf-export.ts` keeps its own hex colours (it builds a PDF page).
- Services, migrations and `src/types/database.ts`.

## Result

Across `app/` and `src/`, outside `theme.ts` and `pdf-export.ts`: 0 hard-coded colours, 0 scale-helper uses, 0 references to `components/mpowered`, 0 absolutely positioned screen layouts. Remaining inline `style={{}}` values are dynamic sizes only. `styling-guard.test.ts` keeps it that way.

## Known limitations and follow-ups

- Phase 5 and the Android keyboard change were verified with tests and typecheck, not on a device at the time of writing. Walk the sign-up and sign-in flow on both platforms at the largest system font size.
- The tracker question page does not scroll, so at the largest font on a very small phone the slider card can run out of room.
- "← Prev" and "Next →" buttons speak "Previous" and "Next", which do not contain their visible text (voice control).
- Support person pill labels are one line and truncate at very large text.
- Removing a chip in an uncontrolled `MultiChoiceList` does not update its selection (every caller controls it today).
- The verification slides advance by themselves with no pause.
- iOS keyboard avoidance for the non-scrolling tracker text screens has not been checked on a device.
- Dark mode is prepared but off. Steps are in [styling.md](styling.md#dark-mode).
- `verify.tsx` still holds the OTP and profile logic (about 440 lines). Moving it into a feature hook is a separate follow-up.

## Working on the UI after this

1. Read [structure.md](structure.md) to find the shell and components for the area, and [styling.md](styling.md) for the rules and tokens.
2. Reuse before you build. Add a token only for a design value that has no equivalent.
3. Run `npm run typecheck`, `npm run lint` and `npm test`; the guard test will name any hard-coded colour or removed helper.
4. Test on a phone with the largest system font and with the keyboard open.
