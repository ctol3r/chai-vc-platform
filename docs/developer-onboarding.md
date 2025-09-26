generated-by: Claude 2025-09-26T00:00:00Z
# Developer Onboarding Guide

## Setup
```bash
./scripts/ensure_repo_root.sh
npm install --legacy-peer-deps
cd backend && npm run build && npm test
cd frontend && npm run dev
# Backend on :3000, Frontend on :3001
```

## Architecture
- **Backend**: Express + Apollo GraphQL + Prisma
- **Frontend**: Next.js + TypeScript
- **Blockchain**: Substrate pallets + Solidity contracts
- **ZKP**: Circom circuits + BBS+ signatures

## Key Files
- `backend/src/server.ts` - Main API server
- `frontend/pages/` - Next.js routes
- `contracts/` - Smart contracts
- `docs/technical-architecture.md` - Full system design

## Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E smoke tests
./scripts/smoke_e2e.sh
```

## Common Tasks
- **Add API endpoint**: `backend/src/routes/`
- **Add UI page**: `frontend/pages/`
- **Deploy contract**: `./scripts/deploy_contracts.sh`
- **Run HITL queue**: `curl /api/hitl/queue/reviewer-id`

## Getting Help
- Architecture questions: @backend-team
- UI/UX: @product
- Compliance: @legal-compliance

---
*Complete guide: `docs/local-development-guide.md`*