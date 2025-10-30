# Quick Start Guide

## Installation

```bash
cd backend
npm install
```

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env  # or create .env manually
   ```

2. Set minimum required variables:
   ```bash
   REDIS_URL=redis://localhost:6379
   DATABASE_URL=file:./dev.db
   ```

3. Start Redis (if not already running):
   ```bash
   # Docker
   docker run -d -p 6379:6379 redis:7-alpine
   
   # Or use local Redis installation
   ```

4. Initialize database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

## Running the Server

```bash
# Development mode
npm run dev

# Production mode (build first)
npm run build
npm start
```

## Testing Endpoints

### 1. Health Check / Metrics
```bash
curl http://localhost:4000/metrics
```

### 2. Parse Natural Language Command
```bash
curl -X POST http://localhost:4000/api/command/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"validate npi 1234567893"}'
```

### 3. Execute Command
```bash
curl -X POST http://localhost:4000/api/command/execute \
  -H "Content-Type: application/json" \
  -d '{"rawQuery":"validate npi 1234567893"}'
```

### 4. AI Explain (with PHI redaction)
```bash
curl -X POST http://localhost:4000/api/ai/explain \
  -H "Content-Type: application/json" \
  -d '{"subjectType":"claim","subjectId":"123"}'
```

## Running Tests

```bash
npm test
```

## Running the Worker

The NPI revalidation worker can be run as a separate process:

```bash
# After building
npm run build

# Run worker (in a separate terminal)
node dist/workers/npiRevalidateWorker.js

# Or schedule monthly revalidation programmatically
node -e "require('./dist/workers/npiRevalidateWorker').scheduleMonthlyRevalidate().then(console.log)"
```

## Architecture Overview

```
┌─────────────────┐
│   Express App   │
│  (Port 4000)    │
└────────┬────────┘
         │
    ┌────┴────┬─────────────┬─────────────┐
    │         │             │             │
    ▼         ▼             ▼             ▼
┌────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
│Command │ │   AI     │ │ Metrics │ │   Auth   │
│Controller│Controller│ │Endpoint │ │Middleware│
└────┬───┘ └────┬─────┘ └─────────┘ └──────────┘
     │          │
     ▼          ▼
┌──────────┐ ┌──────────┐
│  NPPES   │ │  Audit   │
│ Service  │ │  Logger  │
└────┬─────┘ └──────────┘
     │
┌────┴────┬──────────────┐
│         │              │
▼         ▼              ▼
┌────┐ ┌──────┐    ┌──────────┐
│Redis│ │Prisma│    │Prometheus│
│Cache│ │  DB  │    │  Scraper │
└─────┘ └──────┘    └──────────┘

┌─────────────────┐
│  Worker Process │
│  (Bull Queue)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────┐
│Redis │  │Prisma│
│Queue │  │  DB  │
└──────┘  └──────┘
```

## Key Features

- ✅ Natural language command parsing
- ✅ Command execution with role-based authorization
- ✅ NPI validation and lookup with caching
- ✅ Prometheus metrics for observability
- ✅ Audit logging for compliance
- ✅ PHI redaction for AI endpoints
- ✅ Background worker for NPI revalidation
- ✅ Redis caching for performance

## Next Steps

1. Set up authentication middleware (JWT/OAuth)
2. Add Provider model to Prisma schema for full persistence
3. Configure Prometheus scraping for production
4. Set up CI/CD pipeline
5. Add frontend integration (Command Palette UI)
