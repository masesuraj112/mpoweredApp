## Branch Naming Convention

| Prefix | Used for | Examples |
|---|---|---|
| `feature/` | New functionality that doesn't exist yet | `feature/pain-tracker-form`, `feature/supabase-auth`, `feature/health-profile-summary`, `feature/bottom-navigation` |
| `fix/` | Fixing a bug in something that already exists | `fix/pain-slider-accepts-negative-values`, `fix/login-crash-on-empty-password` |
| `chore/` | Setup/maintenance work that isn't a feature or bug — config, dependencies, folder structure | `chore/setup-eslint`, `chore/update-dependencies`, `chore/initial-repo-structure` |
| `refactor/` | Rewriting/cleaning up existing code without changing what it does | `refactor/extract-validation-functions`, `refactor/simplify-navigation-setup` |
| `test/` | Adding tests to existing code (when not bundled into the feature branch itself) | `test/pain-entry-validation`, `test/rls-policies` |
| `docs/` | Documentation only — README, code comments, Notion-adjacent in-repo docs | `docs/setup-instructions`, `docs/api-notes` |

---

## Summary
<!-- Brief description of what this PR does and why -->

**Branch:** `<prefix>/<short-description>`

## Type of Change
- [ ] `feature/` — New functionality
- [ ] `fix/` — Bug fix
- [ ] `chore/` — Setup/maintenance (config, deps, structure)
- [ ] `refactor/` — Code cleanup, no behavior change
- [ ] `test/` — Tests added to existing code
- [ ] `docs/` — Documentation only

---

## Acceptance Criteria

**If `fix/`:**
- [ ] Root cause identified and described below
- [ ] Steps to reproduce the original bug are documented
- [ ] Fix verified against the reproduction steps
- [ ] Regression check: related functionality still works

**If `feature/`:**
- [ ] Feature matches the agreed spec / user story
- [ ] Edge cases identified and handled (list below)
- [ ] Feature does not break existing functionality

**If `refactor/`:**
- [ ] Behavior is unchanged — existing tests still pass without modification
- [ ] No new functionality introduced

**If `chore/` or `docs/`:**
- [ ] Change is non-functional (doesn't alter app behavior)
- [ ] Verified nothing else broke as a side effect (e.g. dependency bump, config change)

**Root cause / spec reference:**
<!-- Link to issue, ticket, or spec -->

**Edge cases considered:**
- [ ] 
- [ ] 
- [ ] 

---

## Requirements Checklist
- [ ] Code adheres to team coding standards (naming, structure, formatting)
- [ ] No commented-out / dead code left behind
- [ ] No hardcoded values that should be config/constants
- [ ] Adequate comments for non-obvious logic
- [ ] Tests added/updated for new or changed behavior
- [ ] No obvious security/performance concerns introduced

## CI/CD
- [ ] Pipeline passes (link to run): 
- [ ] All existing tests still pass
- [ ] Linter/formatter clean

## Reviewer Verification (must complete before merge)
- [ ] Pulled branch and ran locally
- [ ] Manually tested happy path
- [ ] Manually tested at least one edge case (describe below)
- [ ] Screenshot/GIF attached showing working feature
      *(For `chore/`/`docs/`/`refactor/` with no visible UI change, replace screenshot with a terminal output/log showing successful build+test run)*

**Local testing notes:**
<!-- What you tested, what you found -->

**Screenshot:**
<!-- Attach here -->

---

## Reviewer Sign-off
- **Reviewer:** 
- **Result:** ✅ Approved / 🔄 Changes requested / ❌ Rejected
- **Comments:**
