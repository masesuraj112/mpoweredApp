# Deployment

How MPowered is shared with testers and the client. **There is no App Store or Play Store release yet.** "Deploying" here means three things: the backend is up to date, a tester can install or open the app from a link, and new code reaches testers without a reinstall.

## Overview

```
 pull request --> CI (lint, types, tests, database tests)
      |             '-> EAS Update (branch pr-<number>) --> QR code comment on the PR --> Expo Go
      v
   merge to main --> CI --> EAS Update (branch preview) --> "preview" channel --> installed Android app
                                                    '--------------------> Expo Go (iPhone, Android)

   Android APK: built once with "eas build" (profile preview), installed from a link; it then receives
   updates from the "preview" channel.
   Database: migrations are applied by a person (see "Database" below). No automatic database deploy.
```

| Piece | Where it lives |
| ----- | -------------- |
| Source, CI, workflows | GitHub repository, `.github/workflows/` |
| Builds and updates | Expo (EAS), project `@mpowered-mha/mpowered-app` (ID in `app.json`) |
| Backend | One hosted Supabase project (the test project) |

App identifier (iOS bundle ID and Android package): `au.org.mpowered.app`. It is permanent once an app is in a store, so confirm it with the client first (see [client sign-off](deployment/client-signoff.md)).

## Environments

| Environment | Used by | Supabase |
| ----------- | ------- | -------- |
| Local (`.env`) | `npx expo start` on a developer's machine | The hosted test project |
| EAS `development`, `preview`, `production` | EAS builds and updates (set on the Expo dashboard) | The same hosted test project |

All three EAS environments currently point at the **same test database**, because no production database exists. When one is created, change only the `production` environment's variables.

## Secrets and who owns them

| Secret | Where | Used for |
| ------ | ----- | -------- |
| `EXPO_TOKEN` | GitHub, repository secret | The workflow publishes updates as the Expo account that created the token |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Expo dashboard, per environment; and local `.env` | The app's connection to Supabase. These two are public by design (they end up in the app); the service-role key must never be used |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF` | GitHub environment `test` | The manual database deploy workflow only |

`EXPO_PUBLIC_BYPASS_AUTH` must **not** be set on any EAS environment. Never commit `.env` or a token. If a token leaks, revoke it on the Expo dashboard (Account settings, Access tokens) and create a new one.

## Opening the app

| Who | How |
| --- | --- |
| **Android** | Install the APK from the link or QR code on the build's page in the Expo dashboard (Builds). It then updates itself from the `preview` channel. |
| **iPhone** | Install **Expo Go** from the App Store and open the QR code from the pull request comment (or the update's page on the dashboard). Whether the tester needs an Expo account, or membership of the `mpowered-mha` organisation, **has not been confirmed** for published updates (see below). |

Things to know:
- Expo Go only runs **one SDK version**. The app is on SDK 58. When Expo Go moves to a newer SDK, iPhones that update it can no longer open this app until the project is upgraded. This already happened once (SDK 57 to 58).
- **Expo account requirement is unverified.** Expo says the iOS Expo Go requires a login to run a project in development mode (`npx expo start`). We have not tested whether opening a *published update* from a QR code needs a login or organisation membership. Test it with a phone that is logged out of Expo Go, or logged in to an account outside `mpowered-mha`, and record the result here.
- In Expo Go, voice dictation shows "Dictation isn't available in this build". That is expected: dictation needs the Android build.
- **iPhone has not been verified on a physical device.** It was assumed to work because the JavaScript is shared with Android, and Android was tested. The iOS-only areas (swipe-back "Discard?" prompt, header styling, share sheet) are untested.

## Releasing

### A change (most of the time)
1. Open a pull request. CI runs. The **EAS Update** workflow publishes the change to a branch named `pr-<number>` and comments a QR code on the pull request, so anyone (including the client) can try it in Expo Go before it merges.
2. Merge to `main`. After CI passes, the workflow publishes to the `preview` update branch, which the `preview` channel follows. Installed Android apps receive it the next time they open.

An update only reaches builds with a **matching runtime version** (the project uses the `fingerprint` policy, so it changes when native code or native dependencies change). If a change touches native dependencies, publish an update **and** build a new APK.

### A new Android build
```
npx eas-cli login
npx eas-cli build --platform android --profile preview
```
It builds in Expo's cloud and gives an install link. Builds use the Expo build quota, so build only when needed.

The first build created the `preview` channel linked to an update branch of the same name, and the workflow publishes to that branch, so there is nothing to configure. The Android signing key is generated and held by Expo. Download a backup with `npx eas-cli credentials` (Android, then the build profile) and store it somewhere safe: losing it means users must reinstall.

### Rolling back a bad update
- Find the last good update: `npx eas-cli update:list --branch preview`.
- Republish it: `npx eas-cli update:republish --branch preview` (choose the earlier update), or use the Updates page on the Expo dashboard.
- Or `npx eas-cli update:rollback` to go back to the version inside the installed app.

Rolling back an update does not roll back the database.

## Database

**There is no automatic database deploy.** After a migration is merged to `main`, a person applies it to the hosted test project:

```
supabase link --project-ref <test project ref>
supabase db push --include-all --dry-run     # check exactly what would be applied
supabase db push --include-all
```
`--include-all` is needed because feature branches add migrations in parallel, so a pending migration can have an older timestamp than one already applied. Plain `db push` refuses that case; CI has already proved the whole set applies in version order. The command still refuses to run if the hosted history has versions that `main` lacks.

Do this **before** testing the new app version, or the app and the database will disagree.

Why the workflow is manual: [deploy-db.yml](../.github/workflows/deploy-db.yml) failed because the Supabase direct database host is IPv6-only and GitHub's runners cannot reach it. To restore automatic deploys, push through the **session pooler** with `supabase db push --include-all --db-url "$SUPABASE_DB_URL"` (the pooler address from the Supabase dashboard's Connect button, user `postgres.<project-ref>`, password URL-encoded) and restore the `workflow_run` trigger. The Twilio and test OTP settings in `supabase/config.toml` must never reach production.

