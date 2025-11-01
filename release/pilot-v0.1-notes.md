# Pilot Release v0.1 - Release Notes

**Release Date**: TBD  
**Version**: 0.1.0  
**Status**: Pilot / Development

## Overview

This is the initial pilot release of the Chai VC Platform, focused on credential claim verification workflows for healthcare providers. This release provides core functionality for NPI validation, document upload, and claim status tracking.

## Features

### Backend APIs

#### NPI Lookup Service
- **Endpoint**: `POST /api/npi/lookup`
- **Description**: Validates and looks up National Provider Identifier (NPI) information from NPPES API
- **Features**:
  - NPI format validation
  - NPPES API integration with caching (Redis)
  - Database persistence (Prisma)
  - Audit logging

#### Claim Document Upload
- **Endpoint**: `POST /api/claim/doc`
- **Description**: Upload claim documents (multipart/form-data)
- **Features**:
  - File upload via Multer
  - NPI validation on upload
  - Initial claim creation
  - Status tracking

#### Claim Workflow Initiation
- **Endpoint**: `POST /api/claim/basic`
- **Description**: Kick off verification workflow
- **Features**:
  - Claim validation
  - OCR/liveness job queuing (stub)
  - Status progression (Level 2)
  - Audit logging

#### Claim Status Tracking
- **Endpoint**: `GET /api/claim/status`
- **Description**: Get claim status by statusId
- **Features**:
  - Real-time status updates
  - Status progression tracking
  - Level-based status (1: Uploaded, 2: Processing, 3: Attested)

### Frontend Components

#### ClaimWizard Component
- **Route**: `/start`
- **Description**: Multi-step wizard for claim submission
- **Features**:
  - Step 1: NPI validation
  - Step 2: Document upload
  - Step 3: Claim submission and status tracking
  - Real-time status polling
  - Error handling

#### SLO Dashboard Component
- **Route**: `/dashboard/slo`
- **Description**: Service Level Objective monitoring dashboard
- **Features**:
  - 5 SLO metric cards (PSV Accuracy, TTP P90, FPPE Rate, Adverse Misses, Evidence Completeness)
  - Alert banner for threshold breaches
  - Historical trend charts (Recharts)
  - Auto-refresh every 30 seconds
  - Role-based access control (admin/ops)
  - Mobile responsive design
  - Color-coded status indicators

#### Admin Navigation
- **Description**: Navigation bar for admin/ops users
- **Features**:
  - Links to SLO Dashboard and Claim Wizard
  - User role badge
  - Responsive design

### Infrastructure

#### Metrics & Monitoring
- **Endpoint**: `GET /metrics`
- **Description**: Prometheus metrics export
- **Metrics**:
  - Command execution counter
  - Command latency histogram
  - NPI lookup counter (cache hits/misses, successes, errors)
  - SLO metrics (PSV accuracy, evidence completeness, FPPE rate, adverse misses, TTP histogram)

#### SLO Metrics Endpoint
- **Endpoint**: `GET /api/metrics/slo`
- **Description**: JSON endpoint for SLO dashboard
- **Returns**:
  - PSV Accuracy ratio
  - Time to Privilege (P90 in days)
  - FPPE trigger rate
  - Adverse miss count
  - Evidence completeness ratio

#### Health Check Endpoint
- **Endpoint**: `GET /api/health`
- **Description**: Comprehensive health check with subchecks
- **Monitors**:
  - Redis connectivity and latency
  - Database connectivity and latency
  - Prometheus metrics availability
  - Memory usage
  - Application uptime
- **Use Cases**: Kubernetes probes, load balancer checks, monitoring dashboards

#### Audit Logging
- Event tracking for all critical operations
- PHI redaction support
- In-memory audit scrapbook (pilot)

## Technical Stack

