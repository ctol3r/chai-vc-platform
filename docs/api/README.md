generated-by: Claude 2025-09-26T00:00:00Z
# API Quickstart

## Setup
```bash
cd backend && npm run dev
# Backend runs on http://localhost:3000
```

## Credential Issuance
```bash
# Issue new credential
curl -X POST http://localhost:3000/api/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": "did:example:123",
    "credentialType": "MedicalLicense",
    "claims": {
      "licenseNumber": "ML12345",
      "specialty": "Internal Medicine",
      "issueDate": "2024-01-01",
      "expiryDate": "2026-01-01"
    }
  }'

# Expected response:
# {
#   "status": "success",
#   "credentialId": "cred_abc123",
#   "vcJwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ..."
# }
```

## Credential Verification
```bash
# Verify credential
curl -X POST http://localhost:3000/api/credentials/verify \
  -H "Content-Type: application/json" \
  -d '{
    "vcJwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ..."
  }'

# Expected response:
# {
#   "status": "valid",
#   "verified": true,
#   "claims": {
#     "licenseNumber": "ML12345",
#     "specialty": "Internal Medicine"
#   },
#   "confidence": 0.98
# }
```

## Status Check
```bash
# Check credential status
curl http://localhost:3000/api/credentials/cred_abc123/status

# Expected response:
# {
#   "credentialId": "cred_abc123",
#   "status": "active",
#   "issuedAt": "2024-01-01T00:00:00Z",
#   "expiresAt": "2026-01-01T00:00:00Z",
#   "revoked": false
# }
```

## Health Check
```bash
# System health
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-01T12:00:00Z",
#   "services": {
#     "database": "connected",
#     "blockchain": "synced"
#   }
# }
```

## GraphQL Endpoint
```bash
# GraphQL query
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ credentials(limit: 10) { id type status } }"
  }'

# Expected response:
# {
#   "data": {
#     "credentials": [
#       {
#         "id": "cred_abc123",
#         "type": "MedicalLicense",
#         "status": "active"
#       }
#     ]
#   }
# }
```

## Error Responses
```bash
# Invalid request
# HTTP 400: {"error": "Invalid credential format", "code": "INVALID_FORMAT"}

# Unauthorized
# HTTP 401: {"error": "Invalid API key", "code": "UNAUTHORIZED"}

# Not found
# HTTP 404: {"error": "Credential not found", "code": "NOT_FOUND"}

# Server error
# HTTP 500: {"error": "Internal server error", "code": "INTERNAL_ERROR"}
```