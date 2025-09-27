# ICARUS+D — Privacy Service MVP (Task 1)

## Intent
Create the first iteration of the privacy microservice that exposes proof and verification APIs required by the verifier, issuer, and future wallet workflows. This service will later host the BBS+ and zk-SNARK pipelines but must first establish routing, health checks, config patterns, and testing scaffolding.

## Context
- Current backend routes call into stubs for blockchain and verification; there is no dedicated privacy service.
- Upcoming tasks (#2–#4) depend on a working `/prove` and `/verify` endpoint with deterministic responses so other teams can integrate early.
- SAFE profile restricts network operations; code must run offline with deterministic test data.

## Assumptions
- Node 18+ runtime; service written in TypeScript using Express for parity with the backend stack.
- No real BBS+/ZK computations in this milestone—use deterministic stubs returning hard-coded proof and verification structures.
- Environment configuration via `.env` (e.g., `PORT`, `LOG_LEVEL`); tests can mock without hitting external services.

## Risks & Mitigations
- **Interface drift**: Without OpenAPI definitions, downstream teams may integrate incorrectly → deliver `apps/privacy-service/openapi.yaml` describing `/prove`, `/verify`, `/keyinfo`, `/health`.
- **Test brittleness**: Integration between controller logic and Express might be untested if we rely solely on unit tests → add supertest-based route tests ensuring 200 responses and expected JSON.
- **Future crypto demands**: Stubs must be easily swappable with real libs → structure service modules (e.g., `lib/prover.ts`, `lib/verifier.ts`) using interfaces so Task #2 can plug in BBS+ logic.

## UX / DevX Notes
- Provide `npm scripts`: `dev`, `build`, `start`, `test`, `lint` (hook into shared ESLint once global config is available; for now limit to `tsc` + Jest).
- Include README snippet documenting how to start the service and sample curl commands for `/prove` and `/verify`.
- Support JSON logging (plain console) and standard Express error middleware for consistency.

## Acceptance Tests
1. `cd apps/privacy-service && npm install && npm run build` — TypeScript compiles.
2. `npm test` — runs Jest unit/integration suite covering controllers/routes.
3. `curl http://localhost:5050/health` after `npm start` returns 200 with `{ status: 'ok' }`.
4. `curl -X POST /prove` with sample payload returns deterministic `proofId` and `proof` fields.
5. `curl -X POST /verify` with stub proof returns `{ valid: true, details: ... }`.

## Deliverables
- `apps/privacy-service/package.json`, `tsconfig.json`, `jest.config.js`, `README.md`.
- Source tree: `apps/privacy-service/src/index.ts`, `src/server.ts`, `src/routes/prove.ts`, `src/routes/verify.ts`, `src/routes/keyinfo.ts`, reusable libs under `src/lib/`.
- Tests under `apps/privacy-service/tests/` covering `/health`, `/prove`, `/verify`, `/keyinfo` via supertest.
- OpenAPI spec at `apps/privacy-service/openapi.yaml` describing all endpoints and schemas.

## Dependencies & Sequencing
- No external services required; reuse repo tooling patterns. Once merged, proceed with Task #2 to replace stubs with real BBS+ issuance logic.
