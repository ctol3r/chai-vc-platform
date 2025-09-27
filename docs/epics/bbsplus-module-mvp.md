# ICARUS+D — BBS+ Issuance & Verification Module (Task 2)

## Intent
Upgrade the privacy service with a dedicated BBS+ library that supports issuance, verification, and selective disclosure flows so downstream services can exercise credential proofs before the real cryptographic backend arrives.

## Context
- Task 1 delivered the privacy service scaffold with deterministic stubs.
- Verifier, issuer, and upcoming ZK tasks require consistent APIs for BBS+ operations.
- SAFE profile blocks fetching native crypto libs, so we must implement a deterministic, easily swappable shim with equivalent interfaces.

## Assumptions
- Node 18+ runtime; TypeScript implementation using the built-in `crypto` module.
- Deterministic hashing stands in for real BBS+ signatures; selective disclosure reduces to hashing subsets of claims.
- Service will expose the same `/prove` and `/verify` endpoints but now call into `lib/bbsplus.ts`.

## Risks & Mitigations
- **Interface mismatch**: Future drop-in cryptographic library might need different call signatures → design the shim with interfaces (`BbsIssuer`, `BbsVerifier`) and keep payload shapes close to BBS+ specs (messages array, nonce, revealed indices).
- **False sense of security**: Deterministic hash is not real crypto → document clearly in the README and module headers that this is a stub, and add TODOs for replacing with actual BBS+ once dependencies are available.
- **Selective disclosure bugs**: Without thorough tests, the module may mishandle reveal lists → add unit tests for full disclosure, selective subset, and tampering scenarios.

## UX / DevX Notes
- Expose `issueCredential`, `verifyCredential`, `createDisclosureProof`, and `verifyDisclosureProof` functions.
- Update `/prove` route to accept `disclosure` array specifying revealed claim keys; respond with `disclosure: 'selective'` when subset.
- `/verify` should return structured details including `revealedClaims` and verification booleans.

## Acceptance Tests
1. `npm run build` in `apps/privacy-service` succeeds.
2. `npm test` covers:
   - Issuance + verification of full claim set.
   - Selective disclosure proof revealing subset of claims and passing verification.
   - Bad signature / tampered claim fails verification.
3. `curl /prove` and `/verify` still follow the contract with updated fields (reveal metadata).

## Deliverables
- `apps/privacy-service/src/lib/bbsplus.ts` implementing the deterministic shim.
- Updated `prover.ts` and `verifier.ts` to use the module.
- New/updated tests under `apps/privacy-service/tests/bbsplus.test.ts` and adjustments to route tests for selective disclosure handling.
- README note explaining BBS+ stub behaviour and TODO for real crypto.
