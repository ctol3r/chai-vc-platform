# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## SMART Health Card API

The backend exposes two endpoints implemented with Express:

- `POST /smart/issue` – accepts a FHIR bundle payload and returns a signed SMART Health Card (SHC) token.
- `POST /smart/verify` – accepts a `card` token and verifies its signature.

These endpoints use JSON Web Tokens (HS256) for signing and verification. Set the `SHC_SECRET` environment variable to change the signing key.
