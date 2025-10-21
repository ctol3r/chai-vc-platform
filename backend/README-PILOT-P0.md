# VitalCV Pilot P0 API

A minimal, reliable REST backend that completes the loop: **ISSUE → VERIFY (green) → REVOKE → VERIFY (red)** in <10s end-to-end.

## Features

- ✅ **Credential Issuance**: Issue verifiable credentials as JWTs
- ✅ **Credential Verification**: Verify credential presentations
- ✅ **Credential Revocation**: Revoke credentials with status tracking
- ✅ **NPI Lookup**: Integration with NPPES v2.1 API with caching
- ✅ **FHIR Practitioner**: Generate FHIR R4 Practitioner resources
- ✅ **Audit Logging**: Complete audit trail with hash anchoring
- ✅ **Non-blocking Anchoring**: Fire-and-forget blockchain anchoring
- ✅ **HIPAA-aware**: No PII logging, minimal data retention

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd backend
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

### Smoke Test

```bash
# Start server in one terminal
npm run dev

# Run smoke test in another terminal
./scripts/test-pilot-flow.sh
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Issuer Routes
- `POST /issuer/credential` - Issue a new credential
- `POST /issuer/revoke` - Revoke a credential

### Verifier Routes
- `POST /verifier/presentation` - Verify a credential presentation

### NPI Lookup
- `POST /lookup/npi/:npi` - Lookup NPI information
- `GET /lookup/npi/:npi` - Alternative GET endpoint

### FHIR Practitioner
- `GET /fhir/Practitioner/:id` - Get FHIR R4 Practitioner resource

## API Examples

### Issue Credential

```bash
curl -X POST http://localhost:4000/issuer/credential \
  -H "Content-Type: application/json" \
  -d '{
    "subject": {
      "id": "practitioner-123",
      "name": "Dr. Jane Smith",
      "licenseNumber": "MD123456",
      "licenseState": "CA"
    },
    "validity": {
      "from": "2024-01-01T00:00:00Z",
      "until": "2025-01-01T00:00:00Z"
    }
  }'
```

### Verify Credential

```bash
curl -X POST http://localhost:4000/verifier/presentation \
  -H "Content-Type: application/json" \
  -d '{
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Revoke Credential

```bash
curl -X POST http://localhost:4000/issuer/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "cred-abc123"
  }'
```

## Architecture

### Services

- **Store Service**: In-memory credential storage (singleton)
- **JWT Service**: JWT creation, verification, and decoding
- **Polkadot Service**: Non-blocking hash anchoring
- **Audit Service**: Audit logging with hash anchoring

### Data Flow

1. **Issue**: Create JWT → Store credential → Anchor hash (async)
2. **Verify**: Decode JWT → Check signature → Check status → Log audit
3. **Revoke**: Update status → Log audit → Anchor hash (async)

### Security

- JWT-based credentials with HS256 signing
- No PII in logs (HIPAA-compliant)
- Fire-and-forget blockchain anchoring
- Input validation on all endpoints

## Environment Variables

- `PORT`: Server port (default: 4000)
- `JWT_SECRET`: JWT signing secret (default: pilot-development-secret-key)
- `NODE_ENV`: Environment (test/development/production)

## Testing

The API includes comprehensive unit tests covering:

- Credential issuance and validation
- JWT verification and decoding
- Revocation flow
- Error handling
- Complete issue → verify → revoke → verify cycle

Run tests with:
```bash
npm test
```

## Phase 2 Roadmap

- [ ] OIDC4VCI/VP support
- [ ] Status List 2021 implementation
- [ ] Database persistence (replace in-memory store)
- [ ] ACA-Py integration
- [ ] Real cryptographic signatures
- [ ] Production Polkadot anchoring

## License

ISC