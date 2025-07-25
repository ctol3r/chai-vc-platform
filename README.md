# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Blockchain Integration

This repository includes a simple `PolkadotService` that wraps
`@polkadot/api` for interacting with a Substrate-based chain. It now
supports batching credential issuance using `utility.batch` so that
multiple credentials can be issued in a single extrinsic.
