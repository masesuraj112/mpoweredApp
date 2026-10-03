# Set-Up Steps for Development

## Environment Setup

Before working on this project, make sure your local environment matches the versions below.
Mismatched versions are a common source of "it works on my machine" bugs.

### Required versions

| Tool     | Version     |
| -------- | ----------- |
| Node.js  | v24.20.0    |
| npm      | 11.19.0     |
| Expo SDK | 57.0.1 |

> React Native's version is managed automatically by Expo. You don't install or track it separately.

### 1. Install Node.js

Download the Windows / Mac Installer from [https://nodejs.org/en/download](https://nodejs.org/en/download). This includes npm automatically (see 'Set-Up Steps' document in Confluence in `Development/` folder).

Confirm it installed correctly, using these commands in your terminal (Throughout this set-up, use Command Prompt in Windows, Terminal on Mac):

```bash
node --version
npm --version
```

### 2. Clone the repo

Make sure to change director in termainl to the parent folder you'd like the repo to reside in locally (E.g. Documents folder). The mpoweredApp folder will be created inside of this.

```bash
git clone https://github.com/masesuraj112/mpoweredApp.git
cd mpoweredApp
```

### 3. Install project dependencies

```bash
npm install
```

This reads `package.json` already in the cloned repo, and installs everything the project needs, including the correct Expo SDK version, you don't install Expo separately.

### 4. Set up environment variables

```bash
cp .env.example .env
```

Then fill in `.env` with the real Supabase project URL and key (get these from a teammate or the Supabase dashboard — never commit `.env`).

### 5. Confirm it runs

Make sure you are in the `mpoweredApp` folder. This may take a while.

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (App Store / Play Store), or press `i`/`a` for iOS/Android simulators if set up. You should see the app launch with no red error screen.

### If something doesn't work

1. Re-check `node --version` / `npm --version` against the table above
2. Ask in the Teams channel before debugging alone for more than ~10 minutes. Version mismatches are usually quick to spot with a second pair of eyes

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

Should print a version number. If it does, you're set. (version 2.116.0 expected)

### 7. Log in to Supabase via the CLI

```bash
supabase login
```

This opens a browser window — log in with **your own personal Supabase account** (not a shared login). As long as your account has been invited to the team's Supabase organisation, this is all that's needed to give the CLI access.

### 8. Link the CLI to the dev project

From inside the `mpoweredApp` folder:

```bash
supabase link
```

You'll be prompted to select the project: choose the **dev** project (not production). This connects your local folder to the correct Supabase project, so commands like `supabase db pull` know where to fetch from.

### If something doesn't work (Supabase CLI)

1. Re-run `supabase --version`: if it's not recognized, the global install didn't complete; try the Homebrew method above
2. If `supabase link` can't find your project, confirm you were actually added to the team's Supabase organisation: check with a teammate
3. Ask in the Teams channel before debugging alone for more than ~10 minutes

## VSCode
### 9. install prettier extension

Set your code editor (VS Code) to format automatically using the prettier config already set-up in the repo: install the "Prettier" extension in VS Code, and optionally enable "format on save".

## Testing

[![CI](https://github.com/masesuraj112/mpoweredApp/actions/workflows/ci.yml/badge.svg)](https://github.com/masesuraj112/mpoweredApp/actions/workflows/ci.yml)

### What is tested, and why

The rules that must never break live in two places, so that is where the tests are.

| Layer | What it checks | Tool | Where |
| ----- | -------------- | ---- | ----- |
| Database | Constraints (one pain entry per user per week, pain level ordering, required values), row level security (a user cannot read another user's data), table privileges, and the atomic `save_pain_assessment` function | pgTAP, run in a real local Postgres | `supabase/tests/database/*.test.sql` |
| Pure logic | Week maths (Monday to Sunday), location normalisation, answer validation, error mapping | Jest | `src/**/*.test.ts`, next to the code |
| Service logic | `savePainEntry` and the read functions, using a fake Supabase client (no network) | Jest | `src/services/assessments.test.ts` |

The full list of rules and the test that proves each one is in [docs/testing.md](docs/testing.md), including what is **not** automated.

### How to run the tests

```bash
npm test                 # all Jest tests once
npm run test:watch       # re-run Jest on every save while you code
npm run test:ci          # what CI runs: Jest plus a coverage report in coverage/
npm run typecheck        # TypeScript type check
npm run lint             # ESLint (warnings are allowed, errors fail CI)
```

The database tests need Docker Desktop running and the local Supabase stack:

```bash
supabase start           # first run downloads several GB
supabase test db         # runs every file in supabase/tests/database/
supabase db reset        # rebuilds the local database from all migrations
```

If `supabase start` fails because the analytics container is unhealthy (low Docker memory), use `supabase start -x logflare,vector`. The tests do not need those services.

### What CI runs

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on every pull request and every push to `main`:

| Job | Runs |
| --- | ---- |
| `static-checks` | `npm run lint`, `npm run typecheck` |
| `unit-tests` | `npm run test:ci`, then uploads the coverage report |
| `database-tests` | `supabase start`, `supabase test db`, `supabase db lint --local --fail-on error`, and a check that `src/types/database.ts` matches the migrations (if you change a migration, run `supabase gen types typescript --local > src/types/database.ts` and commit it) |

See the results in the **Checks** box on a pull request, or on the repository's **Actions** tab.

### How to add a test

- **Logic:** create `thing.test.ts` next to `thing.ts`. Name tests as plain sentences ("rejects a second submission in the same week"). Add the file you are testing to `collectCoverageFrom` in `jest.config.js`. A service test must start with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))` above its imports, because the real client cannot load under Jest.
- **Database:** add `NNN_name.test.sql` to `supabase/tests/database/`. Start with `begin;` and `select plan(N);` (N is the number of checks), and end with `select * from finish(); rollback;` so nothing is left behind.
- Never edit an existing migration. Add a new one.