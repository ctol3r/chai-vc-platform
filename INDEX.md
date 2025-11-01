# VitalCV Pilot - Documentation Index

Quick navigation to all documentation and resources.

## 🚀 Getting Started

### New Developers
1. **[README.dev.md](./README.dev.md)** - Complete local development guide
2. **[scripts/quickstart.sh](./scripts/quickstart.sh)** - One-command setup
3. **[.env.example](./.env.example)** - Environment configuration template

### New Partners
1. **[docs/widget-integration-guide.md](./docs/widget-integration-guide.md)** - Integration walkthrough
2. **[packages/widget/README.md](./packages/widget/README.md)** - Widget package docs
3. **[docs/api/vc-endpoints.md](./docs/api/vc-endpoints.md)** - API reference

### Project Leadership
1. **[PILOT_COMPLETE.md](./PILOT_COMPLETE.md)** - Completion summary
2. **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Detailed status
3. **[release/pilot-v0.1-notes.md](./release/pilot-v0.1-notes.md)** - Release notes

## 📁 Core Documentation

### Technical Implementation

**Selective Disclosure:**
- [SD-JWT Implementation Guide](./docs/sdjwt-implementation.md)
- [VC API Endpoints](./docs/api/vc-endpoints.md)

**Credential Issuance:**
- [ACA-Py Integration Guide](./docs/acapy-integration.md)

**Monitoring:**
- [SLO Implementation Summary](./docs/slo-implementation-summary.md)

**Integration:**
- [Widget Integration Guide](./docs/widget-integration-guide.md)

### Operations

**Deployment:**
- [Demo Runbook](./docs/demo-runbook.md)
- [7-Week Plan](./docs/7-week-plan.md)
- [Argo Rollouts Config](./k8s/argo-rollout.yaml)
- [Docker Compose](./docker-compose.dev.yml)

**Monitoring:**
- [Prometheus Config](./ops/prometheus/prometheus.yml)
- [SLO Alert Rules](./ops/prometheus/slo_alerts.yml)

## 🏗️ Code Structure

### Backend (`/backend`)

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── npi.ts
│   │   ├── claimDoc.ts
│   │   ├── claimBasic.ts
│   │   ├── claimStatus.ts
│   │   ├── vc.ts
│   │   ├── issuer.ts
│   │   ├── metrics.ts
│   │   ├── health.ts
│   │   └── wellknown.ts
│   ├── lib/             # Shared libraries
│   │   ├── sdjwt.ts
│   │   └── acapy.ts
│   ├── instrumentation/ # Metrics
│   │   └── metrics.ts
│   ├── services/        # Business logic
│   │   └── nppesService.ts
│   ├── controllers/     # Controllers
│   │   ├── commandController.ts
│   │   ├── aiController.ts
│   │   ├── audit.ts
│   │   └── npiUtil.ts
│   └── workers/         # Background jobs
│       └── npiRevalidateWorker.ts
├── __tests__/          # Test files
└── prisma/             # Database schema
```

### Frontend (`/frontend`)

```
frontend/
├── app/                # Next.js App Router
│   ├── start/
│   │   └── page.tsx   # Claim wizard
│   ├── dashboard/
│   │   └── slo/
│   │       └── page.tsx  # SLO dashboard
│   └── issuer/
│       └── issue/
│           └── page.tsx  # Issuer portal
├── components/         # React components
│   ├── ClaimWizard.tsx
│   ├── SLODashboard.tsx
│   ├── AdminNav.tsx
│   ├── Card.tsx
│   └── Sparkline.tsx
└── pages/             # Legacy pages
```

### Packages (`/packages`)

```
packages/
└── widget/            # @vitalcv/widget
    ├── src/
    │   └── index.ts
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

## 🧪 Testing

### Run All Tests
```bash
cd backend && npm test
```

### Test Coverage
- `__tests__/npiUtil.test.ts` - NPI validation
- `__tests__/sdjwt.test.ts` - SD-JWT operations  
- `__tests__/acapy.test.ts` - ACA-Py integration
- `__tests__/wellknown.test.ts` - OIDC4VCI metadata

## 🔧 Development Tools

### Local Environment
```bash
./scripts/quickstart.sh --seed
```

### Access Points
- Frontend: http://localhost:3002
- Backend: http://localhost:3000
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- MailHog: http://localhost:8025

## 📊 Monitoring

### Dashboards
- SLO Dashboard: `/dashboard/slo`
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

### Key Metrics
```bash
# SLO metrics
curl http://localhost:3000/api/metrics/slo

# Prometheus format
curl http://localhost:3000/metrics

# Health check
curl http://localhost:3000/api/health
```

## 🎯 Use Cases

### For Hospital Credentialing
- Verify clinician licenses in <3 days
- Automated PSV checks
- Audit trail with blockchain anchoring

### For Job Applications
- One-click verified applications
- Selective disclosure of credentials
- Reduced time-to-hire

### For Healthcare Providers
- Control credential sharing
- Update once, share many times
- Privacy-preserving verification

## 🔗 Quick Links

### Documentation
- [Main README](./README.md)
- [Dev Guide](./README.dev.md)
- [Pilot Complete](./PILOT_COMPLETE.md)
- [Implementation Status](./IMPLEMENTATION_STATUS.md)

### Code
- [Backend Source](./backend/src)
- [Frontend Source](./frontend)
- [Widget Package](./packages/widget)

### Infrastructure
- [Docker Compose](./docker-compose.dev.yml)
- [K8s Manifests](./k8s/)
- [Prometheus Config](./ops/prometheus/)

### Release
- [Release Notes](./release/pilot-v0.1-notes.md)
- [7-Week Plan](./docs/7-week-plan.md)
- [Demo Runbook](./docs/demo-runbook.md)

## 📞 Support

- **Developer Slack**: #vitalcv-dev
- **GitHub Issues**: [Repository Issues]
- **Email**: support@vitalcv.com

---

**Status**: ✅ PILOT READY  
**Version**: 0.1.0  
**Last Updated**: 2024

**🎉 Ready for launch!**
