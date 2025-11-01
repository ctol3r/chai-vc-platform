# VitalCV Local Development Guide

## Quick Start

### Prerequisites

- **Node.js** 18+ (with npm)
- **Docker** & **Docker Compose**
- **Git**

### One-Command Setup

```bash
# Clone and start everything
git clone <repo-url>
cd vitalcv
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run database migrations
cd ../backend && npx prisma migrate deploy

# Seed demo data (optional)
npm run seed
```

Access:
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **MailHog**: http://localhost:8025
- **ACA-Py Mock**: http://localhost:8031

## Services Overview

### Core Services

1. **PostgreSQL** (port 5432)
   - Database: `vitalcv_dev`
   - User: `vitalcv`
   - Password: `vitalcv_dev_pass`

2. **Redis** (port 6379)
   - Cache and job queue
   - Persistence enabled (AOF)

3. **Backend** (port 3000)
   - Express/TypeScript API
   - Hot-reload enabled

4. **Frontend** (port 3002)
   - Next.js 14 App Router
   - Hot-reload enabled

### Supporting Services

5. **ACA-Py Mock** (port 8031)
   - Simulates Aries Cloud Agent
   - Flask-based stub

6. **Prometheus** (port 9090)
   - Metrics collection
   - Scrapes `/metrics` every 10s

7. **Grafana** (port 3001)
   - Visualization dashboards
   - Pre-configured data source

8. **MailHog** (port 8025)
   - SMTP capture for dev emails
   - Web UI for viewing emails

## Development Workflow

### Starting Services

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Reset everything (including data)
docker-compose -f docker-compose.dev.yml down -v
```

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in dev mode (hot-reload)
npm run dev

# Run tests
npm test

# Run specific test
npm test -- sdjwt.test.ts

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run in dev mode
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint
npm run lint
```

### Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Seed demo data
npm run seed

# Open Prisma Studio
npx prisma studio
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://vitalcv:vitalcv_dev_pass@localhost:5432/vitalcv_dev

# Redis
REDIS_URL=redis://localhost:6379

# ACA-Py
ACAPY_URL=http://localhost:8031
ACAPY_API_KEY=dev-api-key
ACAPY_STUB=true

# SD-JWT
SD_JWT_SIGNING_KEY=dev-secret-key-change-in-production

# Uploads
UPLOAD_DIR=/tmp/uploads

# API
BACKEND_BASE_URL=http://localhost:3000

# SMTP (MailHog)
SMTP_HOST=localhost
SMTP_PORT=1025
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

## Testing the Complete Flow

### 1. Start Claim Flow

```bash
# Navigate to frontend
open http://localhost:3002/start

# Or use curl
curl -X POST http://localhost:3000/api/claim/doc \
  -F "npi=1234567893" \
  -F "files=@test-license.pdf"
```

### 2. Check SLO Dashboard

```bash
# Set admin role
# In browser console:
localStorage.setItem('userRole', 'admin');

# Navigate to dashboard
open http://localhost:3002/dashboard/slo
```

### 3. Issue Credential

```bash
# Navigate to issuer portal
open http://localhost:3002/issuer/issue

# Or use API
curl -X POST http://localhost:3000/api/issuer/attest-request \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "test-conn",
    "credDefId": "test-cred-def",
    "attributes": [
      {"name": "name", "value": "Dr. Jane Smith"},
      {"name": "npi", "value": "1234567893"}
    ]
  }'
```

### 4. Check Health

```bash
curl http://localhost:3000/api/health
```

### 5. View Metrics

```bash
# Prometheus format
curl http://localhost:3000/metrics

# SLO JSON
curl http://localhost:3000/api/metrics/slo
```

## Common Tasks

### Reset Demo Data

```bash
cd backend
npm run seed  # Reseed database
```

### Clear Redis Cache

```bash
docker-compose -f docker-compose.dev.yml exec redis redis-cli FLUSHALL
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 backend
```

### Check Queue Jobs

```bash
# Redis CLI
docker-compose -f docker-compose.dev.yml exec redis redis-cli

# List queues
KEYS bull:*

# Check queue length
LLEN bull:credential-issuance:wait
```

## Debugging

### Backend Debugging

```bash
# Run with Node debugger
cd backend
node --inspect node_modules/.bin/ts-node src/server.ts

# Attach debugger in VS Code
# Press F5 with this launch.json:
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Backend",
  "port": 9229
}
```

### Database Debugging

```bash
# Connect to database
docker-compose -f docker-compose.dev.yml exec postgres psql -U vitalcv -d vitalcv_dev

# Common queries
SELECT * FROM "Provider" LIMIT 10;
SELECT COUNT(*) FROM audit_events;
```

### Network Debugging

```bash
# Check service connectivity
docker-compose -f docker-compose.dev.yml exec backend ping postgres
docker-compose -f docker-compose.dev.yml exec backend curl redis:6379

# Check DNS
docker-compose -f docker-compose.dev.yml exec backend nslookup postgres
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.dev.yml
```

### Database Connection Errors

```bash
# Check if postgres is running
docker-compose -f docker-compose.dev.yml ps postgres

# Restart postgres
docker-compose -f docker-compose.dev.yml restart postgres

# View postgres logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Redis Connection Errors

```bash
# Check if redis is running
docker-compose -f docker-compose.dev.yml ps redis

# Test connection
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping

# Restart redis
docker-compose -f docker-compose.dev.yml restart redis
```

### npm install Failures

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use specific npm version
nvm use 18
npm install
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Prisma
- Docker
- GitLens

### Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Testing

### Run All Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests (when added)
cd frontend && npm test

# E2E tests (when added)
npm run test:e2e
```

### Watch Mode

```bash
# Backend watch
cd backend && npm test -- --watch

# Test specific file
npm test -- --watch sdjwt.test.ts
```

## Performance

### Monitor Performance

```bash
# View Prometheus metrics
open http://localhost:9090

# Example queries:
# - vitalcv_command_latency_seconds
# - psv_accuracy_ratio
# - rate(http_requests_total[5m])

# View Grafana dashboards
open http://localhost:3001
# Login: admin/admin
```

### Profile Slow Endpoints

```bash
# Add to backend code
console.time('slow-operation');
// ... operation
console.timeEnd('slow-operation');

# Or use clinic.js
npm install -g clinic
clinic doctor -- node dist/server.js
```

## Contributing

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

### Commit Messages

```
feat(claim): add document upload validation
fix(slo): correct P90 calculation
docs(api): update VC endpoint examples
```

### Pull Request Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Linting passes
- [ ] No console.log in production code
- [ ] Environment variables documented

## Resources

- **API Documentation**: `/docs/api/`
- **Architecture Docs**: `/docs/`
- **Runbooks**: `/docs/*-runbook.md`
- **Release Notes**: `/release/`

## Support

- **Internal Slack**: #vitalcv-dev
- **Issues**: GitHub Issues
- **Docs**: https://docs.vitalcv.com

---

**Happy coding!** 🚀

For questions, ping @dev-team in Slack or open an issue.
