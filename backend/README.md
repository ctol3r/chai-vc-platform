# VitalCV Backend - Pilot P0

Minimal REST backend for credential issuance, verification, and revocation.

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Start server
npm start

# Run tests
npm test

# Run smoke test (server must be running)
npm run test:smoke
```

## Environment Variables

```bash
PORT=4000                    # Server port (default: 4000)
JWT_SECRET=your-secret       # JWT signing secret (default: pilot-p0-secret)
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Issue Credential
```bash
POST /issuer/credential
Content-Type: application/json

{
  "subject": {
    "id": "practitioner-123",
    "name": "Dr. Jane Smith",
    "licenseNumber": "MD12345",
    "licenseState": "CA"
  },
  "validity": {
    "from": "2025-01-01T00:00:00Z",
    "until": "2026-01-01T00:00:00Z"
  }
}
```

### Verify Credential
```bash
POST /verifier/presentation
Content-Type: application/json

{
  "jwt": "eyJhbGc..."
}
```

### Revoke Credential
```bash
POST /issuer/revoke
Content-Type: application/json

{
  "credentialId": "cred-abc123"
}
```

### NPI Lookup
```bash
POST /lookup/npi/:npi
```

### FHIR Practitioner
```bash
GET /fhir/Practitioner/:id
```

## Architecture

### Services
- `services/store.ts` - In-memory credential store (singleton)
- `services/jwt.ts` - JWT decode/verify/create helpers
- `services/polkadot_service.ts` - Non-blocking chain anchoring
- `services/audit.ts` - Audit trail with hash anchoring

### Routes
- `routes/issuer_routes.ts` - Credential issuance and revocation
- `routes/verifier_routes.ts` - Credential verification
- `routes/npi_routes.ts` - NPPES registry lookup
- `routes/fhir_routes.ts` - FHIR R4 Practitioner resources

## Testing

### Unit Tests
```bash
npm test
```

### Smoke Test (curl)
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run smoke test
npm run test:smoke
```

## Pilot P0 Acceptance Criteria

✅ Issue → Verify (green) → Revoke → Verify (red) in <10s  
✅ JSON responses with {valid, reason?, auditRef}  
✅ In-memory store (DB-ready architecture)  
✅ Non-blocking chain anchoring  
✅ HIPAA-aware logging (no PII)  
✅ Unit tests with supertest  

## Next Phase TODOs

- [ ] OIDC4VCI/VP implementation
- [ ] W3C Status List 2021
- [ ] Database persistence (Prisma)
- [ ] ACA-Py integration path
- [ ] Production-grade cryptographic signing
- [ ] Rate limiting and API keys
- [ ] WebAuthn/FIDO2 support
- [ ] GraphQL endpoints (optional)

## License

ISC
