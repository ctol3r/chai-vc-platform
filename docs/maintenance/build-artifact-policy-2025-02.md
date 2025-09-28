# Build Artefact Hygiene — February 2025

## Intent
Eliminate tracked build outputs from the repository and codify ignore rules so future builds remain reproducible without polluting Git history or SOC2 evidence trails.

## Context
`backend/dist/` (tsc output), `frontend/.next/` (Next.js build), and `backend/coverage/` had been committed previously, causing noisy diffs and masking source changes. With strict TypeScript and upcoming ESLint/CI work, we need a clean tree that rebuilds deterministically per environment.

## Assumptions
- Runtime deployments build from source during CI/CD; no production workflow depends on committed artefacts.
- Developers regenerate builds locally via `npm run build` (frontend/backed) or `next build`; removal will not delete hand-written code.
- Git LFS is not required for any generated assets in this step.

## Risks & Mitigations
- **Historical references**: If documentation linked to files under `backend/dist`, those links must be updated → verified no docs reference compiled paths.
- **Local scripts**: Some scripts may have referenced `dist` outputs directly → new dev runbook instructs running `npm run build` before packaging.
- **CI caches**: Workflows relying on checked-in artefacts must switch to build steps; flag this dependency in the CI consolidation task.

## UX / DevX Notes
- Added ignore entries for `**/.tsbuildinfo` and coverage directories, aligning with strict TypeScript incremental builds.
- Developers can run `git clean -fdX` to flush ignored artefacts after builds.
- Documented policy aligns with SOC2 guidance to keep build outputs ephemeral and signed per pipeline instead of version control.

## Acceptance Tests
1. `git status` shows only source changes (no regenerated `.next/` or `dist/` files) after running `npm run build` locally.
2. `cd backend && npm run build` regenerates `dist/` without Git seeing tracked changes.
3. `cd frontend && npm run build` regenerates `.next/` with Git clean afterwards.

## Deliverables
- Removed `backend/dist/` and `frontend/.next/` from the repository.
- `.gitignore` updated with TypeScript build info and coverage artefact patterns.
- Documented clean-build expectations for future CI consolidation work.
