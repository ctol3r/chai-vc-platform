# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Staking Contract

Verifiers are required to lock tokens in the `VerifierStaking` smart contract. If a
verifier provides incorrect verification, the contract owner can slash the
verifier's stake. The contract and a simple TypeScript wrapper live under
`backend/contracts` and `backend/src/blockchain`.
