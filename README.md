# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## GDPR/CCPA Right-to-Erasure

The backend includes a stubbed workflow for processing data erasure requests.
Sensitive user data is hashed and the resulting digest is stored on-chain using
`PolkadotService` for auditability.
