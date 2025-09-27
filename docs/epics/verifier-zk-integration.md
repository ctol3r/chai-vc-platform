# ICARUS+D — Verifier API Extension with ZK Proof Support (Task 4)

## Intent
Update the backend verifier controller and routes so they can validate proofs using the privacy service instead of the local blockchain stubs, paving the way for ZK-supported verification flows.

## Context
- Privacy service now exposes `/verify` with deterministic BBS+ logic.
- Current backend verifier controller only invokes a blockchain stub returning static statuses.
- Future tasks (OID4VP verifier endpoint, status/revocation storage) depend on this integration pattern.

## Assumptions
- Backend remains Express-based with Jest tests; network requests to the privacy service simulated using fetch/axios mocks.
- For this MVP, assume `PRIVACY_SERVICE_URL` environment variable (default `http://localhost:5050`).
- Verification endpoint should gracefully handle timeouts/connection errors and surface meaningful responses for on-call debugging.

## Risks & Mitigations
- **Network flakiness**: backend may block waiting on privacy service → add short timeout wrapper and return `status: 'unknown'` or fallback stub when service unavailable.
- **Security**: ensure proof payloads are not logged verbatim; redact or summarise sensitive fields.
- **Test brittleness**: integration tests might need the privacy service running; use mocks in unit tests and guard optional end-to-end tests behind environment flag.

## UX / DevX Notes
- Create `src/lib/privacyClient.ts` with reusable `verifyProof` call.
- Extend verifier route to accept both legacy `credentialId` lookups and new proof payload (`proof`, `credential`).
- Document environment variable and fallback behaviour in a maintenance note.

## Acceptance Tests
1. New unit tests: controller returns `valid` when privacy client resolves true and handles rejection/timeouts.
2. Updated integration test ensures posting proof to backend yields expected aggregated response.
3. `npm run build` and `npm test` succeed.
4. Optional manual smoke: run privacy service, call backend verify endpoint with sample proof and observe valid response.

## Deliverables
- `backend/src/lib/privacyClient.ts` (new HTTP client with timeout & error handling).
- Updated `backend/src/controllers/verifier_controller.ts` and routes.
- Additional tests in `backend/__tests__/verifier_endpoint.test.ts` (and helper mocks if needed).
- Maintenance note capturing configuration and troubleshooting guidance.
