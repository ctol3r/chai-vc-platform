# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## DIDComm v2 Envelope Support

The backend now includes helper functions for creating and
processing DIDComm v2 envelopes using [Aries‑Framework‑JS](https://github.com/hyperledger/aries-framework-javascript).
The implementation lives in `backend/src/didcomm/didcomm_v2_envelope.ts` and
exposes two functions:

- `packDidCommV2Message` – packs a plaintext message into a DIDComm v2 JWE envelope.
- `unpackDidCommV2Message` – decrypts an envelope back to the plaintext payload.

These helpers spin up a lightweight Aries agent internally so they can be used
without a running agent instance.
