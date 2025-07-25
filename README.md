# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Security

Issuer keys **must** be stored on hardware-backed devices such as YubiKey or
Ledger. The backend exposes helper functions in
`backend/src/blockchain/blockchain_integration.ts` that require a hardware
wallet to be initialized before any signing operations can occur.
