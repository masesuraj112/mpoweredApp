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
- Commit attribution: add no Co-authored-by / Generated-by trailers.
