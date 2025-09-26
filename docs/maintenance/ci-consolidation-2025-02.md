# CI Consolidation Plan — PR Workflow

## Intent
Consolidate PR CI into parallelised jobs that gate on backend + frontend build/test and introduce a first-pass dependency security scan, paving the way for SOC2 evidence capture.

## Context
Previous PR CI ran a single backend job on Node 22. Frontend builds, linting, and dependency scans were manual, and backend tests ran serially. With strict TS and ESLint now enabled, CI must exercise both runtimes across supported Node versions and provide a security signal.

## Assumptions
- Node 18 and 22 remain the supported LTS targets for backend packages (Node 20 covered via Next.js locally).
- Pip-based audit can run against `aca_py_agent/requirements.txt`; additional Python services can be added later.
- `npm audit` running against the offline cache will have network access in GitHub-hosted runners.

## Risks & Mitigations
- **Audit noise**: `npm audit` may report transitive high severities that require overrides → triage by updating dependencies (Task 2) or adding documented exceptions.
- **Runtime matrix time**: Duplicating backend jobs for Node 18 & 22 increases runtime → caching `npm` dependencies mitigates.
- **Python audit coverage**: Only `aca_py_agent` audited today; plan follow-ups for `ai-matcher-service` once requirements are formalised.

## UX / DevX Notes
- Backend job executes lint → build → test using the new `npm run lint` script, ensuring developers see the same errors locally.
- Frontend job depends on backend completion but runs in parallel per GitHub’s scheduler, providing quick feedback for UI changes.
- Security job installs dependencies without running lifecycle scripts to avoid executing build steps during auditing.

## Acceptance Tests
1. Push a branch touching `backend/` triggers backend matrix, frontend lint/build, and security audit in PR CI.
2. Deliberately introduce a failing lint (e.g., unused var) to confirm backend job blocks the PR.
3. Add a known vulnerable package to verify `npm audit --audit-level=high` fails the security job.

## Deliverables
- Updated `.github/workflows/pr-ci.yml` with backend matrix, frontend build job, and dependency security job.
- Documentation of CI expectations here for inclusion in runbooks and SOC2 evidence scripts.
- Future follow-up: extend security job to include `pip-audit` over `ai-matcher-service` once dependencies are pinned.
