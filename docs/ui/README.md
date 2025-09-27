# UI Frontend Documentation

## Overview
The frontend is a Next.js application providing three MVP pages for interacting with the Chai VC Platform backend APIs. All `/api/*` requests are proxied to the backend server through a custom Next.js API route.

## MVP Pages

### 1. Verify Page (`/verify`)
**Purpose**: Test credential verification and status checking
**Backend Routes**:
- `GET /api/verifier/credential/{id}/status` - Check credential status
- `POST /api/verifier/presentation` - Verify VP tokens with nonce protection

**Key Features**:
- Input credential ID and optional VP token
- Check credential status (active/expired/revoked/unknown)
- Verify presentation with replay attack protection
- JSON response display with syntax highlighting

### 2. Issuer Page (`/issuer`)
**Purpose**: Issue new credentials for development/testing
**Backend Routes**:
- `POST /api/issuer/credential` - Issue credential with subject ID and type

**Key Features**:
- Input subject ID (e.g., `did:example:doctor123`)
- Select credential type (defaults to "License")
- Returns deterministic credential ID and JWT-formatted VC
- Suitable for MVP development and testing workflows

### 3. Ops Page (`/ops`)
**Purpose**: Monitor backend health and metrics
**Backend Routes**:
- `GET /api/healthz` - Basic health check
- `GET /api/readyz` - Readiness check with dependency status
- `GET /api/metrics` - Prometheus metrics (text format)

**Key Features**:
- One-click health/ready status checks
- Raw metrics display for monitoring integration
- Real-time backend connectivity verification

## Proxy Configuration

### How It Works
The frontend uses a custom Next.js API route at `pages/api/_proxy.ts` to forward all `/api/*` requests to the backend server. This avoids CORS issues and provides a seamless development experience.

### Environment Variables
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000  # Backend server URL
```

**Default**: `http://localhost:4000` (backend development server)
**Production**: Set to actual backend service URL

### Request Flow
```
Frontend Page → /api/some/endpoint → pages/api/_proxy.ts → Backend Server
```

1. Frontend makes request to `/api/verifier/presentation`
2. Next.js routes to `pages/api/_proxy.ts`
3. Proxy forwards to `${NEXT_PUBLIC_BACKEND_URL}/api/verifier/presentation`
4. Backend responds, proxy returns response to frontend

### Supported Methods
- **GET**: Query parameters preserved, no body forwarding
- **POST/PUT/PATCH**: Body forwarded as JSON, headers preserved
- **HEAD**: No body forwarding

## Development Workflow

### Start Frontend + Backend Together
```bash
# Terminal 1: Backend (required)
cd backend
npm run dev  # Starts on :4000

# Terminal 2: Frontend
cd frontend
npm run dev  # Starts on :3000
```

### Quick Health Check
```bash
# Test backend connectivity through frontend proxy
curl http://localhost:3000/api/healthz
curl http://localhost:3000/api/readyz
```

### Production Build
```bash
cd frontend
npm run build
npm run start  # Production server on :3000
```

## File Structure
```
frontend/
├── pages/
│   ├── verify.tsx          # Verifier testing page
│   ├── issuer.tsx          # Credential issuance page
│   ├── ops.tsx             # Health/metrics monitoring
│   └── api/
│       └── _proxy.ts       # Backend proxy configuration
├── next.config.js          # Next.js configuration
└── package.json           # Dependencies and scripts
```

---
**Owners**: @product @frontend-team
**Last Updated**: 2025-01-15