### Backend
- **Framework**: Express.js (Node.js/TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (ioredis)
- **File Upload**: Multer
- **Metrics**: Prometheus (prom-client)
- **Job Queue**: Bull (for future worker implementation)

### Frontend
- **Framework**: Next.js 14 (React/TypeScript)
- **Router**: App Router
- **State Management**: React Hooks
- **Charts**: Recharts 2.12
- **Components**: Card, Sparkline, SLODashboard, AdminNav

### DevOps
- **Containerization**: Docker Compose
- **CI/CD**: GitHub Actions (planned)

## Known Limitations

### Pilot Mode Restrictions
- In-memory storage for claims and statuses (not persistent across restarts)
- Stub implementations for:
  - OCR processing
  - ACA-Py integration
  - VC issuance
- No production-grade security hardening
- Limited error handling and recovery

### Missing Features
- Database persistence for claims (currently in-memory)
- Background job processing (worker implementation incomplete)
- User authentication and authorization
- Multi-tenant support
- Production deployment configuration

## Setup Instructions

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repo>
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env` (if exists)
   - Configure database, Redis, and API keys

3. **Start Services**
   ```bash
   docker-compose up -d postgres redis
   cd backend && npx prisma migrate deploy
   npm run dev
   cd ../frontend && npm run dev
   ```

4. **Access**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Metrics: http://localhost:3000/metrics

## Testing

### Manual Testing
1. Navigate to `/start`
2. Enter a valid NPI (10 digits)
3. Upload test documents
4. Monitor status updates

### Automated Tests
- Backend: `cd backend && npm test`
- Frontend: `cd frontend && npm test`

## Documentation

- **API Documentation**: `docs/api/claim-api.md` (planned)
- **Developer Guide**: `README.dev.md` (planned)
- **Demo Runbook**: `docs/demo-runbook.md`
- **7-Week Plan**: `docs/7-week-plan.md`

## Security Notes

⚠️ **PILOT ONLY** - Not for production use

- No authentication required
- Limited input validation
- In-memory stores (no persistence)
- Stub implementations for critical security features
- PHI redaction is basic (not production-grade)

See `docs/privacy-notes.md` for HIPAA & privacy considerations.

## Support

### Troubleshooting
- See `docs/demo-runbook.md` for common issues
- Check logs: `docker-compose logs backend frontend`
- Health check: `curl http://localhost:3000/health`

### Known Issues
- [ ] Bolt publish error (dd290d24) - investigation needed
- [ ] Status polling may timeout after 30s
- [ ] File upload size limits not enforced

## Roadmap

### Next Release (v0.2)
- Database persistence for claims
- Worker implementation for background jobs
- Improved error handling
- Enhanced security features
- User authentication

### Future Releases
- Production deployment configuration
- Multi-tenant support
- Enhanced PHI redaction
- Full ACA-Py integration
- VC issuance workflow

## Changelog

### v0.1.0 (Initial Pilot)

#### Backend
- ✅ Backend route separation (npi, claimDoc, claimBasic, claimStatus)
- ✅ Metrics endpoint (`/metrics`)
- ✅ SLO metrics endpoint (`/api/metrics/slo`)
- ✅ Health check endpoint (`/api/health`)
- ✅ Audit logging infrastructure
- ✅ NPI lookup with Redis caching
- ✅ File upload with Multer
- ✅ Status tracking workflow
- ✅ SLO metrics instrumentation (PSV, TTP, Evidence, FPPE, Adverse)
- ✅ Claim flow instrumentation with metrics

#### Frontend
- ✅ ClaimWizard component
- ✅ SLODashboard component with charts
- ✅ AdminNav component
- ✅ Card component
- ✅ Sparkline component (micro-trends)
- ✅ App Router page at `/start`
- ✅ App Router page at `/dashboard/slo`
- ✅ Role-based access control
- ✅ Auto-refresh polling
- ✅ Alert threshold detection

#### Selective Disclosure (SD-JWT)
- ✅ SD-JWT library implementation
- ✅ `/api/vc/sd-issue` - Issue SD-JWTs with selective disclosure
- ✅ `/api/vc/sd-verify` - Verify SD-JWTs and extract claims
- ✅ `/api/vc/sd-select` - Create selective disclosures
- ✅ Salt storage and management
- ✅ Audit logging for all VC operations
- ✅ Comprehensive unit tests

#### Credential Issuance (ACA-Py)
- ✅ ACA-Py client library with TLS and auth
- ✅ `/api/issuer/attest-request` - Request credential issuance
- ✅ `/api/issuer/attest-status/:id` - Check issuance status
- ✅ `/api/issuer/webhook/credential` - Receive ACA-Py events
- ✅ `/api/issuer/status` - Get agent status
- ✅ `/api/issuer/credential-definitions` - List credential definitions
- ✅ `/api/issuer/connection/create` - Create connection invitations
- ✅ Bull queue for async credential issuance
- ✅ Retry logic with exponential backoff
- ✅ Stub implementation for local development
- ✅ Comprehensive unit tests

#### OIDC4VCI Discovery
- ✅ `/.well-known/openid-credential-issuer` - OIDC4VCI metadata
- ✅ `/.well-known/jwks.json` - JSON Web Key Set
- ✅ `/.well-known/did-configuration.json` - DID configuration
- ✅ Metadata validation tests
- ✅ Credential type definitions

#### Widget Package (@vitalcv/widget)
- ✅ NPM package scaffold
- ✅ TypeScript types and interfaces
- ✅ PostMessage handshake implementation
- ✅ Origin whitelist security
- ✅ Theme customization support
- ✅ React/Vue/Plain JS examples
- ✅ Comprehensive README

#### Issuer Portal
- ✅ `/issuer/issue` - Credential issuance UI
- ✅ Provider search by NPI
- ✅ Template selection
- ✅ Attribute entry forms
- ✅ Evidence attachment
- ✅ Preview and confirmation
- ✅ Status tracking

#### DevOps
- ✅ `docker-compose.dev.yml` - Local development stack
- ✅ ACA-Py mock server (Flask)
- ✅ Prometheus configuration
- ✅ Grafana setup
- ✅ MailHog (SMTP capture)
- ✅ Argo Rollouts canary deployment policy
- ✅ SLO alert rules
- ✅ Quick start script (one-command setup)
- ✅ Development Dockerfiles
- ✅ Environment templates

#### Security Enhancements (NEW)
- ✅ **Ed25519 Cryptography** - Industry-standard signing
- ✅ **Circuit Breaker** - ACA-Py resilience (3 retries, exponential backoff)
- ✅ **Merkle Tree Anchoring** - Tamper-evident audit trail
- ✅ **Selective Disclosure UI** - Privacy-preserving claim selection
- ✅ **Signature Regression Tests** - 20+ edge case validations

#### Blockchain Anchoring (NEW)
- ✅ Merkle tree library (SHA-256)
- ✅ Batch anchoring worker (Bull queue)
- ✅ Proof generation API
- ✅ On-chain stub (Substrate/Ethereum ready)
- ✅ `POST /api/anchor/batch` - Schedule anchoring
- ✅ `GET /api/anchor/proof/:batchId/:eventId` - Get proofs
- ✅ `POST /api/anchor/verify` - Verify proofs
- ✅ Performance: 1000 events < 5 seconds

## Contributors

[Add contributors]

## License

[Add license]

---

**⚠️ WARNING**: This is a pilot release. Not recommended for production use. See security notes above.
