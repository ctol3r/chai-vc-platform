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

## Common Error Responses

### Authentication Errors
```json
// HTTP 401: Missing or invalid API key
{
  "error": "Invalid API key",
  "code": "UNAUTHORIZED",
  "message": "Please provide a valid API key in the Authorization header"
}

// HTTP 403: Insufficient permissions
{
  "error": "Forbidden",
  "code": "INSUFFICIENT_PERMISSIONS",
  "message": "Your API key does not have permission to issue credentials"
}
```

### Validation Errors
```json
// HTTP 400: Invalid input
{
  "error": "Invalid credential format",
  "code": "INVALID_FORMAT",
  "details": {
    "field": "licenseNumber",
    "message": "License number must be alphanumeric"
  }
}

// HTTP 422: Business logic error
{
  "error": "Credential already exists",
  "code": "DUPLICATE_CREDENTIAL",
  "message": "A credential with this license number already exists"
}
```

### System Errors
```json
// HTTP 404: Resource not found
{
  "error": "Credential not found",
  "code": "NOT_FOUND",
  "message": "No credential found with ID: cred_abc123"
}

// HTTP 429: Rate limited
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "message": "Too many requests. Try again in 60 seconds.",
  "retryAfter": 60
}

// HTTP 500: Internal server error
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please try again later.",
  "requestId": "req_xyz789"
}
```

## Advanced Examples

### Batch Credential Issuance
```bash
# Issue multiple credentials
curl -X POST http://localhost:3000/api/credentials/batch \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": [
      {
        "subjectId": "did:example:123",
        "credentialType": "MedicalLicense",
        "claims": {"licenseNumber": "ML12345", "specialty": "Cardiology"}
      },
      {
        "subjectId": "did:example:456",
        "credentialType": "MedicalLicense",
        "claims": {"licenseNumber": "ML67890", "specialty": "Neurology"}
      }
    ]
  }'

# Expected response:
# {
#   "status": "success",
#   "results": [
#     {"credentialId": "cred_abc123", "status": "issued"},
#     {"credentialId": "cred_def456", "status": "issued"}
#   ],
#   "totalIssued": 2,
#   "totalFailed": 0
# }
```

### Credential Search
```bash
# Search credentials by criteria
curl -X GET "http://localhost:3000/api/credentials?specialty=Cardiology&status=active&limit=10"

# Expected response:
# {
#   "credentials": [
#     {
#       "credentialId": "cred_abc123",
#       "type": "MedicalLicense",
#       "specialty": "Cardiology",
#       "status": "active",
#       "issuedAt": "2024-01-01T00:00:00Z"
#     }
#   ],
#   "pagination": {
#     "page": 1,
#     "limit": 10,
#     "total": 1,
#     "hasNext": false
#   }
# }
```