@AGENTS.md

# MPowered app: instructions for Claude

React Native 0.86 + Expo SDK 57 + Expo Router + TypeScript (strict) + Supabase. Path alias: `@/` means `src/`.

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