# Native builds crash on launch: Expo SDK packages out of step

> **Status:** proposed, not implemented. This branch (`fix/align-expo-sdk-packages`) holds only this document so
> the fix can be agreed first. Owner: Ryan Pham. Raised 2 Nov 2026.

## 1. Summary

Any native build of `main` (a local `expo run`, an EAS build or a store build) crashes on iOS before the first
screen. Expo Go is unaffected, which is why nobody has seen it. The cause is one Expo package
(`expo-file-system`) being a patch release ahead of the `expo` package it depends on. The fix is the standard
`npx expo install --fix`, which moves 16 packages up by a patch release within SDK 58 and touches only
`package.json` and `package-lock.json`.

**Decision needed:** approve the fix in section 5 (and its order relative to PRs #56 and #60, section 6).

## 2. What happens

Found on 2 Nov 2026 while testing the app icons and splash with an iOS Release build in the simulator
(`npx expo run:ios --configuration Release`). The app is killed at launch:

```
Termination Reason:  Namespace DYLD, Code 4, Symbol missing
Symbol not found: _$s15ExpoModulesCore12EventEmitterPAAE12eventRuntime03forD00aB3JSI010JavaScriptG0CSgSS_tF
Referenced from: MPowered.app/Frameworks/ExpoFileSystem.framework/ExpoFileSystem
Expected in:     MPowered.app/Frameworks/ExpoModulesCore.framework/ExpoModulesCore
```

`ExpoFileSystem` calls `EventEmitter.eventRuntime(for:)`, which the installed `ExpoModulesCore` does not have, so iOS
refuses to start the app.

## 3. Cause

Versions on `main` (`package-lock.json`, 2 Nov 2026):

| Package | Installed | Comes from |
| --- | --- | --- |
| `expo` | **58.0.19** | `package.json` `^58.0.0`, locked at 58.0.19 |
| `expo-modules-core` | **58.0.26** | pinned by `expo` 58.0.19 (`~58.0.26`) |
| `expo-file-system` | **58.0.13** | added 29 Oct 2026 for Settings → Export my data (`2247817`), by `npx expo install` |

`expo-file-system` 58.0.13 ships pre-compiled (an iOS framework and an Android `.aar` in
`node_modules/expo-file-system/prebuilds` and `local-maven-repo`). It was compiled against the newer
`expo-modules-core` that comes with **`expo` 58.0.22** (`~58.0.29`), which added `eventRuntime(for:)`. Ours is
58.0.26, built against `expo` 58.0.19.

`npx expo install expo-file-system` picked the newest SDK 58 patch of that one package but left `expo` itself
behind. `npx expo install --check` has reported the gap since then:

```
expo@58.0.19 - expected version: ~58.0.22
… 15 more (section 5)
Your project may not work correctly until you install the expected versions of the packages.
```

### Why it went unnoticed
- **Expo Go** contains its own copy of every native module, so our installed versions never load there. All
  testing so far has been in Expo Go.
- **CI** runs Jest, lint, typecheck and the database tests. None of them link native code.

## 4. Who is affected

| Platform | Status |
| --- | --- |
| iOS native build (simulator or device, any configuration) | **Confirmed:** crashes at launch |
| Android native build | **Likely, not confirmed** (no Android SDK on the machine used). `expo-file-system`'s pre-compiled Android `.aar` has the same mismatch. Android checks for missing code later than iOS, so it may crash at launch, crash only when a file-system feature runs (Settings → Export my data), or work. |
| Expo Go | Not affected |
| CI | Not affected (it cannot detect this) |
| Users | None yet: no store or preview build has been released with this `main` |

## 5. Proposed fix

On this branch, from an up-to-date `main`:

```bash
npx expo install --fix          # align every SDK 58 package with the installed Expo SDK
npx expo install --check        # expect: "Dependencies are up to date"
npm run typecheck && npm run lint && npm test
```

It changes only `package.json` and `package-lock.json`. All moves are patch releases within SDK 58:

| Package | From | To |
| --- | --- | --- |
| `expo` | 58.0.19 | ~58.0.22 (brings `expo-modules-core` ~58.0.29) |
| `@expo/ui` | 58.0.23 | ~58.0.26 |
| `expo-font` | 58.0.10 | ~58.0.11 |
| `expo-image` | 58.0.17 | ~58.0.18 |
| `expo-linking` | 58.0.14 | ~58.0.15 |
| `expo-print` | 58.0.7 | ~58.0.8 |
| `expo-router` | 58.0.26 | ~58.0.29 |
| `expo-sharing` | 58.0.20 | ~58.0.21 |
| `expo-splash-screen` | 58.0.11 | ~58.0.12 |
| `expo-sqlite` | 58.0.14 | ~58.0.15 |
| `expo-system-ui` | 58.0.6 | ~58.0.7 |
| `expo-updates` | 58.0.18 | ~58.0.20 |
| `expo-web-browser` | 58.0.6 | ~58.0.7 |
| `react-native` | 0.88.0 | 0.88.1 |
| `react-native-screens` | 4.30.0 | ~4.30.1 |
| `jest-expo` (dev) | 58.0.12 | ~58.0.13 |

Suggested commit message: `Align the Expo SDK 58 packages so native builds start`.

### Why all 16 and not just `expo`
`npx expo install expo` alone would fix this crash, but the other 15 are the same kind of drift and could cause the
next one. Expo tests a single SDK release as a set, and `--fix` is Expo's documented way to get back to that
set. Every change is a patch release.

### Alternative considered
Pin `expo-file-system` back to the release built for `expo` 58.0.19. Rejected: it goes against how Expo
resolves versions, and the next `expo install` of any package would bring the gap back.

## 6. Risks and interactions

- **Over-the-air updates:** `runtimeVersion` uses `policy: fingerprint`, so native dependency changes produce a new
  runtime. EAS Updates published after this merge only reach builds made after it. No build has been released, so
  this only matters to anyone holding an internal build.
- **Other PRs touching the same files:**
  - **#60** `chore/pin-supabase-cli-and-node`: `package.json` (`engines.node`, Supabase CLI pin) and the lock file.
    It changes no Expo versions.
  - **#56** `feature/notifications`: adds `expo-notifications` (installed as ~58.1.7).

  Lock-file conflicts are expected. Whichever merges later merges `main` in, keeps both sides of `package.json`,
  then runs `npm install` to rebuild the lock file and `npx expo install --check`.
- **Behaviour changes:** patch releases only. `react-native` 0.88.0 → 0.88.1 is the only non-Expo package. Check its
  changelog during review.
- **`.npmrc` / Node:** none needed. The Node version is unchanged (#60 records it).

## 7. How to test

1. **CI:** `static-checks` and `unit-tests` green. `database-tests` is unaffected.
2. **iOS native:** `npx expo prebuild --clean --platform ios`, then `npx expo run:ios --configuration Release`. The
   app opens past the splash. Then check **Settings → Export my data** (uses `expo-file-system`).
3. **Android native:** `eas build --profile preview --platform android` and install the APK. Check it opens, and
   check **Settings → Export my data**. Ideally also check the same on a `main` build first, to confirm whether
   Android was affected (section 4).
4. **Expo Go:** a quick pass through sign-in, an assessment, the Care Planner and Settings, to catch any behaviour
   change from the patch releases.

## 8. Rollback

Revert the commit. Only `package.json` and `package-lock.json` change, so a revert plus `npm install` restores the
previous state exactly. Rebuild any native project afterwards (`npx expo prebuild --clean`).

## 9. Prevention (optional, for discussion)

- Add `npx expo install --check` to CI's `static-checks` job, so a PR that leaves SDK packages out of step fails.
  It needs no device and runs in seconds.
- Make a native build (`expo run:ios` or an EAS preview build) part of the PR checklist when a change adds or
  updates a native package.
