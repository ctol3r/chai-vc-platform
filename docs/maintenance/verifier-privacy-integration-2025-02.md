# Verifier ↔ Privacy Service Integration — February 2025

## Intent
Document the changes that route verifier status checks through the privacy service so teams understand the new behaviour, configuration, and fallback paths.

## Summary
- `backend/src/controllers/verifier_controller.ts` now defers proof validation to `privacyClient.verifyProof`. When a proof payload is provided, the controller aggregates the response from the privacy service and returns `{ status, details }` to callers.
- Two HTTP endpoints exist: `GET /api/verifier/credential/:credentialId/status` (legacy fallback using blockchain stub) and `POST /api/verifier/credential/:credentialId/status` (new path accepting `{ credential, proof }`).
- `backend/src/lib/privacyClient.ts` handles HTTP communication with the privacy service (`PRIVACY_SERVICE_URL`, default `http://localhost:5050`) with a 2s timeout and error propagation.

## Testing
- Unit tests mock both the blockchain stub and privacy client to cover fallback, success, invalid proof, and timeout scenarios (`backend/__tests__/verifier_endpoint.test.ts`).
- Run locally:
  ```bash
  cd backend
  npm install
  npm run build
  npm test -- --runInBand -i --testPathPattern=verifier
  ```
- For end-to-end verification, start the privacy service (`cd apps/privacy-service && npm start`) before hitting the backend POST endpoint.

## Configuration
- `PRIVACY_SERVICE_URL` (default `http://localhost:5050`) — overrides target host.
- `PRIVACY_SERVICE_TIMEOUT_MS` (future enhancement) can be wired into the client if needed; currently fixed at 2000ms.

## Fallback Behaviour
- When the privacy service call fails (timeout, network error, non-2xx response), the verifier returns `{ status: 'unknown', details: { error: ... } }` without throwing, preserving backward compatibility.
- Legacy GET endpoint still uses blockchain stub via `checkCredentialStatus` until Task 7 introduces on-chain status storage.

## Follow-ups
- Replace the deterministic privacy shim with real BBS+ verification once crypto dependencies are available.
- Surface metrics/logging for privacy service latency and failures (Task 28).
- Wire the verifier POST endpoint into the OID4VP presentation handler after Task 6.
