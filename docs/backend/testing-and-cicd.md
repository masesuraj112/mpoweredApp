# MPowered Back End: Testing and CI/CD Plan (CI-only)

**Owner:** Mohammad  |  **Repo:** `masesuraj112/mpoweredApp`  |  **Revision:** 1 (2026-10-14)
**Covers:** the login/onboarding back end now, and the same pattern for every back-end feature that follows (pain, social health, personal care, management, movement, …).
**Companion file:** `login-backend-build-plan.md`

---

## 1. The strategy in one paragraph

**Tests are written for every change, but none are run locally on Docker.** GitHub Actions is the only place the database (pgTAP) and integration tests run. A developer (or Claude Code) pushes a branch, opens a PR, and the **Checks** box says pass or fail. Fast, Docker-free checks (lint, typecheck, Jest) may still be run locally for quick feedback; they are not the source of truth.

> Reading of your instruction: "no local testing on Docker" = never run `supabase start` / `supabase test db`. Lint, typecheck and Jest need no Docker, so I allow them locally. If you want *nothing* run locally, delete the "may run" lines in §8.

---

## 2. What already exists (do not rebuild)

| Item | State |
| --- | --- |
| `.github/workflows/ci.yml` | Jobs `static-checks` (lint, typecheck), `unit-tests` (`npm run test:ci` + coverage artifact), `database-tests` (Supabase CLI **2.116.0**, `supabase start -x logflare,vector`, `supabase test db`, `supabase db lint --local --fail-on error`, generated-types diff against `src/types/database.ts`). Concurrency `ci-${{ github.ref }}`, Node **24.20.0** |
| `jest.config.js` | `jest-expo`, `jest.setup.js` (dummy `EXPO_PUBLIC_SUPABASE_*`), alias mappers, **explicit `collectCoverageFrom` list**, no thresholds |
| `supabase/tests/database/` | `000`, `010`, `020`, `025`, `030`, `040`, `045`, `046`, `050` pgTAP files |
| `docs/testing.md` | Traceability table (rule → test → layer → CI job), "Not automated", evidence TODOs |
| README Testing section + CI badge | Still describes local Docker (update, §9) |
| Not present | `format:check`, `deploy-db.yml`, branch protection, secret scan, migration-immutability check, coverage thresholds |

---

## 3. Test layers

| Layer | What it proves | Tool | Location | Runs in |
| --- | --- | --- | --- | --- |
| **L0 Static** | Lint, types, generated types match migrations, no edited migrations, no secrets | ESLint, `tsc`, `supabase gen types`, git diff, gitleaks | `ci.yml` | `static-checks`, `database-tests` |
| **L1 Pure logic** | Normalisation, validation, mapping, scoring, error codes | Jest | `src/**/*.test.ts` next to code | `unit-tests` |
| **L2 Service** | Services call the client correctly, bad input never reaches Supabase, errors map | Jest + injected fake client | `src/services/*.test.ts` | `unit-tests` |
| **L3 Database** | Constraints, RLS, grants, function behaviour and atomicity in real Postgres | pgTAP via `supabase test db` | `supabase/tests/database/NNN_*.test.sql` | `database-tests` |
| **L4 Auth integration** *(optional)* | `signInWithOtp` + `verifyOtp` with a test number against the CI local stack | Jest (node env) against `supabase start` | `integration/*.test.ts` | new job `auth-integration` |
| **L5 Component** *(optional)* | `verify` screen renders 6 cells, disables button, shows errors | `@testing-library/react-native` | `__tests__/` | `unit-tests` |
| **L6 Manual** | Real device, real SMS (Twilio sprint) | Checklist | PR description | n/a |

Rules of thumb: put each rule in the **lowest** layer that can prove it. Security rules (RLS, grants) **must** have an L3 test.

---

## 4. Unit and service tests for login (L1/L2)

Files to create (matching the build plan):

