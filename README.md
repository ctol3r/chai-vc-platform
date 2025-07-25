# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Ethereum Bridge

Smart contracts on Ethereum can validate hashed CHAI credentials using the
`ChaiCredentialBridge` contract found in the `contracts/` directory. An off-chain
or cross-chain process is expected to call `setCredentialValid` when a CHAI
credential has been confirmed on the source chain. Other contracts may query the
`validate` function to check if a given credential hash is recognised by the
bridge.