## Troubleshooting

| Symptom | Cause and fix |
| ------- | ------------- |
| Expo Go says the project needs a different SDK | Expo Go and the project are on different SDK versions. Update Expo Go, or upgrade the project (`npx expo install expo@latest --fix`, then `npx expo-doctor`). |
| Everything fails after switching branches | Old packages. Run `npm ci`, then `npx expo start -c`. |
| "Unmatched Route" after signing in or out | The auth and tabs guards in `app/_layout.tsx` need an explicit `redirectTo` in SDK 58. Fixed; check it was not removed. |
| Red "Cannot find native module" screen in Expo Go | A native module is missing from Expo Go. Check for the module before requiring it (see `voice-recording.ts`); a `try/catch` around `require` does not work in Metro. |
| An update never reaches an installed app | Runtime version mismatch (native code changed), or the channel points at another branch. Compare the build and the update: `npx eas-cli fingerprint:compare <build runtime version> <update runtime version>` lists what differs. Check `npx eas-cli channel:view preview` and rebuild if native code changed. |
| The runtime version changed although no native code did | The runtime version hashes `.gitignore`. A build made on Windows (CRLF line endings) and an update made on the GitHub runner (LF) hashed it differently, so the first APK never matched its updates. `.fingerprintignore` now excludes it. If another text file ever shows up in `npx expo-updates fingerprint:generate --platform android` as a source, ignore it the same way, then rebuild the APK. |
| EAS Update workflow fails at the first step | `EXPO_TOKEN` is missing or expired. Create a new token and update the GitHub secret. |
| Database deploy fails with "network is unreachable" | IPv6 problem described under Database. Use the session pooler. |
| "App not installed" when installing the APK on a phone | Seen on a Galaxy A20 with about 800 MB free: the phone's own installer failed, but installing from a PC worked. Likely low free storage (not proven). Free up space, or install from a PC with Android platform-tools: turn on USB debugging, plug the phone in, then run `adb install -r mpowered.apk`. |

## Known gaps

### Must be addressed
- **The Android install link expires.** EAS build artifacts expire about two weeks after the build (the first APK: 8 November 2026). Download the `.apk` and keep it somewhere stable, or build again shortly before it is needed.
- **The end-to-end path is not proven.** Verified: the APK installs (Galaxy A20, via `adb`). Not yet confirmed: the app runs and signs in on the installed APK, the first automatic publish to the `preview` branch works after a merge to `main`, and an installed app receives that update. Do one rehearsed release and record the result.
- **The Android signing key is not backed up.** Expo holds it. Download a copy (`npx eas-cli credentials`, Android) and store it securely. Losing it means every user must uninstall and reinstall.
- **iPhone is untested on a physical device.** The iOS-only behaviour (swipe-back "Discard?" prompt, header appearance, share sheet) is unverified.
- **The client has not agreed the delivery method** (who installs, which devices, who approves). See [client-signoff.md](deployment/client-signoff.md).
- **Database changes are applied by hand.** If a migration is merged and not applied to the hosted project, the app and the database disagree.
- **The app, splash and favicon images are Expo's placeholders.** Real MPowered branding is needed before it is shared widely.

### Lower priority
- Whether a tester needs an Expo account, or membership of the `mpowered-mha` organisation, to open a QR code is unverified.
- No production Supabase project; all EAS environments use the test project.
- `npm audit` reports 6 high findings inside Expo's own build tooling (`node-forge`, `zod`). The only offered fix downgrades Expo, so they are left in place.
- No crash or error monitoring.