| Source | Test | Must cover |
| --- | --- | --- |
| `src/features/auth/phone.ts` | `phone.test.ts` | all accepted shapes → `+614xxxxxxxx`; rejects short/long/landline/letters/`+1`; idempotent |
| `src/features/auth/otp.ts` | `otp.test.ts` | digits only, truncation to 6, completeness |
| `src/features/auth/messages.ts` | `messages.test.ts` | one friendly message per new `AppError` code; none leaks account existence |
| `src/features/auth/profile.ts` | `profile.test.ts` | sex casing, userType mapping, blank conditions dropped, no-diagnosis empties conditions, first failing `field` reported |
| `src/lib/errors.ts` | `errors.test.ts` (extend) | each new code mapping + unknown fallback |
| `src/services/auth.ts` | `auth.test.ts` | invalid phone/code makes **zero** client calls; success; wrong/expired code; rate limited; network; `hasProfile` true/false/no-session |
| `src/services/profile.ts` | `profile.test.ts` (services) | mapper failure → no rpc; success; `PROFILE_EXISTS` → ok; error mapping; payload has no user id |

Service-test skeleton (follow `src/services/social-health.test.ts`):

```ts
jest.mock('@/lib/supabase', () => ({ supabase: {} }));

import { sendVerificationCode } from './auth';

const makeClient = (result: { error: unknown }) =>
  ({ auth: { signInWithOtp: jest.fn().mockResolvedValue({ data: {}, ...result }) } }) as any;

it('does not call Supabase for an invalid phone number', async () => {
  const client = makeClient({ error: null });
  const res = await sendVerificationCode('0312345678', client);
  expect(res.ok).toBe(false);
  expect(client.auth.signInWithOtp).not.toHaveBeenCalled();
});

it('sends an E.164 number', async () => {
  const client = makeClient({ error: null });
  await sendVerificationCode('0491 570 006', client);
  expect(client.auth.signInWithOtp).toHaveBeenCalledWith(
    expect.objectContaining({ phone: '+61491570006' }),
  );
});
```

Checklist for every new tested file: (1) add it to `collectCoverageFrom`; (2) pure modules import no `@/lib/supabase`, `react-native` or `expo-*`; (3) test names are plain sentences.

---

## 5. Database tests for login (L3, pgTAP)

Fixture pattern (copy from `050_save_social_health_assessment.test.sql`):

```sql
begin;
create extension if not exists pgtap with schema extensions;
select plan(N);

insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000c1'),
  ('00000000-0000-0000-0000-0000000000c2');

set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub','00000000-0000-0000-0000-0000000000c1','role','authenticated')::text, true);
```

### 5.1 `060_profile_privileges.test.sql`
| # | Check |
|---|---|
| 1–3 | `authenticated` has INSERT on `users`, `patients`, `patient_musko_skeletal_pain` |
| 4 | `authenticated` has **no** UPDATE or DELETE on those three |
| 5 | `anon` has no SELECT/INSERT on those three |
| 6 | `anon` cannot execute `create_profile`; `authenticated` can |

### 5.2 `061_create_profile.test.sql` (use `lives_ok` / `throws_ok` with `'P0001'` and message code)
| # | Check |
|---|---|
| 1 | `has_function('public','create_profile', …)` |
| 2 | Success: one `users` row (`auth_id` = caller, phone E.164), one `patients` row, N condition rows |
| 3 | Sex stored with DB casing |
| 4 | Blank `other_conditions` stored as NULL |
| 5 | Second call → `PROFILE_EXISTS` |
| 6 | No session (`request.jwt.claims` cleared) → `NO_SESSION` |
| 7 | Blank name; name longer than 45 → validation error |
| 8 | Bad sex value; year 1899 and a future year; bad phone (`0491…`, not E.164) |
| 9 | Blank and duplicate conditions handled |
| 10 | **Atomicity:** a call with a bad second condition leaves **no** `users` row |
| 11 | RLS: user C2 cannot see C1's `users`/`patients`/condition rows (filter by `auth_id`) |
| 12 | [B] support person → `users` row only, no `patients` row |

