# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Crypto Layer

The `backend/src/crypto` folder defines a pluggable interface for post-quantum (PQ) signature schemes. New algorithms can be added by implementing the `PQScheme` interface and swapping it in via `setScheme` from `crypto_manager`.

A basic `DefaultScheme` based on ECDSA is provided along with a stub `DilithiumScheme` implementation.
