# MPowered

MPowered is a mobile app (iOS and Android) for patients and their support people. A patient tracks their health through five assessments (pain, movement, personal care, social health and self-management), keeps a health profile with prescriptions, and prepares for appointments with a Care Planner. A patient can link up to two support people and choose what each can see.

This README explains how the repository is organised, how to run the app, and where everything else is documented.

- [Technology](#technology)
- [Repository map](#repository-map)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Adding or updating libraries](#adding-or-updating-libraries)
- [Deployment](#deployment)
- [Testing](#testing)
- [Documentation](#documentation)
- [Licence](#licence)

## Technology

- React Native 0.88 with Expo SDK 58, Expo Router for navigation, TypeScript (strict mode)
- Supabase: Postgres with row level security, Auth (phone number and SMS code, sent through Twilio), and an Edge Function
- Expo EAS for builds and over-the-air updates; GitHub Actions for CI and update publishing
- Jest for unit tests and pgTAP for database tests

## Repository map

| Path | What it holds |
| ---- | ------------- |
| `app/` | Screens and routes (Expo Router). `(auth)` is sign-in and onboarding, `(tabs)` is the patient app (home, health, planner, tracker, settings), `(support)` is the support person's view. Screens stay thin: they compose components and hooks. |
| `src/components/ui/` | Generic building blocks with no app logic |
| `src/components/care-planner/` | Care Planner components |
| `src/components/mpowered/` | Older app-specific components, being refactored |
| `src/features/<area>/` | Types, hooks and pure logic for each area: assessments, auth, care-planner, health-profile, onboarding, settings, support-person |
| `src/services/` | Data access. Each function returns a `Result<T>` and takes the Supabase client as its last optional argument |
| `src/lib/` | The Supabase client, `Result` type and error mapping |
| `src/context/` | Shared client state (authentication, onboarding) |
| `src/constants/theme.ts` | Design tokens (colours, spacing) |
| `src/types/database.ts` | Generated from the database. Never edit it by hand |
| `supabase/migrations/` | The database schema, one file per change. Never edit an existing migration; add a new one |
| `supabase/tests/database/` | pgTAP database tests |
| `supabase/functions/` | Edge Functions (`delete-account`) |
| `supabase/config.toml`, `supabase/seed.sql` | Local Supabase configuration (it includes a test OTP, for local and CI use only) and seed data |
| `__tests__/` and `*.test.ts(x)` | Jest tests: cross-cutting tests in `__tests__/`, the rest next to the code they test |
| `docs/` | Documentation (see [Documentation](#documentation)) |
| `.github/workflows/` | `ci.yml` (checks), `eas-update.yml` (publishes app updates), `deploy-db.yml` (manual database deploy) |
| `app.json`, `eas.json` | Expo and EAS build configuration |

Coding conventions (layout, styling, accessibility, database rules) are in [CLAUDE.md](CLAUDE.md), which applies to people as much as to AI assistants.

## Getting started

Before working on this project, make sure your local environment matches the versions below.
Mismatched versions are a common source of "it works on my machine" bugs.

### Required versions

| Tool     | Version     |
| -------- | ----------- |
| Node.js  | v24.20.0    |
| npm      | 11.19.0     |
| Expo SDK | 58 (installed by `npm ci`: 58.0.22) |

> Node v24.20.0 is the version CI uses and the one in `.nvmrc` (run `nvm use` if you manage Node with nvm). Expo SDK 58 accepts Node 22.13 or later in the 22 line, 24.3 or later in the 24 line, and 26 or later. React Native's version (0.88) is managed automatically by Expo. You don't install or track it separately.

### 1. Install Node.js

Download the Windows / Mac Installer from [https://nodejs.org/en/download](https://nodejs.org/en/download). This includes npm automatically.

Confirm it installed correctly, using these commands in your terminal (Throughout this set-up, use Command Prompt in Windows, Terminal on Mac):

```bash
node --version
npm --version
```

### 2. Clone the repo

Change directory in your terminal to the parent folder you'd like the repo to reside in locally (e.g. your Documents folder). A folder named after the repository is created inside it. Use the repository's clone URL from its GitHub page (the green **Code** button).

```bash
git clone <repository-url>
cd <repository-folder>
```

### 3. Install project dependencies

```bash
npm ci
```

This installs exactly the versions recorded in `package-lock.json`, including the correct Expo SDK version; you don't install Expo separately. Use `npm ci` rather than `npm install` for a normal setup, because `npm install` can change the lockfile. See [Adding or updating libraries](#adding-or-updating-libraries) for when to use `npm install`.

### 4. Set up environment variables

```bash
cp .env.example .env        # macOS / Linux
copy .env.example .env      # Windows Command Prompt
```

Then fill in `.env` with the real Supabase project URL and key (get these from a teammate or the Supabase dashboard — never commit `.env`).

### 5. Confirm it runs

Make sure you are in the repository folder. This may take a while.

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (App Store / Play Store), or press `i`/`a` for iOS/Android simulators if set up. You should see the app launch with no red error screen.

### If something doesn't work

1. Re-check `node --version` / `npm --version` against the table above
2. Ask a teammate before debugging alone for more than ~10 minutes. Version mismatches are usually quick to spot with a second pair of eyes
3. If Expo Go says the project needs a different SDK, update Expo Go from the App Store. Expo Go only runs the one SDK version it ships with, so a mismatch means the project and Expo Go are on different SDKs (this project is on SDK 58). Then run `npm ci` and `npx expo start -c`

### 6. Install the Supabase CLI

Needed for writing and pushing database migrations later, every team member should have this installed, regardless of whether you're actively touching the database yet.

```bash
npm install -g supabase
```

The `-g` installs it globally on your machine (not inside the repo), so this is a once-per-person setup step, not something you repeat per project.

If the npm install fails (this can happen on some Mac setups), use Homebrew instead:

```bash
brew install supabase/tap/supabase
```

Confirm it installed correctly:

```bash
supabase --version
```

Should print a version number. If it does, you're set. The repository also lists `supabase` 2.116.0 (the version CI uses) as a dev dependency, so `npx supabase <command>` works after `npm ci` without a global install. Prefer that version when generating types, so the result matches CI's check.

### 7. Log in to Supabase via the CLI

```bash
supabase login
```

This opens a browser window — log in with **your own personal Supabase account** (not a shared login). As long as your account has been invited to the team's Supabase organisation, this is all that's needed to give the CLI access.

### 8. Link the CLI to the dev project

From inside the repository folder:

```bash
supabase link
```

You'll be prompted to select the project: choose `mpoweredAppTest` (not `mpoweredAppProd`, which is the blank production project). This connects your local folder to the correct Supabase project, so commands like `supabase db pull` know where to fetch from.

### If something doesn't work (Supabase CLI)

1. Re-run `supabase --version`: if it's not recognized, the global install didn't complete; try the Homebrew method above
2. If `supabase link` can't find your project, confirm you were actually added to the team's Supabase organisation: check with a teammate
3. Ask a teammate before debugging alone for more than ~10 minutes

## VSCode
### 9. install prettier extension

Install the "Prettier" extension in VS Code. It reads the repo's `.prettierrc.json` (single quotes, 100 characters per line, existing line endings kept). Do not turn on "format on save": most existing files were not formatted with Prettier, so saving would rewrite lines you did not change. Format a file deliberately, only when you are changing most of it.

## Deployment

How the app is built, shared with testers and updated (Expo EAS, GitHub Actions, Supabase), with release, rollback and troubleshooting steps: [docs/deployment.md](docs/deployment.md).

## Testing

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

### What is tested, and why

The rules that must never break live in two places, so that is where the tests are.

| Layer | What it checks | Tool | Where |
| ----- | -------------- | ---- | ----- |
| Database | Constraints (one pain entry per user per week, pain level ordering, required values), row level security (a user cannot read another user's data), table privileges, and the atomic `save_pain_assessment` function | pgTAP, run in a real local Postgres | `supabase/tests/database/*.test.sql` |
| Pure logic | Week maths (Monday to Sunday), location normalisation, answer validation, error mapping | Jest | `src/**/*.test.ts`, next to the code |
| Service logic | `savePainEntry` and the read functions, using a fake Supabase client (no network) | Jest | `src/services/assessments.test.ts` |
| Sign-in | Phone normalisation, six digit codes, error mapping, `sendVerificationCode` / `verifyCode` / `hasProfile` / `createProfile`, and the `create_profile` function and its privileges | Jest, pgTAP | `src/features/auth/*.test.ts`, `src/services/auth.test.ts`, `src/services/profile.test.ts`, `supabase/tests/database/060_*` and `061_*` |

The full list of rules and the test that proves each one is in [docs/testing.md](docs/testing.md), including what is **not** automated.

### How to run the tests

```bash
npm test                 # all Jest tests once
npm run test:watch       # re-run Jest on every save while you code
npm run test:ci          # what CI runs: Jest plus a coverage report in coverage/
npm run typecheck        # TypeScript type check
npm run lint             # ESLint (warnings are allowed, errors fail CI)
```

Database tests (pgTAP) are run by CI, which is the reference result. Running them locally (`supabase start`, `supabase test db`) needs Docker, which the original team did not use. Open a pull request and read the **Checks** box: if `database-tests` is red, open the failing step and fix it in a new commit.

### What CI runs

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on every pull request and every push to `main`:

| Job | Runs |
| --- | ---- |
| `static-checks` | `npm run lint`, `npm run typecheck` |
| `unit-tests` | `npm run test:ci`, then uploads the coverage report |
| `database-tests` | `supabase start`, `supabase test db`, `supabase db lint --local --fail-on error`, and a check that `src/types/database.ts` matches the migrations (if you change a migration, run `supabase gen types typescript --local > src/types/database.ts` and commit it) |
| `migrations-immutable` | Pull requests only: fails if an existing migration file was edited, renamed or deleted |

See the results in the **Checks** box on a pull request, or on the repository's **Actions** tab.

### How to add a test

- **Logic:** create `thing.test.ts` next to `thing.ts`. Name tests as plain sentences ("rejects a second submission in the same week"). Add the file you are testing to `collectCoverageFrom` in `jest.config.js`. A service test must start with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))` above its imports, because the real client cannot load under Jest.
- **Database:** add `NNN_name.test.sql` to `supabase/tests/database/`. Start with `begin;` and `select plan(N);` (N is the number of checks), and end with `select * from finish(); rollback;` so nothing is left behind.
- Never edit an existing migration. Add a new one.

## Environment variables

Set in `.env` for local work (copy `.env.example`) and in the Expo dashboard for each EAS environment. Never commit `.env`.

| Variable | Purpose |
| -------- | ------- |
| `EXPO_PUBLIC_SUPABASE_URL` | The Supabase project URL. Public: it ends up inside the app |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The Supabase publishable key. Public by design. Never put the service-role key in the app |
| `EXPO_PUBLIC_BYPASS_AUTH` | Development only: set to `true` to reach every route without signing in. Must not be set on any EAS environment |

Secrets used by CI and deployment (`EXPO_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`) are GitHub secrets and are described in [docs/deployment.md](docs/deployment.md).

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm start` | Start the Expo development server (`npx expo start`) |
| `npm run android`, `npm run ios` | Build and run a native app on a device or emulator |
| `npm run web` | Run the web version |
| `npm test` | Run all Jest tests once |
| `npm run test:ci` | Jest with a coverage report, as CI runs it |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint over `app` and `src` (warnings allowed, errors fail CI) |
| `npm run test:db` | pgTAP database tests (needs Docker; CI runs these) |

Avoid `npm run format`: it runs Prettier over the whole repository, and the repository has mixed line endings, so it would rewrite unrelated files. Format only the files you change.

## Adding or updating libraries

- Use `npx expo install <package>` for any package from Expo or any native library. It picks the version that matches Expo SDK 58. Use `npm install <package>` only for plain JavaScript packages.
- Commit both `package.json` and `package-lock.json`. Everyone else installs with `npm ci`, which uses the lockfile exactly.
- Run `npx expo-doctor` after a change; it reports versions that do not match the SDK.
- A package with native code cannot reach installed apps through an over-the-air update. It needs a new build (`eas build`), and Expo Go may not include it. See [docs/deployment.md](docs/deployment.md).
- Remove a package with `npm uninstall <package>`.
- To upgrade the Expo SDK, run `npx expo install expo@latest --fix`, then `npx expo-doctor`. Expo Go supports only one SDK version at a time, so check it first.
- After changing dependencies, refresh the licence list in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Documentation

| Document | What it covers |
| -------- | -------------- |
| [docs/deployment.md](docs/deployment.md) | How the app is built, shared and updated; secrets and who owns them; known gaps |
| [docs/install-guide.md](docs/install-guide.md) | How testers install the test app on Android and iPhone |
| [docs/testing.md](docs/testing.md) | Each rule the tests protect, and which test proves it |
| [docs/backend/production-auth-checklist.md](docs/backend/production-auth-checklist.md) | What to set up on the production Supabase project before real users sign in |
| [docs/backend/sms-setup.md](docs/backend/sms-setup.md) | How SMS sign-in codes are set up with Twilio, and how to move to the client's own account |
| [docs/backend/testing-and-cicd.md](docs/backend/testing-and-cicd.md) | The testing and CI/CD design, including database deployment |
| [docs/backend/settings-backend.md](docs/backend/settings-backend.md), [docs/backend/support-person.md](docs/backend/support-person.md) | How the Settings and support-person features work |
| [docs/deployment/client-signoff.md](docs/deployment/client-signoff.md) | Questions about delivery and ownership still to be agreed with the client |

The remaining files in `docs/backend/` (the login, Care Planner and support-person build plans, the Twilio integration guide, the progress trackers and the stub inventory) record how the back end was built and the decisions made along the way. Read them for history and reasoning, not as instructions for new work. `AGENTS.md` and `CLAUDE.md` hold the project's coding rules.

## Licence

See [LICENSE](LICENSE). The open-source packages the app depends on, and their licences, are listed in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).