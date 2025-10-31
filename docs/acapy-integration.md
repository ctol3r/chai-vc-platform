# ACA-Py Integration Guide

## Overview

This implementation provides integration with Aries Cloud Agent - Python (ACA-Py) for issuing Verifiable Credentials (VCs) using the Hyperledger Aries protocol.

## Architecture

### Components

1. **ACA-Py Client** (`backend/src/lib/acapy.ts`)
   - Secure HTTP client with TLS support
   - API key authentication
   - Connection and credential management

2. **Issuer Routes** (`backend/src/routes/issuer.ts`)
   - `/api/issuer/attest-request` - Request credential issuance
   - `/api/issuer/attest-status/:id` - Check issuance status
   - `/api/issuer/webhook/credential` - Receive ACA-Py events
   - `/api/issuer/status` - Get agent status
   - `/api/issuer/credential-definitions` - List credential definitions
   - `/api/issuer/connection/create` - Create connection invitations

3. **Worker Queue** (Bull)
   - Async credential issuance processing
   - Retry logic with exponential backoff
   - Job status tracking

4. **Stub Implementation** (`ACAPayStub`)
   - Local development without ACA-Py
   - Mock credential issuance
   - Test automation

## Configuration

### Environment Variables

```bash
# ACA-Py Connection
ACAPY_URL=https://acapy.vitalcv.com
ACAPY_API_KEY=your-api-key-here
ACAPY_USE_TLS=true
ACAPY_REJECT_UNAUTHORIZED=true

# Development Stub (set to true for local dev)
ACAPY_STUB=false

# Redis (for job queue)
REDIS_URL=redis://localhost:6379
```

### TLS Configuration

For production deployments with TLS:

```typescript
const client = new ACAPayClient({
  baseUrl: 'https://acapy.vitalcv.com',
  apiKey: 'your-api-key',
  useTLS: true,
  rejectUnauthorized: true, // Validate certificates
});
```

## Usage

### Issuing a Credential

#### 1. Create Connection Invitation

```bash
curl -X POST http://localhost:3000/api/issuer/connection/create \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "Dr. Jane Smith Wallet"
  }'
```

**Response:**
```json
{
  "ok": true,
  "invitation": {
    "connection_id": "abc123",
    "invitation": {
      "@type": "https://didcomm.org/connections/1.0/invitation",
      "label": "VitalCV Issuer"
    },
    "invitation_url": "https://acapy.vitalcv.com?c_i=..."
  }
}
```

#### 2. Request Credential Issuance

```bash
curl -X POST http://localhost:3000/api/issuer/attest-request \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "claim-123",
    "issuerId": "issuer-456",
    "connectionId": "abc123",
    "credDefId": "WgWxqztrNooG92RXvxSTWv:3:CL:20:tag",
    "template": "medical-license",
    "attributes": [
      { "name": "name", "value": "Dr. Jane Smith" },
      { "name": "npi", "value": "1234567893" },
      { "name": "license_number", "value": "CA-MD-12345" },
      { "name": "license_state", "value": "California" }
    ]
  }'
```

**Response:**
```json
{
  "ok": true,
  "requestId": "req-uuid-here",
  "status": "pending",
  "message": "Credential issuance queued"
}
```

#### 3. Check Issuance Status

```bash
curl http://localhost:3000/api/issuer/attest-status/req-uuid-here
```

**Response:**
```json
{
  "ok": true,
  "request": {
    "requestId": "req-uuid-here",
    "claimId": "claim-123",
    "issuerId": "issuer-456",
    "status": "issued",
    "credentialExchangeId": "cred-ex-789",
    "state": "credential-issued",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Webhook Integration

ACA-Py sends webhook events for credential state changes:

```javascript
// Webhook payload example
{
  "state": "credential-acked",
  "cred_ex_id": "cred-ex-789",
  "connection_id": "abc123",
  "thread_id": "thread-123",
  "credential_definition_id": "WgWxqztrNooG92RXvxSTWv:3:CL:20:tag"
}
```

**States:**
- `proposal-sent` - Credential proposal sent
- `offer-sent` - Credential offer sent
- `request-received` - Credential request received
- `credential-issued` - Credential issued
- `credential-acked` - Credential acknowledged by holder
- `done` - Credential exchange complete
- `abandoned` - Credential exchange abandoned

## Worker Queue

Credential issuance is processed asynchronously via Bull queue:

```typescript
// Job data
{
  requestId: 'req-uuid',
  connectionId: 'abc123',
  credDefId: 'WgWxqztrNooG92RXvxSTWv:3:CL:20:tag',
  attributes: [
    { name: 'name', value: 'Dr. Jane Smith' }
  ],
  issuerId: 'issuer-456'
}

