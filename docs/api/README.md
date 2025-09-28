generated-by: Codex 2025-09-26T00:00:00Z
# REST API — MVP Lock Examples

These examples target the local development server (`npm run dev` in `backend/`). The server listens on `http://localhost:4000` and the MVP verification routes assume the privacy adapter runs in dev mode:

```bash
export PRIVACY_CLIENT_MODE=dev
cd backend
npm run dev
```

> Tip: Install `jq` for pretty-printing responses (`brew install jq` on macOS).

## Verifier Status — `GET /api/verifier/credential/:id/status`

```bash
curl -s http://localhost:4000/api/verifier/credential/seed-1/status | jq
```
```json
{
  "credentialId": "seed-1",
  "status": "valid"
}
```

Status keywords in the credential ID influence the stubbed blockchain check:

```bash
curl -s http://localhost:4000/api/verifier/credential/credential-revoked/status | jq
```
```json
{
  "credentialId": "credential-revoked",
  "status": "revoked"
}
```

## Verifier OID4VP Stub — `POST /api/verifier/presentation`

```bash
curl -s -X POST http://localhost:4000/api/verifier/presentation \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "cred_test_123",
    "vpToken": "sample-vp-token",
    "nonce": "nonce-1234567890abcd",
    "audience": "portal.chai-vc"
  }' | jq
```
```json
{
  "credentialId": "cred_test_123",
  "status": "valid",
  "details": {
    "verified": true,
    "credentialId": "cred_test_123",
    "nonce": "nonce-1234567890abcd",
    "audience": "portal.chai-vc",
    "timestamp": "2025-09-26T00:00:00.000Z"
  }
}
```
> The timestamp reflects the current time; responses are deterministic when `PRIVACY_CLIENT_MODE=dev`.

## Issuer Stub — `POST /api/issuer/credential`

```bash
curl -s -X POST http://localhost:4000/api/issuer/credential \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": "did:example:123",
    "type": "MedicalLicense"
  }' | jq
```
```json
{
  "id": "cred_U2FtcGxlSWQxMjM0",
  "vc": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJkaWQ6ZXhhbXBsZTppc3N1ZXIiLCJzdWIiOiJkaWQ6ZXhhbXBsZToxMjMiLCJ2YyI6eyJA...snip..."
}
```
> The returned VC is a mock JWT. IDs are derived from your input plus the current timestamp, so expect unique values. Capture the `id` if you want to revoke or query status later.

## Credential Status Registry — `GET /api/status/:id`

A known seeded identifier is `cred_test_123`.

```bash
curl -s http://localhost:4000/api/status/cred_test_123 | jq
```
```json
{
  "credentialId": "cred_test_123",
  "status": "active",
  "issuedAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2026-01-01T00:00:00Z"
}
```

Expired example:

```bash
curl -s http://localhost:4000/api/status/cred_expired_456 | jq
```
```json
{
  "credentialId": "cred_expired_456",
  "status": "expired",
  "issuedAt": "2022-01-01T00:00:00Z",
  "expiresAt": "2023-01-01T00:00:00Z"
}
```

## Revoke Credential — `POST /api/status/revoke`

```bash
curl -s -X POST http://localhost:4000/api/status/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "cred_test_123",
    "reason": "Admin requested"
  }' | jq
```
```json
{
  "success": true,
  "credentialId": "cred_test_123",
  "revokedAt": "2025-09-26T00:00:00.000Z"
}
```

> The `revokedAt` timestamp reflects when you called the endpoint. Follow-up status checks show the recorded metadata:

```bash
curl -s http://localhost:4000/api/status/cred_test_123 | jq
```
```json
{
  "credentialId": "cred_test_123",
  "status": "revoked",
  "revokedAt": "2025-09-26T00:00:00.000Z",
  "reason": "Admin requested"
}
```

## Metrics Endpoint — `GET /api/metrics`

Prometheus-formatted metrics are exposed under `/api/metrics` and include verification counters and histograms.

```bash
curl -s http://localhost:4000/api/metrics | head -n 10
```
```
# HELP proof_verification_attempts_total Total proof verification attempts
# TYPE proof_verification_attempts_total counter
proof_verification_attempts_total 0
# HELP proof_verification_success_total Total successful proof verifications
# TYPE proof_verification_success_total counter
proof_verification_success_total 0
# HELP proof_verification_duration_seconds Duration of proof verification
# TYPE proof_verification_duration_seconds histogram
...
```

## Service Health — `GET /healthz` and `GET /readyz`

```bash
curl -s http://localhost:4000/healthz | jq
```
```json
{
  "status": "healthy",
  "timestamp": "2025-09-26T00:00:00.000Z",
  "service": "chai-vc-backend"
}
```

```bash
curl -s http://localhost:4000/readyz | jq
```
```json
{
  "status": "ready",
  "timestamp": "2025-09-26T00:00:00.000Z",
  "service": "chai-vc-backend",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "external_apis": "available"
  }
}
```

## Troubleshooting
- `401/403` responses indicate missing authentication (future hardening; MVP routes are open locally).
- `429` indicates local rate limiting during smoke tests—wait and retry.
- Presentation requests require a 16+ character nonce containing only printable characters and an audience string containing `chai-vc`.