Always end with `reset role; select * from finish(); rollback;`. Update `plan(N)` to the exact count.

### 5.3 Reminders
- New table or column → new migration → **types-diff will fail until you commit regenerated types** (see §7.3).
- Local default privileges differ from hosted, so assert grants explicitly (as above) rather than relying on defaults.

---

## 6. CI additions (in priority order)

### 6.1 Required now
**(a) Migration-immutability check**: fails if a PR modifies, deletes or renames an existing migration. Add to `static-checks`:

```yaml
  migrations-immutable:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Existing migrations must not change
        run: |
          changed=$(git diff --name-status origin/${{ github.base_ref }}...HEAD -- supabase/migrations | grep -E '^(M|D|R)' || true)
          if [ -n "$changed" ]; then echo "Edited existing migrations:"; echo "$changed"; exit 1; fi
```

**(b) Secret scan**: catches committed `.env`, Twilio tokens, service-role keys:

```yaml
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
(**verify** the action's current licence terms for organisation repos; fall back to running the `gitleaks` binary directly if needed.)

**(c) Keep test OTPs out of production:** there is no automated check for this, because production Auth settings live in the Supabase dashboard rather than in the repo. Rely on the rules in §7.4 (never run `supabase config push` against production) and on the production checklist in the build plan (S9.3).

### 6.2 Recommended soon
- **Coverage threshold** for the new pure modules only (avoid failing on untouched legacy files). In `jest.config.js` use per-path `coverageThreshold` entries, e.g. 90% lines for `src/features/auth/` and `src/services/auth.ts`.
- **`format:check`**: deferred in `docs/testing.md` because of mixed line endings. Fix first with a one-off `.gitattributes` (`* text=auto eol=lf`) + normalising commit, then add `"format:check": "prettier --check ."` and a `static-checks` step. Do this as its own PR, not mixed with login work.
- **Cache the Supabase images** for `database-tests` if run time becomes a problem (**verify** options; not needed yet).

### 6.3 Optional: `auth-integration` job (L4) **(unverified)**
Purpose: prove `signInWithOtp` + `verifyOtp` with the test number against the CI stack.
```yaml
  auth-integration:
    runs-on: ubuntu-latest
    needs: [database-tests]   # or duplicate the setup steps
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with: { version: 2.116.0 }
      - uses: actions/setup-node@v4
        with: { node-version: 24.20.0, cache: npm }
      - run: npm ci
      - run: supabase start -x logflare,vector
      - name: Export local API URL and anon key
        run: |
          supabase status -o env | grep -E '^(API_URL|ANON_KEY)=' | sed 's/^API_URL/EXPO_PUBLIC_SUPABASE_URL/; s/^ANON_KEY/EXPO_PUBLIC_SUPABASE_ANON_KEY/' >> $GITHUB_ENV
      - run: npx jest --config jest.integration.config.js --ci
```
Caveats: output variable names and the env var your client reads (**verify** in `src/lib/supabase.ts` and `supabase status -o env`); needs a separate Jest config (node environment, no `jest-expo` preset); only worth building if test OTP works locally without a provider (build plan S1.2 will tell you). Skip for now if it fights you; the manual checklist covers it.

---

## 7. CD: deploying database changes

### 7.1 Environments
| Environment | Purpose | Auth config |
| --- | --- | --- |
| Local/CI stack | pgTAP, integration | `config.toml` (test OTP allowed) |
| **Test/Dev project** (hosted) | Team development | Test OTP numbers allowed |
| **Production project** | Real users | **No test OTP. Email provider off.** |

### 7.2 `deploy-db.yml`
Implemented for the `test` environment in `.github/workflows/deploy-db.yml`: it runs when CI completes successfully on `main` (or by `workflow_dispatch`) and runs `supabase link`, `migration list` and `db push`. The `production` job below is **not built yet**; add it when a production project exists. It needs the `test` environment secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` and `SUPABASE_PROJECT_REF`. The sketch below is the original design:
```yaml
name: Deploy database
on:
  push:
    branches: [main]
    paths: ['supabase/migrations/**']
jobs:
  deploy-test:
    runs-on: ubuntu-latest
    environment: test
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with: { version: 2.116.0 }
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env: { SUPABASE_ACCESS_TOKEN: '${{ secrets.SUPABASE_ACCESS_TOKEN }}' }
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
  deploy-production:
    needs: deploy-test
    runs-on: ubuntu-latest
    environment: production        # configure "Required reviewers" on this environment
    steps:
      # same as above using the production environment's secrets
```
Notes: `db push` applies **migrations only**. Do **not** use `supabase config push` for production while `config.toml` contains test OTP numbers. Set secrets per **GitHub Environment** (`test`, `production`), not repository-wide.

