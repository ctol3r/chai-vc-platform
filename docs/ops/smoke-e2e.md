generated-by: Claude 2025-09-26T00:00:00Z
# Smoke E2E Testing Runbook

## Intent
Nightly end-to-end smoke tests to validate critical user journeys and system health before production deployment.

## Nightly Script

### Location & Execution
```bash
# Script location
scripts/smoke_e2e.sh

# Manual execution
cd /Users/christoler/dev/chai-vc-platform
./scripts/smoke_e2e.sh

# Scheduled execution (GitHub Actions)
# Runs daily at 2 AM UTC
# Workflow: .github/workflows/smoke-e2e.yml
```

### Test Scenarios
```bash
#!/bin/bash
# scripts/smoke_e2e.sh
set -e

echo "🧪 Starting Smoke E2E Tests"

# 1. Health check
curl -f http://localhost:3000/health || exit 1

# 2. Credential issuance
CRED_RESPONSE=$(curl -X POST http://localhost:3000/api/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{"subjectId": "did:test:smoke", "credentialType": "TestLicense"}')
CRED_ID=$(echo $CRED_RESPONSE | jq -r '.credentialId')

# 3. Credential verification
curl -X POST http://localhost:3000/api/credentials/verify \
  -H "Content-Type: application/json" \
  -d "{\"vcJwt\": \"$(echo $CRED_RESPONSE | jq -r '.vcJwt')\"}" | jq '.verified' | grep true

# 4. Status check
curl http://localhost:3000/api/credentials/${CRED_ID}/status | jq '.status' | grep active

# 5. GraphQL query
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ credentials(limit: 1) { id } }"}' | jq '.data.credentials[0].id'

# 6. HITL queue check
curl http://localhost:3000/api/hitl/queue/test-reviewer | jq '.queue_size' | grep -E '^[0-9]+$'

echo "✅ All smoke tests passed"
```

## Metrics to Monitor

### Success Criteria
```yaml
smoke_test_sla:
  success_rate: ">95%"
  execution_time: "<5 minutes"
  response_times:
    health_check: "<500ms"
    credential_issue: "<2s"
    credential_verify: "<1s"
    status_check: "<500ms"
```

### Dashboard Metrics
```bash
# Prometheus queries
# Success rate (last 24h)
rate(smoke_test_success_total[24h]) / rate(smoke_test_total[24h]) * 100

# Average execution time
avg(smoke_test_duration_seconds)

# P95 response times
histogram_quantile(0.95, smoke_test_response_time_seconds_bucket)
```

### Grafana Dashboard
- **URL**: https://grafana.chai-vc.com/d/smoke-e2e
- **Panels**: Success rate, execution time, response time percentiles
- **Alerts**: <90% success rate triggers PagerDuty

## Rollback Procedures

### Immediate Actions (if tests fail)
```bash
# 1. Stop deployments
gh workflow disable deploy-production.yml

# 2. Check system status
curl http://localhost:3000/health | jq '.'

# 3. Review recent deployments
gh run list --workflow=deploy-production.yml --limit=5

# 4. Rollback if needed
kubectl rollout undo deployment/backend-api -n production
kubectl rollout undo deployment/frontend-app -n production
```

### Root Cause Analysis
```bash
# Check application logs
kubectl logs deployment/backend-api -n production --since=1h

# Database health
psql -h prod-db.internal -c "SELECT version();"

# Network connectivity
curl -v http://internal-api.chai-vc.com/health
```

### Recovery Steps
1. **Identify failure point** from test output
2. **Check infrastructure** (DB, Redis, external APIs)
3. **Review recent changes** in last 24h
4. **Rollback or hotfix** based on severity
5. **Re-run tests** to confirm recovery
6. **Post-mortem** if customer impact occurred

## Test Environment Setup

### Prerequisites
```bash
# Start local environment
docker-compose up -d postgres redis
cd backend && npm run dev &
cd frontend && npm run build && npm start &

# Wait for services
./scripts/wait_for_services.sh
```

### Mock Data
```bash
# Seed test data
npm run seed:test

# Create test DID
curl -X POST http://localhost:3000/api/dids/create \
  -d '{"method": "key", "purpose": "test"}'
```

## Alerting & Notifications

### PagerDuty Integration
```yaml
alert_rules:
  - name: smoke_test_failure
    condition: success_rate < 90%
    severity: high
    notification: "@oncall-engineering"

  - name: smoke_test_timeout
    condition: execution_time > 600s
    severity: medium
    notification: "@backend-team"
```

### Slack Notifications
- **Channel**: #alerts-production
- **Success**: Daily summary at 3 AM UTC
- **Failure**: Immediate notification with logs

## Maintenance Schedule

### Daily
- 2:00 AM UTC: Automated smoke test execution
- 3:00 AM UTC: Report generation and notifications

### Weekly
- Sunday 1:00 AM UTC: Full regression test suite
- Test script updates and maintenance

### Monthly
- Review test scenarios for completeness
- Update success criteria and SLAs
- Cleanup old test data and logs

## Troubleshooting

### Common Issues
```bash
# Database connection timeout
# Fix: Check connection pool settings
kubectl describe pod postgres -n production

# API rate limiting
# Fix: Whitelist test client IP
curl -X POST http://localhost:3000/api/admin/whitelist \
  -d '{"ip": "127.0.0.1", "reason": "smoke_test"}'

# Certificate expiry
# Fix: Renew TLS certificates
certbot renew --nginx
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=1 ./scripts/smoke_e2e.sh

# Skip specific tests
SKIP_GRAPHQL=1 ./scripts/smoke_e2e.sh

# Run single test
./scripts/smoke_e2e.sh --test=credential_issue
```

## Owners & Escalation

### Primary Contacts
- **Test Maintenance**: @backend-team
- **Infrastructure**: @sre-team
- **On-call Escalation**: @oncall-engineering
- **Business Hours**: @product

### Escalation Path
1. **Level 1**: Automated retry (max 2 attempts)
2. **Level 2**: Slack notification to @backend-team
3. **Level 3**: PagerDuty alert if pattern failure
4. **Level 4**: Incident commander if customer impact