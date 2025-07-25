# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## SDKs

SDKs are provided for integrating with external blockchains.

- `sdks/solana-sdk` &ndash; helper functions for Solana based projects.
- `sdks/avalanche-sdk` &ndash; helper functions for Avalanche projects.

These packages expose a `validate<Chain>Credential(apiUrl, payload)` function
that posts credential data to the CHAI validation API.
