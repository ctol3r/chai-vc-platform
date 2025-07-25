# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Blockchain upgrade paths

The backend now exposes helper utilities to create chain-agnostic upgrade paths.
These allow the platform to bridge existing credentials to smart contracts on
both EVM and WASM based chains. See `backend/src/blockchain/upgrade_paths.ts`
for the implementation.
