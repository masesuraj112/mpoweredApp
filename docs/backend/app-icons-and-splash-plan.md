# App Icons and Splash — Build Plan

> **Scope:** the MPowered app icon on iOS and Android, the app's name under the icon, the native splash
> screen, and the revamped in-app splash ("Welcome to" / "Welcome back to"). Replaces every Expo template
> asset still in the app.
> **Branch:** `feature/app-icons-and-splash`, from `main` (2 Nov 2026). Owner: Ryan Pham.
> Mirrors the other plans: guardrails, decisions register, steps, one commit per step, tests with each step.
> **No database changes.** No migration, pgTAP test or Edge Function.

**Design sources**
- App icon: `assets/mpowered-app-icon.icon` (Icon Composer). One layer, `Assets/mpoweredicon.svg` (the looped
  "M", 262×231, `#D0BCFE`), shown at scale 3 on an automatic gradient from `#392C5C`, neutral shadow 50%,
  translucency 0.3.
- Splash: Figma `xAxC27exu441s9ThQzsm6u`, frames `2003:362` ("Welcome to") and `2004:393` ("Welcome back to"),
  both named `android-splash`, 2147×4772 (a 360×800 phone at about 5.96×).

---

## 0. What exists today

| Piece | Where | State |
| --- | --- | --- |
| Name under the icon | `app.json` `"name": "mpowered-app"` | The home screen would say **mpowered-app** |
| iOS icon | `ios.icon: "./assets/expo.icon"` | Expo template ("A" on a blue grid) |
| Fallback icon | `icon: "./assets/images/icon.png"` (1024) | Expo template |
| Android adaptive icon | `android.adaptiveIcon`: foreground/background 512, monochrome 432, `#E6F4FE` | Expo template |
| Native splash | `expo-splash-screen` plugin: `splash-icon.png` (white Expo logo), width 76, `#208AEF` | Expo template; no dark variant |
| Splash hiding | Nothing calls `SplashScreen.preventAutoHideAsync()`. Expo Router hides the splash when the root navigator mounts (`maybeHideSplashScreen`) | Hides before the session check ends, so `app/_layout.tsx` renders `null` → a **blank gap** |
| In-app splash | `app/(auth)/index.tsx` | Old design (purple, "Welcome to... MPowered"), absolute 412×823 canvas, `scale` font sizes, fake home bar. Signed-out users only, 3 s, then onboarding. Signed-in users see the blank gap, then Home |
| Web favicon | `web.favicon` (48) | Expo template |
| Notification icon (Android) | — | None (gap from `feature/notifications`) |
| Earlier icon draft | `.assets/expo.icon` (tracked, `e8fec45`, 8 Oct): the "M" as a 35px outline, scale 1.9, glass off. Never used by `app.json` | Deleted in I1 (decision I-G); git history keeps it |

## 1. Guardrails

1. **Read the SDK 58 docs** before writing code (AGENTS.md): splash screen
   (`docs.expo.dev/versions/v58.0.0/sdk/splash-screen/`) and app icons (`docs.expo.dev/develop/user-interface/app-icons/`).
2. **New UI follows the styling rules:** flex layout, no absolute-pixel canvas, colours and spacing from
   `@/constants/theme` (add tokens minimally), system font scaling on, no `scale*` helpers for font sizes,
   accessibility labels.
3. **Use the Figma assets as exported** (the wordmark and the waves). Never redraw, edit or inline their paths.
   Download them with the URLs `get_design_context` returns; never ship a temporary Figma URL.
4. **Generated icon PNGs come only from `mpoweredicon.svg`.** Record their sizes and colours in this file (section 5).
   No new dependency for this.
5. **Keep `slug`, `ios.bundleIdentifier` and `android.package`.** Only `name` changes.
6. One commit per step (imperative, no prefix). `npm run typecheck`, `npm run lint` and `npm test` before each.
7. Don't run `npm run format` over the repo. Keep each file's line endings.

## 2. Decisions register

### Settled on 2 Nov 2026 (owner: Ryan Pham)