// Queue options
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
}
```

### Monitoring Queue

```bash
# Check queue stats
const stats = await credentialQueue.getJobCounts();
console.log(stats); // { waiting: 5, active: 2, completed: 100, failed: 3 }

# List failed jobs
const failed = await credentialQueue.getFailed();
```

## Development with Stub

For local development without ACA-Py:

```bash
# Enable stub mode
export ACAPY_STUB=true

# Start backend
npm run dev
```

The stub provides:
- Instant credential issuance
- State transitions after 2-second delay
- Deterministic connection IDs
- Mock credential definitions

## Security

### API Key Authentication

```typescript
// Client includes API key in headers
headers: {
  'X-API-Key': process.env.ACAPY_API_KEY
}
```

### TLS Certificate Validation

```typescript
// Reject self-signed certificates in production
const client = new ACAPayClient({
  baseUrl: 'https://acapy.vitalcv.com',
  useTLS: true,
  rejectUnauthorized: true
});
```

### Webhook Verification

*Future enhancement: Verify webhook signatures*

```typescript
// TODO: Add HMAC signature verification
const signature = req.headers['x-acapy-signature'];
const isValid = verifyHMAC(req.body, signature, secret);
```

## Audit Events

All operations emit audit events:

```javascript
// Issuance requested
{
  event: 'credential.attest_requested',
  user: 'issuer-id',
  data: {
    requestId: 'req-uuid',
    claimId: 'claim-123',
    template: 'medical-license'
  }
}

// Credential issued
{
  event: 'credential.issued',
  user: 'issuer-id',
  data: {
    requestId: 'req-uuid',
    credentialExchangeId: 'cred-ex-789',
    credDefId: 'WgWxqztrNooG92RXvxSTWv:3:CL:20:tag'
  }
}

// Issuance failed
{
  event: 'credential.issuance_failed',
  user: 'issuer-id',
  data: {
    requestId: 'req-uuid',
    error: 'Connection not ready'
  }
}

// Connection created
{
  event: 'connection.created',
  user: 'system',
  data: {
    connectionId: 'abc123',
    alias: 'Dr. Jane Smith Wallet'
  }
}
```

## Testing

### Unit Tests

```bash
cd backend
npm test -- acapy.test.ts
```

Test coverage:
- ✅ Agent status retrieval
- ✅ Credential issuance
- ✅ State transitions
- ✅ Credential exchange retrieval
- ✅ Connection invitation creation
- ✅ Credential definition listing
- ✅ End-to-end issuance workflow

### Integration Tests

```bash
# With real ACA-Py instance
export ACAPY_URL=http://localhost:8031
export ACAPY_API_KEY=test-key
npm test -- acapy.integration.test.ts
```

## Troubleshooting

### Connection Errors

**Problem:** `ACA-Py connection error: ECONNREFUSED`

**Solution:**
- Verify ACA-Py is running: `curl http://localhost:8031/status`
- Check `ACAPY_URL` environment variable
- Ensure network connectivity

### Authentication Errors

**Problem:** `ACA-Py request failed: 401`

**Solution:**
- Verify `ACAPY_API_KEY` is correct
- Check ACA-Py admin API configuration
- Ensure API key middleware is enabled

### TLS Errors

**Problem:** `unable to verify the first certificate`

**Solution:**
```bash
# Development only - disable certificate validation
export ACAPY_REJECT_UNAUTHORIZED=false

# Production - add CA certificate
export NODE_EXTRA_CA_CERTS=/path/to/ca-cert.pem
```

### Webhook Not Received

**Problem:** Credential state not updating

**Solution:**
- Verify ACA-Py webhook URL configuration
- Check firewall/network rules
- Ensure webhook endpoint is publicly accessible
- Review ACA-Py logs for webhook delivery failures

## Production Checklist

- [ ] Configure ACA-Py with proper DID and keys
- [ ] Set up TLS with valid certificates
- [ ] Rotate API keys regularly
- [ ] Monitor queue depth and failed jobs
- [ ] Set up webhook signature verification
- [ ] Configure credential schemas and definitions
- [ ] Implement connection state monitoring
- [ ] Add alerting for failed issuances
- [ ] Document credential revocation process
- [ ] Set up ACA-Py high availability

## References

- [ACA-Py Documentation](https://github.com/hyperledger/aries-cloudagent-python)
- [Aries RFC 0036: Issue Credential Protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0036-issue-credential)
- [Hyperledger Aries](https://www.hyperledger.org/use/aries)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)

---

**Status**: ✅ Implemented  
**Version**: 0.1.0 (Pilot)  
**Last Updated**: 2024
