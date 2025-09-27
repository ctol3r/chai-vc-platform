# Repository Guidelines

## Project Structure & Module Organization
- The backend TypeScript API lives in `backend/` with application code under `backend/src/`, Prisma schema and seeds in `backend/prisma/`, and Jest specs in `backend/__tests__/`.
- The Next.js client sits in `frontend/`, with routes in `frontend/pages/`, shared widgets in `frontend/components/`, and client utilities in `frontend/utils/` and `frontend/vault/`.
- Smart contracts and Hardhat scripts live in `credential-demo/` and `contracts/`, while automation and CI configs reside in `scripts/`, `.github/workflows/`, and the root `Makefile`.
- Generated artefacts such as `backend/dist/` and `frontend/.next/` are build outputs—never edit them directly.

## Build, Test, and Development Commands
- Backend: `cd backend && npm run dev` serves the API via ts-node, `npm run build` emits `dist/`, `npm test` runs the TS-aware Jest suite, and `npm run ci-smoke` performs the build + unit smoke check used in CI.
- Frontend: `cd frontend && npm run dev` starts the Next.js dev server, `npm run build` compiles production assets, `npm start` serves them, and `npm run lint` applies Next lint rules.
- Contracts: from the repository root run `npm test` or `npx hardhat test` to execute Solidity specs; sample issuance scripts live under `credential-demo/scripts/`.
- Docker helpers in the root `Makefile` (`make build`, `make up`, `make smoke`) provide a reproducible service stack.

## Coding Style & Naming Conventions
- Use TypeScript (`.ts/.tsx`) wherever possible and default to named exports; provide both named and default exports only when interoperability (e.g., Jest mocks) requires them.
- Indent with two spaces, keep imports grouped by source (external → internal), and mirror the existing camelCase for functions and PascalCase for classes.
- Run `npm run lint` in `frontend/` and rely on `tsc`/`ts-jest` in `backend/`; prettier is not enforced, so match surrounding style and avoid trailing whitespace.

## Testing Guidelines
- Backend specs live in `backend/__tests__/` and use Jest; prefer the helper factories in `backend/__tests__/helpers/` for blockchain stubs and name files `*.test.ts`.
- Frontend tests should land under `frontend/__tests__/` or `frontend/vault/__tests__/`; pair them with `npm run lint` and `npm run type-check`.
- Hardhat handles contract assertions; place fixtures in `credential-demo/test/` and run `npx hardhat test` before touching chain adapters.
- Aim to cover new resolver/controller paths with integration tests and keep CI green by running `npm run ci-smoke` locally.

## Commit & Pull Request Guidelines
- Follow the existing Conventional Commit style (`fix(back): …`, `chore(ci): …`, `test: …`) for every commit.
- PRs must describe scope, reference tickets, list affected packages, and attach screenshots or API responses when UI or contract behaviour changes.
- Before requesting review, ensure backend smoke tests and frontend lint/type-check succeed and paste relevant command output if CI may be flaky.

## Security & Configuration Tips
- Use `.env.example` as the template for local secrets; run `make bootstrap` to create `.env` and install deps.
- Keep blockchain, Ocean, and Prisma integrations deterministic in local mode; document required migrations or data scripts in `docs/` when introducing them.
