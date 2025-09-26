# Developer Quick Start

**generated-by: Claude 2025-01-15T10:30:00Z**

## Intent
Get developers productive on Chai VC Platform in <5 minutes with exact commands for setup, build, and test verification.

## Steps/How-to

### 1. Repo Setup
```bash
# Ensure repo root
if [ -x ./scripts/ensure_repo_root.sh ]; then ./scripts/ensure_repo_root.sh; else ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"; [ -n "$ROOT" ] && cd "$ROOT" || (while [ ! -f package.json ] && [ "$PWD" != "/" ]; do cd ..; done); fi

# Install with legacy peer deps (temporary for build compatibility)
npm install --legacy-peer-deps
```

### 2. Backend Build & Test
```bash
# Navigate to backend
cd backend

# Generate Prisma client
npm run prisma:generate

# Build backend
npm run build

# Run all backend tests
npm test

# Focused verifier test (specific component)
npm run test:verifier
```

### 3. Verification Commands
```bash
# Health check - backend builds successfully
npm run build:ci

# Health check - tests pass
npm run test:ci

# Smoke test (unit tests only)
npm run ci-smoke
```

## Owners
- **Setup Issues**: @platform-engineering
- **Test Failures**: @backend-team
- **Build Issues**: @devops

## Risks/Notes
- `--legacy-peer-deps` is temporary fix for dependency conflicts
- Backend tests require local database setup (see .env.example)
- Verifier tests may require mock blockchain connection
- Remove legacy flag after dependency audit in next sprint

**Quick Debug:**
- Build fails → Check Node.js version (18+)
- Tests fail → Check database connection in .env
- Install fails → Clear `node_modules` and retry with legacy flag