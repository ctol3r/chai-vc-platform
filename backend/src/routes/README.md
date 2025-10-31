# Routes

API route handlers for the Chai VC Platform.

## Claim Routes (`claim.ts`)

Pilot implementation of claim submission and verification workflow endpoints.

### Endpoints

#### `POST /api/npi/lookup`

Lookup NPI information from NPPES registry.

**Request:**
```json
{
  "npi": "1234567893"
}
```

**Response:**
```json
{
  "npi": "1234567893",
  "type": "Type 1",
  "name": "Dr. Example Name",
  "taxonomy": ["207Q00000X"],
  "verified": true,
  "provider": { ... }
}
```

**Integration:** Uses existing `nppesService` with caching and DB persistence.

---

#### `POST /api/claim/doc`

Upload claim documents (multipart/form-data).

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `npi`: NPI number (string)
  - Files: One or more document files

**Response:**
```json
{
  "claimId": "uuid",
  "statusId": "uuid"
}
```

**Notes:**
- Files are stored in `/tmp/uploads` (configurable via `UPLOAD_DIR` env var)
- Creates initial status at Level 1 (Uploaded)

---

#### `POST /api/claim/basic`

Kick off verification workflow for a claim.

**Request:**
```json
{
  "claimId": "uuid",
  "npi": "1234567893"
}
```

**Response:**
```json
{
  "statusId": "uuid"
}
```

**Workflow:**
- Level 1: Uploaded (initial)
- Level 2: OCR & liveness queued → OCR passed (after 3s delay in pilot)
- Level 3: Issuer attested (after issuer attestation)

---

#### `GET /api/claim/status`

Get current status of a claim verification.

**Query Parameters:**
- `statusId`: UUID of the status record

**Response:**
```json
{
  "statusId": "uuid",
  "claimId": "uuid",
  "level": 2,
  "message": "OCR passed; awaiting issuer attestation (Level 3)",
  "timestamp": "2025-10-30T23:00:00.000Z"
}
```

**Status Levels:**
- Level 1: Document uploaded
- Level 2: OCR and liveness verification in progress/completed
- Level 3: Issuer attestation complete, VC issued

---

#### `POST /api/issuer/attest-request`

Request issuer attestation for a claim (Level 3).

**Request:**
```json
{
  "claimId": "uuid",
  "issuerId": "issuer-uuid"
}
```

**Response:**
```json
{
  "vc": {
    "id": "vc-uuid",
    "type": "MedicalLicenseVC",
    "claimId": "uuid",
    "issuedBy": "issuer-uuid",
    "issuedAt": "2025-10-30T23:00:00.000Z"
  }
}
```

**Notes:**
- Pilot stub - simulates VC issuance
- In production, integrate with ACA-Py or Aries Cloud Agent
- Updates claim status to Level 3 automatically

---

## Storage (Pilot)

Currently uses in-memory stores:

- `claims`: Record of claim documents and metadata
- `statuses`: Record of claim verification statuses

**TODO for Production:**
- Migrate to Prisma Claim and ClaimStatus models
- Persist files to object storage (S3, etc.)
- Add database indexes for query performance

## Integration Points

- **NPPES Service**: `/api/npi/lookup` uses existing `nppesService`
- **Audit Logging**: All operations are audit-logged
- **NPI Validation**: Uses existing `isValidNPI` utility
- **File Upload**: Uses Multer middleware (configured via `UPLOAD_DIR` env)

## Security Notes

- Add authentication middleware before production deployment
- Validate file types and sizes
- Sanitize file paths
- Rate limit endpoints
- Implement proper authorization checks

## Environment Variables

- `UPLOAD_DIR`: Directory for temporary file uploads (default: `/tmp/uploads`)
