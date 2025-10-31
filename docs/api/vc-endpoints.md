# VC & Selective Disclosure API Reference

## Overview

The VC API provides endpoints for issuing, verifying, and managing Verifiable Credentials (VCs) with Selective Disclosure JWT (SD-JWT) support.

## Base URL

```
http://localhost:3000/api/vc
```

## Authentication

Currently uses session-based auth (user object in request). Production should implement proper JWT/OAuth2 authentication.

## Endpoints

### Issue SD-JWT

Create a new SD-JWT with selective disclosure capabilities.

**Endpoint:** `POST /api/vc/sd-issue`

**Request Body:**
```json
{
  "template": "medical-license",
  "claims": [
    {
      "key": "name",
      "value": "Dr. Jane Smith",
      "selectable": true
    },
    {
      "key": "npi",
      "value": "1234567893",
      "selectable": true
    },
    {
      "key": "license_state",
      "value": "California",
      "selectable": false
    }
  ],
  "issuer": "https://vitalcv.com",
  "subject": "jane.smith@example.com"
}
```

**Response:** `200 OK`
```json
{
  "ok": true,
  "issuanceId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...~WyJzYWx0IiwibmFtZSIsIkRyLiBKYW5lIFNtaXRoIl0~...",
  "preview": {
    "iss": "https://vitalcv.com",
    "sub": "jane.smith@example.com",
    "iat": 1234567890,
    "exp": 1266103890,
    "license_state": "California",
    "_selectiveDisclosure": [
      { "key": "name", "value": "Dr. Jane Smith" },
      { "key": "npi", "value": "1234567893" }
    ]
  },
  "disclosureCount": 2
}
```

**Errors:**
- `400 Bad Request` - Invalid claims format
- `500 Internal Server Error` - Server error

---

### Verify SD-JWT

Verify an SD-JWT and extract disclosed claims.

**Endpoint:** `POST /api/vc/sd-verify`

**Request Body:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...~disclosure1~disclosure2",
  "requiredClaims": ["name", "license_state"]
}
```

**Response:** `200 OK`
```json
{
  "ok": true,
  "valid": true,
  "claims": {
    "iss": "https://vitalcv.com",
    "sub": "jane.smith@example.com",
    "iat": 1234567890,
    "exp": 1266103890,
    "name": "Dr. Jane Smith",
    "license_state": "California"
  },
  "issuer": "https://vitalcv.com",
  "subject": "jane.smith@example.com"
}
```

**Errors:**
- `400 Bad Request` - Invalid token or missing required claims
  ```json
  {
    "ok": false,
    "valid": false,
    "errors": [
      "Required claim not disclosed: npi",
      "Invalid disclosure for claim: specialty"
    ]
  }
  ```
- `500 Internal Server Error` - Server error

---

### Select Disclosures

Create a new token with only specific claims disclosed.

**Endpoint:** `POST /api/vc/sd-select`

**Request Body:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...~disclosure1~disclosure2~disclosure3",
  "discloseClaims": ["name", "license_state"]
}
```

**Response:** `200 OK`
```json
{
  "ok": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...~disclosure1~disclosure2",
  "disclosed": ["name", "license_state"]
}
```

**Errors:**
- `400 Bad Request` - Missing token or discloseClaims
- `500 Internal Server Error` - Server error

---

### Get Salts (Admin Only)

Retrieve salt values for a specific issuance.

**Endpoint:** `GET /api/vc/salts/:issuanceId`

**Response:** `200 OK`
```json
{
  "ok": true,
  "issuanceId": "550e8400-e29b-41d4-a716-446655440000",
  "salts": [
    {
      "claim": "name",
      "salt": "xK9pQmN-7vZw3R8tY",
      "hash": "dHJ1c3RfbWVfaW1fYW5fZW5naW5lZXI"
    },
    {
      "claim": "npi",
      "salt": "pL4jK9mR-2sWq7X1Z",
      "hash": "aGVsbG9fd29ybGRfaGVyZQ"
    }
  ]
}
```

**Errors:**
- `404 Not Found` - Issuance not found
- `500 Internal Server Error` - Server error

## Usage Examples

### Full Workflow

#### 1. Issuer Creates SD-JWT
```bash
curl -X POST http://localhost:3000/api/vc/sd-issue \
  -H "Content-Type: application/json" \
  -d '{
    "claims": [
      { "key": "name", "value": "Dr. Jane Smith", "selectable": true },
      { "key": "npi", "value": "1234567893", "selectable": true },
      { "key": "specialty", "value": "Cardiology", "selectable": true },
      { "key": "license_state", "value": "CA", "selectable": false }
    ],
    "issuer": "https://vitalcv.com",
    "subject": "jane@example.com"
  }'
```

