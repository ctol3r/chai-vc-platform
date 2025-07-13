# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Blockchain Integration

The `backend/src/blockchain` directory includes a stub implementation of an
on-chain proof verification flow. The new `verifySelectiveProofRuntime` method
loads a Snark verifier WebAssembly module and executes its exported
`verify_selective_proof` function.
