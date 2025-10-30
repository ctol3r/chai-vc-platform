# Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Implementation
- [x] Metrics instrumentation created
- [x] Command controller updated with metrics
- [x] NPPES service enhanced with caching and metrics
- [x] AI controller with PHI redaction
- [x] NPI revalidation worker
- [x] Routes mounted in app.ts
- [x] Dependencies added to package.json

### 📋 Pre-Deployment Tasks

#### 1. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (add Provider model if needed)
npx prisma migrate deploy

# Optional: Add Provider model to schema.prisma
# model Provider {
#   npi String @id
#   data Json
#   last_verified_at DateTime
# }
```

#### 2. Environment Configuration
```bash
# Required
export REDIS_URL="redis://your-redis-host:6379"
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Optional but recommended
export NPPES_PROXY_URL="http://internal-proxy:8080"
export BACKEND_BASE_URL="https://api.yourdomain.com"
```

#### 3. Redis Setup
- [ ] Redis instance running and accessible
- [ ] Connection tested: `redis-cli -h your-host ping`
- [ ] Memory limits configured appropriately
- [ ] Persistence enabled (if needed)

#### 4. Build and Test
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Verify build output
ls -la dist/
```

#### 5. Metrics Integration
- [ ] Prometheus scraping configured
- [ ] `/metrics` endpoint accessible
- [ ] Grafana dashboards created (optional)
- [ ] Alert rules configured (optional)

#### 6. Security Checklist
- [ ] Authentication middleware integrated
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] PHI redaction tested
- [ ] Audit logs verified

#### 7. Worker Deployment
- [ ] Separate worker process/container configured
- [ ] Worker connects to same Redis instance
- [ ] Worker has database access
- [ ] Monitoring for worker health
- [ ] Cron job or scheduler configured for monthly revalidation

#### 8. Monitoring & Observability
- [ ] Log aggregation configured
- [ ] Error tracking (Sentry, etc.) integrated
- [ ] Health check endpoint (if separate from /metrics)
- [ ] Uptime monitoring configured

## Deployment Steps

### 1. Build Application
```bash
cd backend
npm ci  # Clean install
npm run build
```

### 2. Database Migration
```bash
npx prisma migrate deploy
```

### 3. Start Application
```bash
# Using PM2
pm2 start dist/server.js --name vitalcv-backend

# Or using Docker
docker build -t vitalcv-backend .
docker run -d --name vitalcv-backend \
  -p 4000:4000 \
  -e REDIS_URL=redis://redis:6379 \
  -e DATABASE_URL=postgresql://... \
  vitalcv-backend
```

### 4. Start Worker
```bash
# Separate PM2 process
pm2 start dist/workers/npiRevalidateWorker.js --name vitalcv-worker

# Or in Docker
docker run -d --name vitalcv-worker \
  -e REDIS_URL=redis://redis:6379 \
  -e DATABASE_URL=postgresql://... \
  vitalcv-backend \
  node dist/workers/npiRevalidateWorker.js
```

### 5. Verify Deployment
```bash
# Check metrics endpoint
curl http://your-domain:4000/metrics

# Test command endpoint
curl -X POST http://your-domain:4000/api/command/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"validate npi 1234567893"}'

# Check worker status (if using Bull dashboard)
# Navigate to Bull dashboard or check Redis queue
```

## Post-Deployment

### Monitoring
- [ ] Verify metrics are being scraped
- [ ] Check for errors in logs
- [ ] Verify Redis connections
- [ ] Check database connection pool
- [ ] Monitor worker job processing

### Testing
- [ ] Execute test commands via API
- [ ] Verify cache hit/miss ratios
- [ ] Test PHI redaction
- [ ] Verify audit logs are created
- [ ] Test worker job scheduling

### Documentation
- [ ] Update API documentation
- [ ] Document environment variables
- [ ] Create runbooks for common issues
- [ ] Document rollback procedures

## Rollback Plan

If issues occur:

1. **Immediate Rollback:**
   ```bash
   pm2 restart vitalcv-backend --update-env
   # Or revert Docker image tag
   ```

2. **Database Rollback:**
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

3. **Configuration Rollback:**
   - Revert environment variables
   - Restart services

## Support Contacts

- **Backend Team**: [Your contact]
- **DevOps**: [Your contact]
- **On-Call**: [Your contact]

## Common Issues

### Redis Connection Errors
- Verify REDIS_URL is correct
- Check Redis is accessible from application
- Verify network/firewall rules

### Database Errors
- Verify DATABASE_URL is correct
- Check Prisma migrations are applied
- Verify Provider model exists (or service will log warnings)

### Metrics Not Scraping
- Verify /metrics endpoint is accessible
- Check Prometheus configuration
- Verify firewall rules allow scraping

### Worker Not Processing
- Check Redis connection
- Verify queue exists in Redis
- Check worker logs for errors
- Verify worker process is running