#### 2. Holder Selects Claims to Disclose
```bash
curl -X POST http://localhost:3000/api/vc/sd-select \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<full-token-from-step-1>",
    "discloseClaims": ["name", "specialty"]
  }'
```

#### 3. Verifier Checks Token
```bash
curl -X POST http://localhost:3000/api/vc/sd-verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<selected-token-from-step-2>",
    "requiredClaims": ["name"]
  }'
```

## Token Format

SD-JWT tokens use the format:
```
JWT~disclosure1~disclosure2~...~disclosureN
```

- **JWT**: Standard JWT containing non-selectable claims and `_sd` array of hashes
- **Disclosures**: Base64url-encoded `[salt, key, value]` tuples

Example:
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3ZpdGFsY3YuY29tIiwic3ViIjoiamFuZUBleGFtcGxlLmNvbSIsImlhdCI6MTIzNDU2Nzg5MCwiZXhwIjoxMjY2MTAzODkwLCJsaWNlbnNlX3N0YXRlIjoiQ0EiLCJfc2QiOlsiZEhKMWMzUmZiV1ZmYVcxZllXNWZaVzVuYVc1bFpYSSIsImFHVnNiRzlmZDI5eWJHUmZhR1Z5WlEiXSwiX3NkX2FsZyI6InNoYS0yNTYifQ.signature~WyJ4SzlwUW1OLVN2WnczUjh0WSIsIm5hbWUiLCJEci4gSmFuZSBTbWl0aCJd~WyJwTDRqSzltUi0yc1dxN1gxWiIsIm5waSIsIjEyMzQ1Njc4OTMiXQ
```

## Claim Formats

### Selectable Claims
Claims that can be selectively disclosed:
```json
{
  "key": "claim_name",
  "value": "claim_value",
  "selectable": true
}
```

### Always-Visible Claims
Claims always included in JWT:
```json
{
  "key": "license_state",
  "value": "California",
  "selectable": false
}
```

## Security

### Cryptographic Operations
- **Hashing**: SHA-256 for claim hashes
- **Signing**: HMAC-SHA256 (HS256) for JWT signatures
- **Salt Generation**: Cryptographically secure random bytes (16 bytes default)

### Best Practices
1. **Key Management**: Store signing keys securely (environment variables, KMS)
2. **Salt Storage**: Encrypt salts at rest in production
3. **Token Expiration**: Set appropriate expiration times (default: 1 year)
4. **Audit Logging**: All operations are logged with user context
5. **Rate Limiting**: Implement rate limits on verification endpoints

## Audit Events

All operations emit audit events:

```json
// Issuance
{
  "userId": "user-123",
  "event": "vc.sd-jwt.issue",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "issuanceId": "uuid",
    "template": "medical-license",
    "claimCount": 5,
    "selectableCount": 3
  }
}

// Verification
{
  "userId": "verifier-456",
  "event": "vc.sd-jwt.verify",
  "timestamp": "2024-01-01T00:00:01Z",
  "data": {
    "valid": true,
    "claimCount": 3,
    "hasErrors": false
  }
}

// Selection
{
  "userId": "holder-789",
  "event": "vc.sd-jwt.select",
  "timestamp": "2024-01-01T00:00:02Z",
  "data": {
    "disclosedClaims": ["name", "specialty"]
  }
}
```

## Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message here"
}
```

Common status codes:
- `200 OK` - Success
- `400 Bad Request` - Invalid input or verification failure
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

*Not currently implemented in pilot. Production should implement:*
- 100 requests/minute for issuance
- 500 requests/minute for verification
- 1000 requests/minute for selection

## Monitoring

Track these metrics:
- `vc_issue_total` - Total issuances
- `vc_verify_total` - Total verifications
- `vc_verify_failures_total` - Failed verifications
- `vc_disclosure_selections_total` - Selective disclosures created

## Future Enhancements

- [ ] DID-based issuer/subject identifiers
- [ ] BBS+ signature support
- [ ] Credential status list integration
- [ ] Batch issuance
- [ ] Advanced disclosure policies
- [ ] Revocation support

---

**Version**: 0.1.0 (Pilot)  
**Last Updated**: 2024  
**Status**: ✅ Implemented