| ID | Decision | Why | Alternatives |
| --- | --- | --- | --- |
| I-A | **The app is called MPowered** (`"name": "MPowered"`). | Shown under the icon and in the app switcher. | — |
| I-B | **iOS uses the Icon Composer file** (`ios.icon: "./assets/mpowered-app-icon.icon"`, supported since SDK 54). | Keeps the iOS 26 glass layers. | A flat 1024 PNG. |
| I-C | **Android icons are generated from `mpoweredicon.svg`:** adaptive foreground (the "M" inside the ~66% safe zone, transparent), background colour `#392C5C`, monochrome (the "M" in one flat colour), a white 96×96 notification icon, the 1024 fallback `icon.png` (the "M" on `#392C5C`) and the favicon. | No designer export exists; the logo is one flat-colour vector, so every size is sharp. | Wait for the designer. |
| I-D | **Native splash: the lavender "M" on `#391777`** (the top of the in-app gradient), the same in dark mode. A short fade hands over to the in-app splash. | Android 12+ splash screens allow only a centred icon on a solid colour, so the full design can't be native. | Plain purple with no logo. |
| I-E | **When the in-app splash shows:** signed out, "Welcome to" for 3 s, then onboarding (as now). Signed in, "Welcome back to" while the session and profile load, **at least 3 s** (changed from 1.5 s on 2 Nov 2026, so both greetings last the same), then Home. The native splash stays up until the session is known (`preventAutoHideAsync`), so there is no blank gap. | Fills the blank gap with the design meant for it; the same length as the signed-out greeting. | A shorter 1.5 s minimum when signed in; signed-out only. |
| I-G | **The 8 Oct outlined-M draft (`.assets/expo.icon`) is deleted**; the filled-M `mpowered-app-icon.icon` replaces it. | It was never wired up, and the new file is the current design. Git history keeps it. | Keep it unused; use it instead. |
| I-F | **System font**, not Inter. | The app doesn't load Inter anywhere; no new dependency. | Load `@expo-google-fonts/inter`. |

### Rules that follow
- The in-app splash is one component with a `greeting` prop, used by both paths.
- Colours from the design go into `@/constants/theme` as splash tokens: gradient `#391777` → `#1C0546`, text
  `#A591CF`.
- **Expo Go shows the app icon instead of the splash**, and development builds don't show every splash setting
  (SDK 58 docs). Icons and the native splash are checked on a **preview or release build**. The in-app splash
  works in Expo Go.
- The local `ios/` (and any `android/`) folder is generated and ignored by git. It must be regenerated
  (`npx expo prebuild --clean`) before a local build shows the new icons.
- Changing icons or the splash changes the build fingerprint (`runtimeVersion.policy: fingerprint`), so
  over-the-air updates made after this branch only reach builds made after it.

### Out of scope
- Redesigning onboarding.
- An iOS-specific splash frame (the design is one layout for both platforms).
- **Wiring the notification icon into the `expo-notifications` plugin:** that plugin is on
  `feature/notifications`, not `main`. This branch adds the PNG; whichever branch merges second sets
  `"icon": "./assets/images/notification-icon.png"` in that plugin.

## 3. Design

### 3.1 Icons (`app.json`)

```json
"name": "MPowered",
"icon": "./assets/images/icon.png",
"ios": { "icon": "./assets/mpowered-app-icon.icon" },
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/android-icon-foreground.png",
    "backgroundColor": "#392C5C",
    "monochromeImage": "./assets/images/android-icon-monochrome.png"
  }
},
"web": { "favicon": "./assets/images/favicon.png" }
```

`android-icon-background.png` is no longer needed (a colour replaces it) and is deleted, as is `assets/expo.icon`.

### 3.2 Native splash (`expo-splash-screen` plugin)

```json
["expo-splash-screen", {
  "backgroundColor": "#391777",
  "image": "./assets/images/splash-icon.png",
  "imageWidth": 120,
  "resizeMode": "contain",
  "dark": { "backgroundColor": "#391777", "image": "./assets/images/splash-icon.png" }
}]
```

`splash-icon.png` becomes the lavender "M" (1024 wide, transparent). The width is checked on device and tuned if needed.

