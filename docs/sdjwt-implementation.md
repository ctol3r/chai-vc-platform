# SD-JWT Implementation Guide

## Overview

This implementation provides Selective Disclosure JWT (SD-JWT) functionality for VitalCV, allowing credential holders to selectively disclose specific claims to verifiers while maintaining cryptographic integrity.

## Architecture

### Components

1. **SD-JWT Library** (`backend/src/lib/sdjwt.ts`)
   - Core utilities for SD-JWT operations
   - Salt generation and claim hashing
   - Disclosure creation and verification

2. **VC Routes** (`backend/src/routes/vc.ts`)
   - `/api/vc/sd-issue` - Issue SD-JWTs
   - `/api/vc/sd-verify` - Verify SD-JWTs
   - `/api/vc/sd-select` - Create selective disclosures
   - `/api/vc/salts/:id` - Retrieve salts (admin only)

3. **Tests** (`backend/__tests__/sdjwt.test.ts`)
   - Comprehensive unit tests
   - End-to-end workflow tests

## How SD-JWT Works

### Issuance Flow

1. **Claims Classification**
   ```json
   {
     "claims": [
       { "key": "name", "value": "Dr. Jane Smith", "selectable": true },
       { "key": "npi", "value": "1234567893", "selectable": true },
       { "key": "license_state", "value": "CA", "selectable": false }
     ]
   }
   ```

2. **Salt Generation**
   - For each selectable claim, generate a cryptographically secure salt
   - Hash the claim with salt: `SHA256([salt, key, value])`

3. **Token Structure**
   ```
   JWT~disclosure1~disclosure2~...
   ```
   - JWT contains non-selectable claims + hashes (_sd array)
   - Disclosures are base64url-encoded `[salt, key, value]` tuples

### Verification Flow

1. **Token Split**
   - Parse JWT and disclosure components

2. **Signature Verification**
   - Verify JWT signature with issuer's public key

3. **Disclosure Verification**
   - For each disclosure, recompute hash
   - Match against hashes in JWT's `_sd` array
   - Extract verified claims

## API Usage

### Issue SD-JWT

**Request:**
```bash
curl -X POST http://localhost:3000/api/vc/sd-issue \
  -H "Content-Type: application/json" \
  -d '{
    "template": "medical-license",
    "claims": [
      { "key": "name", "value": "Dr. Jane Smith", "selectable": true },
      { "key": "npi", "value": "1234567893", "selectable": true },
      { "key": "license_number", "value": "CA-MD-12345", "selectable": true },
      { "key": "license_state", "value": "California", "selectable": false }
    ],
    "issuer": "https://vitalcv.com",
    "subject": "jane.smith@example.com"
  }'
```

**Response:**
```json
{
  "ok": true,
  "issuanceId": "uuid-here",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...~WyJzYWx0IiwibmFtZSIsIkRyLiBKYW5lIFNtaXRoIl0~...",
  "preview": {
    "iss": "https://vitalcv.com",
    "sub": "jane.smith@example.com",
    "license_state": "California",
    "_selectiveDisclosure": [
      { "key": "name", "value": "Dr. Jane Smith" },
      { "key": "npi", "value": "1234567893" },
      { "key": "license_number", "value": "CA-MD-12345" }
    ]
  },
  "disclosureCount": 3
}
```

### Select Disclosures

**Request:**
```bash
curl -X POST http://localhost:3000/api/vc/sd-select \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...~disclosure1~disclosure2~disclosure3",
    "discloseClaims": ["name", "license_state"]
  }'
```

**Response:**
```json
{
  "ok": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...~disclosure1",
  "disclosed": ["name", "license_state"]
}
```

### Verify SD-JWT

**Request:**
```bash
curl -X POST http://localhost:3000/api/vc/sd-verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...~disclosure1",
    "requiredClaims": ["name"]
  }'
```

**Response:**
```json
{
  "ok": true,
  "valid": true,
  "claims": {
    "iss": "https://vitalcv.com",
    "sub": "jane.smith@example.com",
    "name": "Dr. Jane Smith",
    "license_state": "California"
  },
  "issuer": "https://vitalcv.com",
  "subject": "jane.smith@example.com"
}
```

## Use Cases

### 1. Job Application
Applicant discloses only:
- Name
- License state
- Specialty

Keeps private:
- Full license number
- NPI
- Previous employment details

### 2. Hospital Credentialing
Hospital requests:
- Name
- NPI
- License number
- Board certifications

Keeps private:
- Personal contact information
- Salary history
- Publications list

### 3. Insurance Verification
Insurer needs:
- NPI
- License state
- Active status

Keeps private:
- Personal details
- Other credentials

## Security Considerations

### Salt Storage
- Salts stored in-memory for pilot
- **Production**: Store in encrypted database
- Implement retention policy (delete after VC expiration)

### Key Management
- Current: `SIGNING_KEY` from environment variable
- **Production**: Use proper key management service (AWS KMS, HashiCorp Vault)
- Implement key rotation schedule

### Privacy
- Salts contain no PHI
- Disclosure is pseudonymous (verifier sees only disclosed claims)
- Audit all issuance and verification events

## Testing

### Run Tests
```bash
cd backend
npm install  # Install dependencies including jsonwebtoken
npm test -- sdjwt.test.ts
```

### Test Coverage
- ✅ Salt generation
- ✅ Claim hashing
- ✅ Disclosure creation
- ✅ SD-JWT issuance
- ✅ SD-JWT verification
- ✅ Selective disclosure
- ✅ Required claims validation
- ✅ End-to-end workflows

## Audit Events

All SD-JWT operations emit audit events:

```javascript
// Issuance
{
  event: "vc.sd-jwt.issue",
  user: "user-id",
  data: {
    issuanceId: "uuid",
    template: "medical-license",
    claimCount: 5,
    selectableCount: 3
  }
}

// Verification
{
  event: "vc.sd-jwt.verify",
  user: "verifier-id",
  data: {
    valid: true,
    claimCount: 3,
    hasErrors: false
  }
}

// Selection
{
  event: "vc.sd-jwt.select",
  user: "holder-id",
  data: {
    disclosedClaims: ["name", "license_state"]
  }
}
```

## Future Enhancements

### BBS+ Integration
- Feature-flagged BBS+ support for zero-knowledge proofs
- Fallback to SD-JWT when BBS+ unavailable

### Revocation
- Implement status list for credential revocation
- Real-time revocation checks during verification

### Advanced Features
- Batch disclosure creation
- Proof expiration
- Verifier-specific disclosures
- Nested selective disclosure

## Production Checklist

- [ ] Replace in-memory salt storage with encrypted database
- [ ] Implement key rotation for signing keys
- [ ] Add rate limiting to VC endpoints
- [ ] Set up monitoring for verification failures
- [ ] Document key recovery procedures
- [ ] Implement salt cleanup/retention policy
- [ ] Add DID-based issuer/subject identifiers
- [ ] Integrate with Prometheus metrics
- [ ] Add Grafana dashboard for VC operations
- [ ] Conduct security audit of SD-JWT implementation

## References

- [SD-JWT Specification (IETF Draft)](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-selective-disclosure-jwt)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)

## Support

For questions or issues:
- File an issue in the repository
- Contact the VitalCV security team
- Review audit logs for debugging
