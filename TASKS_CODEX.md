# TASKS_CODEX.md — Code & Infra (suggested PR-sized tasks)

High level: Codex should consume these tasks in priority order, creating small PRs that include tests and run `npm run build && npm test`.

P0 (CI / test blockers)
1. Fix import/export shape problems for blockchain_integration usage (defensive wrapper).
2. Fix TypeScript errors in evm_erc721_wrapper (ethers v6 types vs v5 usage).
3. Fix polkadot_service typings/signAndSend results handling.
4. Add seeding encryption fields (payloadEnc, iv, alg, hash) in prisma/seed.ts to satisfy createMany.
5. Normalize jest config duplicates; add CI friendly config.
6. Add tests/mocks for blockchain_integration to ensure tests don't import real chain code.

P1 (core backend features)
7. Implement robust checkCredentialStatus mock & defensive wrapper (already added).
8. Convert Ethers usage to v6-compatible types or add thin adapter module (evm_adapter.ts).
9. Add a testing shim that replaces chain calls with deterministic mocks for local CI.
10. Add test to verify verifier endpoint (existing failing test).

... (continue until ~50 code tasks)
# (For brevity here, codex should break these into 3-5 file PRs each)
