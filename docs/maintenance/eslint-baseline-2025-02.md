# ESLint Baseline — Backend TypeScript

## Intent
Introduce an ESLint configuration for the backend so TypeScript strictness is continuously enforced and future CI jobs can gate on style and safety rules.

## Context
Prior to this change the backend lacked any linting scripts, so issues like forgotten `await` calls or mixed import styles slipped through. The frontend already relies on Next.js linting, so the backend needed a matching baseline before CI consolidation (Task 6).

## Assumptions
- Developers run `npm install` in `backend/` to pick up the new ESLint dependencies; SAFE profile prevents registry access here, so CI or local environments must install with cache access.
- Type-aware linting (`parserOptions.project`) is deferred until dependency upgrades stabilise to avoid slow lint runs.
- Jest remains the primary test harness; ESLint is configured with `jest` globals to avoid false positives.

## Risks & Mitigations
- **Missing packages locally**: Without installing `eslint`, the lint script fails → document install step and rely on CI to execute in hydrated environments.
- **Autofix churn**: Initial lint runs may surface numerous warnings; we configured `no-explicit-any` as off and added a minimal rule set to keep the first pass small.
- **Node version drift**: ESLint 9 targets Node 18+; matches our baseline.

## UX / DevX Notes
- Added `npm run lint` that scopes to `src/**/*.{ts,tsx}` with `--max-warnings=0` to fail CI on warnings once the codebase is clean.
- Config enables `@typescript-eslint/no-floating-promises` to guard against missing awaits, while allowing console logging for stub services.
- Ignore patterns cover `dist`, `coverage`, and `node_modules` so TypeScript build outputs do not trigger lint runs.

## Acceptance Tests
1. `cd backend && npm install` followed by `npm run lint` — expected to pass once dependencies are installed (skipped in SAFE sandbox).
2. `npm run lint -- --fix` should be idempotent (no changes on second run) after initial autofix pass.

## Deliverables
- `backend/.eslintrc.cjs` — ESLint configuration with `@typescript-eslint` baseline.
- `backend/package.json` — new `lint` script and devDependency pins for ESLint tooling.
- `.gitignore` already covers artefacts; no additional ignore files required.
- Documented usage here for inclusion in the developer runbook update.
