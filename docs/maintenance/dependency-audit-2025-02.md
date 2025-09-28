# Dependency Audit & Upgrade Plan — February 2025

## Intent
Capture the current dependency posture across the mono-repo, flag deprecated or high-risk libraries, and outline the pull requests needed to harden the stack ahead of cryptographic feature work.

## Context
The platform spans Node/TypeScript services (`backend/`, `frontend/`, Hardhat utilities), plus Python-based stubs (`aca_py_agent/`). Several components (Apollo Server v3, mixed ethers versions, dormant SOC2 tooling) predate the current SAFE profile and must be normalised before enabling stricter TypeScript and CI policies.

## Assumptions
- Network access is restricted in the SAFE profile; version checks use the locked versions in `package.json`/`package-lock.json` and 2024Q4 release knowledge. Final upgrades will validate with `npm outdated`/`pip list --outdated` once run in an environment with registry access.
- Node 18+ and npm 9+ remain the project baseline (per CI logs), and Python services target Python 3.11.
- Upcoming tasks will adopt TypeScript strict mode and ESLint; dependency updates must stay compatible with those efforts.

## Risks & Mitigations
- **Stale GraphQL stack**: `apollo-server` and `apollo-server-express` v3 are deprecated → migrate to `@apollo/server` v4 with `expressMiddleware` to avoid security fixes being missed.
- **Version skew**: Hardhat utilities use `ethers@5` while the backend runs `ethers@6` → unify by upgrading the tooling to `ethers@6` + `@nomicfoundation/hardhat-ethers@3`.
- **Prisma major drift**: Declared versions (`prisma`/`@prisma/client` 6.12.0) exceed the current GA release (5.x). Confirm availability before upgrading; if placeholders, pin to latest stable 5.x to prevent `npm install` failures.
- **Python requests**: `requests` lacks explicit pinning; add `requests>=2.32,<3` to minimise supply-chain surprises and document upgrade cadence.
- **Tooling gaps**: No dependency vulnerability scanning in CI; pair upcoming CI consolidation with `npm audit --production` (offline cache) or `pnpm audit --dir` once caches exist.

## UX / DevX Notes
- Prepare codemod guidance for the Apollo v4 migration so contributors can update resolvers without breaking existing mocks.
- Document the ethers unification in `docs/developer-portal/` to help contract authors share utilities.
- Provide a short runbook for bumping Prisma that includes schema introspection, migration diff, and SOC2 evidence capture.

## Acceptance Tests (to run once upgrades are staged)
1. `cd backend && npm install && npm test` — succeeds with upgraded Apollo/Prisma.
2. `cd credential-demo && npm install && npx hardhat test` — passes using ethers v6 toolchain.
3. `cd frontend && npm install && npm run lint` — ensures ESLint baseline still succeeds post-upgrades.
4. `pip install -r aca_py_agent/requirements.txt && pytest aca_py_agent/tests` — verifies pinned Python deps.
5. `npm audit --omit=dev` (backend & frontend) — emits zero high/critical issues (document results in PR).

## Deliverables (planned PRs)
1. **Backend GraphQL stack refresh**
   - Replace `apollo-server`/`apollo-server-express` with `@apollo/server@^4` + `@apollo/server/plugin/disabled` for tests.
   - Update `graphql_api_scaffold.ts` to use the new middleware API and refresh Jest mocks.
2. **Prisma sanity check**
   - Validate available Prisma version; pin to latest stable (expected `5.x`). Regenerate client and adjust `schema.prisma` datasource if Postgres is adopted.
3. **Ethers/Hardhat alignment**
   - Upgrade root Hardhat toolchain to `ethers@^6`, `@nomicfoundation/hardhat-ethers@^3`, and adjust scripts (`issue-and-query-node.js`) to the v6 factory API.
4. **Frontend dependency sweep**
   - Ensure Next.js 14.2.x aligns with React 18.3; add `next-safe-action` or similar only if security policies require.
   - Confirm TypeScript 5.9 compatibility with upcoming strict mode; update `@types/node` to 22 once available.
5. **Python pinning**
   - Add version ranges for `requests` and `pytest` in `aca_py_agent/requirements.txt` and create a Dependabot schedule if allowed.
6. **CI enhancement**
   - Incorporate dependency audit steps into the consolidated CI (Task 6) with offline-compatible tooling (`npm audit --offline`, `pip-audit --requirement`).

## Current Dependency Snapshot
| Package scope | Runtime libs | Dev/tooling | Notes |
| --- | --- | --- | --- |
| `backend/package.json` | `apollo-server@3`, `apollo-server-express@3`, `express@4.19`, `graphql@16`, `ethers@6.15`, `@oceanprotocol/lib@5`, `@polkadot/api@16`, `@prisma/client@6.12` | `jest@29`, `ts-jest@29`, `typescript@5.8`, `ts-node@10.9` | Apollo v3 deprecated; verify Prisma version availability; consider `graphql-scalars` import hygiene. |
| `frontend/package.json` | `next@14.2.32`, `react@18.3.1`, `typescript@5.9.2` | `@types/node@24.3` | Ensure lint config exists post ESLint setup; evaluate `next@15` once stable. |
| Root `package.json` | `ethers@5.8`, `@openzeppelin/contracts@5.3` | Hardhat toolbox 3.0, `solc@0.8.20` | Align ethers version with backend; consider Foundry integration before large contract features. |
| `aca_py_agent/requirements.txt` | `requests (unpinned)` | `pytest (unpinned)` | Pin ranges; explore `pip-tools` for lockfiles. |
| `scripts/` & SOC2 tooling | Python scripts without dependency manifest | N/A | Add `requirements-dev.txt` capturing `boto3`, etc., when scripts mature. |

## Next Steps
- Socialise this plan with service owners; use it as the baseline for subsequent ICARUS+D docs on strict mode, linting, and CI consolidation.
- Sequence PRs to land Apollo → Prisma → ethers to minimise breaking changes.