### 7.3 Regenerating `src/types/database.ts` without local Docker
1. Push the migration; the types-diff step fails and prints a diff.
2. Apply that diff (or run `supabase gen types typescript --local > src/types/database.ts` on any machine that has the stack; otherwise copy from the CI log).
3. Commit; CI goes green. Better: add a small CI step that uploads the generated file as an artifact so you can download it:
```yaml
      - name: Generate types
        run: supabase gen types typescript --local > /tmp/database.ts
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: generated-types, path: /tmp/database.ts }
```

### 7.4 Production safety rules
- Test OTP numbers exist only in the Test/Dev project and local `config.toml`.
- Never run `supabase config push` or `db reset` against production.
- A migration reaches production only by merging to `main` → test succeeds → a human approves the `production` environment.
- Rollback = a new forward migration (existing migrations are never edited); keep the `-- Rollback:` comment accurate.

---

## 8. Working loop with Claude Code under CI-only

1. Claude Code works on a branch, one step per commit, running only **lint/typecheck (and optionally Jest)**.
2. Push and open a **draft PR** (`gh pr create --draft`).
3. Wait for CI. Claude Code can read results: `gh pr checks <n> --watch` and, on failure, `gh run view <run-id> --log-failed`.
4. Fix in a **new commit** (do not amend after pushing). Repeat until green.
5. Mark ready, review, merge.

Failure-handling prompt:
```text
CI failed on PR #<n>. Run `gh pr checks <n>` and `gh run view --log-failed`,
tell me which job failed and why, then fix ONLY that, as a new commit.
Do not run supabase locally. Do not edit existing migrations; if a migration
is wrong, add a new one.
```

pgTAP is harder to debug without local runs, so: keep each `.test.sql` small, make failure messages descriptive, and commit tests **in the same step** as the migration so CI tells you immediately which assertion broke.

**Setting up `gh` for Claude Code**: authenticate once with `gh auth login` on the machine running Claude Code. If Claude Code cannot reach GitHub, it cannot read check results; paste the failing log instead.

---

## 9. Docs to update (one `docs:` commit)

- **README → Testing:** remove "The database tests need Docker Desktop…" and the local `supabase start/test db/db reset` block; replace with "Database tests run only in CI. Open a PR and read the Checks box." Keep `npm test`, `test:ci`, `typecheck`, `lint`.
- **`docs/testing.md`:** replace "Current results (local)" with a pointer to the latest CI run; add rows for the login rules (§4–5); add to "Not automated": real SMS delivery, screen rendering (unless L5 is built), OTP expiry; update "Not tested / deferred" (branch protection and deploy move out once done).
- **PR template:** the reviewer line "Pulled branch and ran locally" → "CI is green; reviewed the diff".

---

## 10. One-time GitHub settings checklist

