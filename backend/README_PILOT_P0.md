# VitalCV Pilot P0 API

## Overview
This is the Pilot P0 REST backend for VitalCV that implements the core credential lifecycle:
**ISSUE → VERIFY (green) → REVOKE → VERIFY (red)** in <10s end-to-end.

## Features
- ✅ Issue verifiable credentials as JWTs
- ✅ Verify credential presentations
- ✅ Revoke credentials
- ✅ NPI lookup with caching
- ✅ FHIR Practitioner resource generation
- ✅ Non-blocking blockchain anchoring (fire-and-forget)
- ✅ HIPAA-aware audit logging
- ✅ In-memory store (replaceable by DB later)

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
# Server runs on http://localhost:4000
```

### Run Tests
```bash
# Unit tests
npm test

# Curl-based integration test
npm run test:pilot
# or
./scripts/test-pilot-flow.sh
```

### Build for Production
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```bash
GET /health
Response: { "ok": true, "service": "backend" }
```

### Issue Credential
```bash
POST /issuer/credential
Body: {
  "subject": {
    "id": "practitioner-123",
    "name": "Dr. Jane Smith",
    "licenseNumber": "MED123456",
    "licenseState": "CA"
  },
  "validity": {
    "from": "2024-01-01T00:00:00Z",
    "until": "2025-01-01T00:00:00Z"
  }
}
Response: {
  "credentialId": "cred-xxxxxxxxxxxx",
  "jwt": "eyJhbGc...",
  "auditRef": "issue-timestamp-hash"
}
```

### Verify Presentation
```bash
POST /verifier/presentation
Body: {
  "jwt": "eyJhbGc..."
}
Response: {
  "valid": true/false,
  "reason": "revoked" | "expired" | undefined,
  "auditRef": "verify-timestamp-hash",
  "credentialId": "cred-xxxxxxxxxxxx"
}
```

### Revoke Credential
```bash
POST /issuer/revoke
Body: {
  "credentialId": "cred-xxxxxxxxxxxx"
}
Response: {
  "ok": true,
  "credentialId": "cred-xxxxxxxxxxxx",
  "auditRef": "revoke-timestamp-hash"
}
```

### NPI Lookup
```bash
POST /lookup/npi/:npi
# or
GET /lookup/npi/:npi

# Example: /lookup/npi/1234567890
Response: {
  // NPPES data or
  "timeout": true  // if lookup exceeds 5s
}
```

### FHIR Practitioner
```bash
GET /fhir/Practitioner/:id
Response: {
  "resourceType": "Practitioner",
  "id": "practitioner-123",
  "active": true,
  "qualification": [...]
}
```

## Architecture

### Core Services
- **store.ts**: Singleton in-memory credential store
- **jwt.ts**: JWT creation and verification (HS256 for pilot)
- **audit.ts**: HIPAA-compliant audit logging
- **polkadot_service.ts**: Non-blocking chain anchoring

### Key Design Decisions
1. **In-memory store**: Fast for pilot, easily replaceable with DB
2. **Fire-and-forget anchoring**: Never blocks API responses
3. **Explicit JSON responses**: Always include `{valid, reason?, auditRef}`
4. **HIPAA compliance**: No PII in logs, only IDs and statuses

## Environment Variables
- `PORT`: Server port (default: 4000)
- `JWT_SECRET`: Secret for JWT signing (default: pilot secret)

## Testing
The test suite validates the complete flow:
1. Issue credential → Verify (should be valid)
2. Revoke credential → Verify (should be invalid)
3. Error cases (missing JWT, invalid format)
4. FHIR endpoint functionality
5. NPI validation

Run tests with:
```bash
npm test
```

## Curl Examples

### Complete Flow Test
```bash
# 1. Issue credential
RESPONSE=$(curl -s -X POST http://localhost:4000/issuer/credential \
  -H "Content-Type: application/json" \
  -d '{"subject": {"id": "doc-001", "name": "Dr. Test"}}')

JWT=$(echo $RESPONSE | jq -r .jwt)
CRED_ID=$(echo $RESPONSE | jq -r .credentialId)

# 2. Verify (should be valid)
curl -X POST http://localhost:4000/verifier/presentation \
  -H "Content-Type: application/json" \
  -d "{\"jwt\": \"$JWT\"}"

# 3. Revoke
curl -X POST http://localhost:4000/issuer/revoke \
  -H "Content-Type: application/json" \
  -d "{\"credentialId\": \"$CRED_ID\"}"

# 4. Verify again (should be revoked)
curl -X POST http://localhost:4000/verifier/presentation \
  -H "Content-Type: application/json" \
  -d "{\"jwt\": \"$JWT\"}"
```

## Phase 2 TODOs
- [ ] OIDC4VCI/VP implementation
- [ ] Status List 2021 support
- [ ] Database persistence (PostgreSQL/Prisma)
- [ ] ACA-Py integration path
- [ ] Real cryptographic signatures (RS256/ES256)
- [ ] Production Polkadot/Substrate integration

## Performance
- Issue → Verify → Revoke → Verify: **< 1 second**
- NPI lookup: 3-5s timeout with 10-minute cache
- All endpoints return in < 100ms (except NPI on cache miss)

## Security Notes
This is a PILOT implementation with simplified security:
- JWT signing uses HS256 with shared secret
- Signature verification is lenient for testing
- Production will require proper key management
- Chain anchoring is simulated (logs only)

## License
Proprietary - VitalCV Platform