### 3.3 In-app splash: `WelcomeSplash`

- `src/components/splash/WelcomeSplash.tsx`, props `{ greeting: 'Welcome to' | 'Welcome back to' }`.
- A full-screen vertical gradient (`expo-linear-gradient`, already installed), with flex layout:
  - the greeting and the wordmark, centred a little above the middle (as in the design, about 33% down);
  - the waves, anchored to the bottom half, behind the text and decorative (hidden from screen readers);
  - the footer "Powered by / Musculoskeletal Health Australia" near the bottom, inside the safe area.
- The greeting and the wordmark are read as one heading, "Welcome to MPowered" (the wordmark is a picture of the
  name). The greeting is real text, so it scales with the phone's font size.
- The waves are a background layer placed as in the design (48% down, 4% left, 142% wide, tilted 1°), hidden from
  screen readers on both platforms. Their 50% opacity is in the SVG itself.
- Colours are `SplashColors` in `@/constants/theme` (the same in light and dark mode).
- The status bar is light on the dark background.
- Assets: `assets/images/splash/wordmark.svg` (`2003:378`) and `assets/images/splash/waves.svg` (`2003:380`),
  drawn with `expo-image` like the app's other SVGs.

### 3.4 When it shows

```
App start ── native splash (M on #391777) ── held until the session is read
   ├─ no session ──► (auth)/index: WelcomeSplash "Welcome to", 3 s ──► onboarding
   └─ session    ──► root layout: WelcomeSplash "Welcome back to"
                       until the profile check ends AND 3 s have passed ──► Home (or the support person app)
```

- `app/_layout.tsx` calls `SplashScreen.preventAutoHideAsync()` at module level, and `SplashScreen.hide()` once
  `loading` is false. `SplashScreen.setOptions({ duration: 300, fade: true })` gives a short fade.
- "Welcome back to" is an **overlay** on top of the navigator, not a replacement, so the first screen (Home or the
  support person app) loads underneath and routing is unchanged. The screen underneath is hidden from screen readers
  while it shows.
- It shows only when the app **opened** signed in (`startedSignedIn`, fixed once the session is read), never for
  someone signing in now, which would cover the verify screen. `showWelcomeBack()` (`src/features/splash/startup.ts`):
  still checking the profile → show; profile found → show until 3 s; profile error → stop (the error screen shows);
  no profile → stop (onboarding starts with "Welcome to").
- Both greetings use `WELCOME_SPLASH_MS` (3000).
- The 3 s minimum is a small pure helper plus a hook (`useMinimumDuration`), so it can be tested without timers
  in the screen.
- The profile-error screen ("We could not load your account") is unchanged.

## 4. Steps

### Phase I0 — Branch and plan
- **I0** Branch (done). This file and the progress checklist.
  Commit: `Add the app icons and splash build plan`

### Phase I1 — Name and iOS icon
- **I1** `name` → `MPowered`; `ios.icon` → `./assets/mpowered-app-icon.icon` (add it to git); delete the template
  `assets/expo.icon` and the earlier draft `.assets/expo.icon` (I-G). `.DS_Store` is already in `.gitignore`.
  Commit: `Use the MPowered name and iOS icon`

### Phase I2 — Android and fallback icons
- **I2** Generate from `mpoweredicon.svg`: `android-icon-foreground.png` (1024), `android-icon-monochrome.png`
  (1024), `icon.png` (1024, on `#392C5C`), `notification-icon.png` (96, white), `favicon.png` (48), and the splash
  `splash-icon.png` (1024, lavender, transparent). Update `app.json`, delete `android-icon-background.png`.
  Record the sizes and colours in section 5. Check each image by eye.
  Commit: `Add the MPowered Android icons`

### Phase I3 — Native splash
- **I3** Splash plugin config (3.2); `preventAutoHideAsync` / `hide` / `setOptions` in `app/_layout.tsx`.
  Commit: `Use the MPowered native splash`

### Phase I4 — In-app splash component
- **I4** Splash theme tokens; download the two Figma SVGs; `WelcomeSplash` with a render test (greeting, accessible
  wordmark label, decorative waves hidden).
  Commit: `Add the welcome splash`

