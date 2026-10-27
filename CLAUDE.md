@AGENTS.md

# MPowered app: instructions for Claude

React Native 0.88 + Expo SDK 58 + Expo Router + TypeScript (strict) + Supabase. Path alias: `@/` means `src/`.

## Layout
- Routes: `app/(auth)`, `app/(tabs)/{home,health,planner,tracker,settings}`. Keep screens thin: compose components and hooks, no business logic.
- `src/components/ui`: generic primitives with no app logic (Card, Button, etc.).
- `src/components/mpowered`: older app-specific components. Do not reuse them for the Care Planner (they are being refactored later).
- `src/components/care-planner`: Care Planner components.
- `src/features/<area>`: types, hooks, pure logic. `src/services`: data access. `src/lib`: supabase client, `result.ts`, `errors.ts`. `src/constants/theme.ts`: design tokens.
- `src/types/database.ts` is GENERATED. Never edit it by hand.

## Code conventions
- Services return `Result<T>` (`ok`/`fail` from `@/lib/result`), never throw to the UI. Errors go through `mapError`. The Supabase client is the last optional argument so tests can pass a fake.
- One Supabase client only: `src/lib/supabase.ts`. Never put the service-role key anywhere in the app.
- State: `useState` for local, React Context for shared client state, plain hooks for server data. No Zustand or TanStack Query.
- Components: PascalCase, file name = component name, named by role not appearance (`QuestionRow`, not `GreyCard`). Split out a piece if it repeats, has its own state, or exceeds about 150 lines.
- Appointment dates are LOCAL wall-clock time (the DB column is `timestamp without time zone`). Never convert to UTC or use `toISOString()` for them.

## Styling and accessibility (new work)
- Flex layouts only: no absolute-pixel "canvas" layouts, no fixed heights. Whole screens scroll inside the safe area.
- Colours and spacing from `@/constants/theme`, not hard-coded hex. Add missing tokens there, minimally. Leave system font scaling ON; do not use the `scale*` helpers for font sizes.
- Tap targets at least 48dp. Every interactive element has an accessibilityRole and label. Nothing may depend on swipe alone.
- Older screens do not follow these rules. Do not copy their patterns.

## Figma
- Use `get_metadata` first for large frames, then `get_design_context` on sub-nodes. Output is React + Tailwind: translate to React Native StyleSheet, and do not copy absolute positioning.

## Database rules
- Never edit a migration that already exists. Add a new one (`supabase migration new <name>`), with a `-- Rollback:` comment, RLS enabled, and explicit grants.
- Never run `supabase db push` or touch the shared dev/production databases. A human does that.
- Any change to a migration needs the generated types regenerated and a pgTAP test.

## Testing and checks
- Run before finishing: `npm run typecheck`, `npm run lint`, `npm test`.
- Jest tests sit next to the code (`thing.test.ts`). Add logic files to `collectCoverageFrom` in `jest.config.js`. Service tests must start with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))`.
- Do not run `npm run format` or Prettier over the whole repo: line endings are mixed and it would rewrite unrelated files. Keep diffs minimal.

## Git
- You run git commands that write (add, commit, push, branch, checkout -b, stash, reset, merge)
- Branches: `feature/`, `fix/`, `chore/`, `refactor/`, `test/`, `docs/` + lowercase-hyphenated name.

# Backend and login build plan

## 1. Guardrails

> **GUARDRAILS: obey all of these on every step**
> 1. **Never edit an existing migration.** Add a new file in `supabase/migrations/` with a `-- Rollback:` comment. Do not touch files already in that folder.
> 2. **Never disable RLS or weaken a policy.** Never grant to `anon` unless the step says so.
> 3. **Never use the service-role key in the app.** Never commit `.env`, tokens, Twilio credentials or OTP codes. Secrets in `config.toml` use `env(NAME)` only.
> 4. **Test OTP numbers go in the dev project / local config only. Never in production.**
> 5. Database functions are `plpgsql`, `security invoker`, `set search_path = public`, derive the user from `auth.uid()` / `current_users_id()`, raise `P0001` with a message code, and end with `revoke all … from public, anon; grant execute … to authenticated`. Follow `save_pain_assessment` and `save_social_health_assessment`.
> 6. Always filter `public.users` by `auth_id` (the `users_select` policy also returns a patient's row to support persons).
> 7. Services take the Supabase client as the **last optional argument**, return `Result<T>` (`src/lib/result.ts`), and wrap calls in `run()`. Map errors through `mapError` / `AppError` (`src/lib/errors.ts`).
> 8. Pure modules **never import** `@/lib/supabase`, `react-native` or `expo-*`.
> 9. Do not import from `app/` inside `src/`.
> 10. Do not log OTP codes or phone numbers. Remove, do not add, `console.log` of identifiers.
> 11. Service tests start with `jest.mock('@/lib/supabase', () => ({ supabase: {} }))`. Add every new tested file to `collectCoverageFrom` in `jest.config.js`.
> 12. pgTAP files: `supabase/tests/database/NNN_name.test.sql`, `begin; select plan(N); … select * from finish(); rollback;`.
> 13. Re-read each file before editing it. Make the **minimum** change. Do not reformat unrelated code (the repo has mixed line endings; keep each file's existing endings).
> 14. Run `npm run lint` and `npm run typecheck` before committing. **Do not run `supabase start`, `supabase test db` or anything needing Docker**; CI runs those. Jest may be run locally.
> 15. One commit per step, using the suggested message. If a step needs a decision that is not recorded in section 2, stop and ask.

## 2. Reference docs

- Build plan: `docs/backend/login-backend-build-plan.md` (section 1 = guardrails, section 2 = decisions register, Phases 1-10 = steps)
- Testing and CI: `docs/backend/testing-and-cicd.md` (CI-only testing rules)
- Progress tracker: `docs/backend/progress.md` (resume a new session from here)
- Care Planner (patient side) back end: `docs/backend/care-planner-build-plan.md` (same rules; its checklist is in the progress tracker)

## 3. Working agreement

- Work one PHASE at a time, in order. One commit per step, using the suggested commit message. Never start the next phase until the user says so.
- At the end of each phase: push, then give a summary with one line per step, anything unsure, anything that could not be verified, and what CI should prove.
- NEVER decide a question that is open in the decisions register (status 🟡, ❓ or ⏳), and never invent column names, error codes or library behaviour marked "(verify)". STOP and ask the user with the AskUserQuestion tool, giving 2-4 options and a recommendation.
- Steps marked [GATE] or [B] must not start until the decision they depend on is recorded as settled. Ask first.
- Before any migration (Phase 6), show the exact SQL and grants and wait for approval before writing the file.
- Do not run `supabase start`, `supabase test db` or anything needing Docker. `npm run lint`, `npm run typecheck` and `npm test` are allowed.
- Never edit an existing migration. Never touch files outside the step.
- If something in the plan conflicts with what is found in the repo, stop and tell the user; do not silently choose.
- Keep `docs/backend/progress.md` up to date: a checklist of every step ID with done / blocked / skipped.
