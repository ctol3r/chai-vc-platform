# Developer Onboarding Guide (MVP Lock)

Welcome to the Chai VC Platform engineering team. Follow the steps below to get a working environment, verify gates, and know where to ask for help.

## 0. Prerequisites Checklist
- macOS or Linux with Docker Desktop (or Docker Engine) installed
- Node.js 20.x (`nvm install 20` recommended) and npm 10+
- Git with company SSH keys configured
- Access to Slack (`#eng-onboarding`, `#alerts-production`)
- Shortcut / GitHub permissions (repo issues + boards)

## 1. Clone & Bootstrap (10 minutes)
```bash
# Move to any workspace directory
cd ~/dev

git clone git@github.com:company/chai-vc-platform.git
cd chai-vc-platform

# Ensure you are at repo root (works on macOS/Linux)
if [ -x ./scripts/ensure_repo_root.sh ]; then ./scripts/ensure_repo_root.sh; fi

# Install top-level dependencies (Hardhat + shared tooling)
npm install

# Copy env template and review required secrets
cp .env.example .env
```

## 2. Backend Setup & Verification (15 minutes)
```bash
cd backend
npm install
npm run prisma:generate
export PRIVACY_CLIENT_MODE=dev
npm run dev
```
Backend server now listens on `http://localhost:4000`. Health endpoints:
```bash
curl http://localhost:4000/healthz | jq '.status'
curl http://localhost:4000/readyz | jq '.status'
```
Leave the server running in a separate terminal.

## 3. Run Frontend + Backend Together

### Start Both Services
```bash
# Terminal 1: Backend Server (required first)
cd backend
npm run dev
# ✅ Backend running on http://localhost:4000

# Terminal 2: Frontend Server
cd frontend
npm install
npm run dev
# ✅ Frontend running on http://localhost:3000
```

### Verify Full Stack
```bash
# Test backend health directly
curl http://localhost:4000/healthz

# Test frontend proxy to backend
curl http://localhost:3000/api/healthz

# Both should return: {"status": "healthy", "service": "chai-vc-backend", ...}
```

### Access MVP Pages
- **Verifier Testing**: http://localhost:3000/verify
- **Credential Issuance**: http://localhost:3000/issuer
- **Health/Metrics**: http://localhost:3000/ops

### Environment Configuration
Frontend connects to backend via `NEXT_PUBLIC_BACKEND_URL`:
```bash
# Default (development)
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# Override if backend runs on different port
export NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
cd frontend && npm run dev
```

## 4. Gate Script & Local Quality Checks
These commands mirror the CI gates—run them before opening a PR:
```bash
# From repo root
./scripts/smoke_e2e.sh                 # main gate script (@smoke-e2e)
cd backend && npm run build && npm test -- --runInBand
npm test                               # root hardhat sanity check
```
If any step fails, fix locally first. For smoke failures capture logs:
```bash
./scripts/smoke_e2e.sh | tee smoke.log
```
Attach `smoke.log` to the issue/PR for reviewer context.

## 5. Daily Development Loop
```bash
git checkout main && git pull
npm install                             # keep toolchain fresh
git checkout -b feature/<slug>
# edit code...
./scripts/smoke_e2e.sh
cd backend && npm run build && npm test -- --runInBand
git add . && git commit -m "feat: <summary>"
git push -u origin feature/<slug>
```
Use Conventional Commits (`feat:`, `fix:`, `docs:`) to satisfy branch protection rules.

## 6. Filing Issues & Getting Help
- **Bug / task tracking**: open a GitHub issue in this repository, assign labels (`area:backend`, `smoke-failure`, etc.).
- **Operational incidents**: open a Shortcut incident, notify `#alerts-production`.
- **Questions during onboarding**: post in `#eng-onboarding` or DM your onboarding buddy.
- **Security/privacy concerns**: email `security@chai-vc.com` and tag `@legal-compliance` in Slack.

## 7. Useful References
- [API Examples](api/README.md)
- [Smoke E2E Runbook](ops/smoke-e2e.md)
- [Release Process](RELEASE_PROCESS.md)
- [Developer FAQ](FAQ.md)

Welcome aboard! If anything in this guide is unclear, open a PR to improve it—docs are part of the definition of done.