### Phase I5 — Showing it
- **I5** `(auth)/index.tsx` uses `WelcomeSplash` "Welcome to" (3 s, then onboarding). The root layout shows
  "Welcome back to" while a signed-in user's profile loads, for at least 3 s (`useMinimumDuration` with a test).
  Update `__tests__/root-routing.test.tsx` if it relies on the blank screen.
  Commit: `Show the welcome splash while the app starts`

### Phase I6 — Checks, docs and manual QA
- **I6a** An app config guard test: every asset path in `app.json` exists (the icons once went missing, `a2f3df2`).
  Commit: `Check that the app config's assets exist`
- **I6b** Docs (`docs/testing.md` rows and manual notes) and progress. Full checks, green CI.
  Commit: `Update the docs for the app icons and splash`
- **I6c** Manual QA on a preview build (section 6.3).

## 5. Icon generation

Every PNG was made once from `assets/mpowered-app-icon.icon/Assets/mpoweredicon.svg` with a one-off script (not kept in
the repo; `@resvg/resvg-js` 2.6.2, never a project dependency). It reused the logo's one path unchanged and only
sized, placed and coloured it in a wrapper SVG. To remake one, render that path at the size and colours below.

| File | Size | Logo | Colours |
| --- | --- | --- | --- |
| `android-icon-foreground.png` | 1024×1024 | 440 wide (about 43%, inside the 66% safe zone and clear of a circle mask) | `#D0BCFE` on transparent |
| `android-icon-monochrome.png` | 1024×1024 | 440 wide | white on transparent (Android tints it) |
| `icon.png` (fallback) | 1024×1024 | 640 wide | `#D0BCFE` on `#392C5C` |
| `notification-icon.png` | 96×96 | 80 wide | white on transparent |
| `favicon.png` | 48×48 | 38 wide | `#D0BCFE` on `#392C5C` |
| `splash-icon.png` | 1024×903 | full width | `#D0BCFE` on transparent |

The adaptive icon's background is the colour `#392C5C` in `app.json`; `android-icon-background.png` is deleted.
Checked by eye on 2 Nov 2026, including a circle-masked preview of the adaptive icon.

## 6. Testing plan

### 6.1 Automated
| Test | Covers |
| --- | --- |
| `WelcomeSplash.test.tsx` | Shows each greeting; one heading "<greeting> MPowered"; the footer text; the waves are hidden from screen readers on Android and iOS |
| `useMinimumDuration.test.ts` | Not done before 3 s even if loading ends; done when both have happened; done straight away if loading takes longer |
| `startup.test.ts` | When "Welcome back to" shows: while the profile loads, until 3 s, never for a sign-in now, not for a profile error or a missing profile |
| `__tests__/root-routing.test.tsx` (update) | Opening signed in: "Welcome back to" over the app for exactly 3 s, then Home; held while the profile check runs past 3 s; never when signing in now; the existing routing tests skip past it |
| `__tests__/unit/app-config-assets.test.ts` | Every image and icon path in `app.json` exists |

### 6.2 Not automated
Icons on the home screen, the native splash and the hand-over to the in-app splash, on real devices.

### 6.3 Manual QA (preview build, iPhone and Android)
1. The home screen shows the MPowered icon and the name **MPowered**. On iOS 26 the icon has the glass effect; in
   dark and tinted modes it still reads.
2. Android: the adaptive icon is cropped correctly in circle and squircle masks; with themed icons on (Android 13+)
   the monochrome "M" shows.
3. Cold start signed out: the "M" on purple, then "Welcome to" with no blank gap or flash, then onboarding after 3 s.
4. Cold start signed in: the "M" on purple, then "Welcome back to" for at least 3 s, then Home.
5. Airplane mode, signed in: "We could not load your account" still appears after the splash.
6. Large text (accessibility font size): the greeting and footer don't overlap the wordmark or the waves.
7. A support person account goes to the support person app after "Welcome back to".

## 7. Requirements traceability
No user story covers branding; this is the agreed design (Figma frames above) and the name decision I-A.