| Setting | Value |
| --- | --- |
| Branch protection on `main` | Require PR; require status checks `static-checks`, `unit-tests`, `database-tests` (+ `migrations-immutable`, `secret-scan` once added); require branches up to date; block force-push |
| Required reviews | At least 1 |
| Environments | `test` (secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`); `production` (same names, production values, **required reviewers**) |
| Secrets hygiene | Never in repository-level secrets for production; rotate if exposed |
| Dependabot (optional) | Enable for npm and GitHub Actions |
| Actions permissions | Default `GITHUB_TOKEN` read-only; grant write only per job |
| Deferred to Twilio sprint | `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` as an environment secret |

---

## 11. Order of work for this plan

1. Branch protection + `migrations-immutable` + `secret-scan` (CI-only PR).
2. Phase 2–3 of the build plan (pure + service tests; no DB).
3. Phase 6 (migration + pgTAP 060/061 + types).
4. Docs update (§9).
5. `deploy-db.yml` once a production project exists.
6. Optional: coverage thresholds, `format:check`, `auth-integration`, component tests.

---

## 12. How to ask Claude Code to make the CI/test edits

**Prompt A: CI additions (one PR, separate commits):**
```text
Read @CLAUDE.md, @docs/backend/testing-and-cicd.md and @.github/workflows/ci.yml.

Do ONLY §6.1(a) and §6.1(b). One commit each:
 - `ci: fail PRs that edit existing migrations`
 - `ci: add secret scanning`
Add the jobs without changing existing ones. Do not run anything needing Docker.
Run `npm run lint` and `npm run typecheck`. Stop after the commits and tell me
what to configure in GitHub settings (branch protection) by hand.
```

**Prompt B: tests for a build-plan step:**
```text
Read @CLAUDE.md, @docs/backend/login-backend-build-plan.md and
@docs/backend/testing-and-cicd.md.
Implement step S6.5 only: create supabase/tests/database/060_profile_privileges.test.sql
and 061_create_profile.test.sql following §5 and copying the structure of
@supabase/tests/database/050_save_social_health_assessment.test.sql.
Use exact plan() counts. Commit as `test(db): cover create_profile and profile table privileges`.
Do not run supabase locally; I will check CI.
```

**Prompt C: docs:**
```text
Do §9 of @docs/backend/testing-and-cicd.md only. Edit README.md (Testing section),
docs/testing.md and .github/pull_request_template.md (if it exists). One commit:
`docs: describe CI-only testing`. Keep unrelated text unchanged.
```

**Attaching files:** reference with `@path`. The two plan files live in `docs/backend/` so every prompt can cite them. For an unfamiliar pattern, attach a sibling file ("copy the structure of @…") rather than describing it. Large generated files (`src/types/database.ts`) need not be attached; say "regenerate types per §7.3".

---

## 13. Reusing this for upcoming back-end work

For every future feature (e.g. personal care, management, movement):
1. Migration (new file) + privilege migration (explicit revoke/grant).
2. Save function following `save_*_assessment` (invoker, search_path, `P0001` codes, grants).
3. pgTAP: constraints (`NN0`), RLS (`NN5`), privileges (`NN6`), function (`NN0` series), numbered consistently.
4. Pure modules (`normalise`, `validate`, `messages`, `summary`/`scoring`) + Jest, added to `collectCoverageFrom`.
5. Service with injected client + Jest.
6. Add a row per rule to `docs/testing.md`.
7. CI must be green before merge. No new CI work is normally needed, since the jobs pick up new files automatically (except `collectCoverageFrom`).

---

## 14. Known issues and open items

| Item | Note |
| --- | --- |
| Test OTP without an SMS provider | Unverified locally/hosted (build plan A5, S1.2) |
| Local vs hosted default privileges differ | Always assert grants explicitly |
| Mixed line endings | Blocks `format:check`; fix in its own PR |
| Docs conflict on OTP expiry | Check the dev dashboard |
| `docs/testing.md` says "227 Jest tests, 80 pgTAP checks (local)" | Will go stale; replace with CI links |
| GitHub issue "SMS test OTP not honored with Twilio Verify provider" | Unverified; relevant only if Verify is chosen in the Twilio sprint |
