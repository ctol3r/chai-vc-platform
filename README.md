# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Realtime Status Sync

The backend now includes a simple cross-chain event listener. It uses a
`CrossChainEventListener` class to subscribe to events on supported networks
(starting with Polkadot) and emits `statusChanged` notifications whenever a
credential's blockchain status updates.
