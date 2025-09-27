generated-by: Claude 2025-09-26T00:00:00Z
# Rollback SOP - Generic Backend Deployment

## Immediate Rollback Procedures

### Application Rollback (Kubernetes)
```bash
# Check current deployment status
kubectl get deployments -n production

# Rollback to previous version
kubectl rollout undo deployment/backend-api -n production
kubectl rollout undo deployment/frontend-app -n production

# Verify rollback status
kubectl rollout status deployment/backend-api -n production
kubectl rollout status deployment/frontend-app -n production

# Check pods are healthy
kubectl get pods -n production -l app=backend-api
kubectl get pods -n production -l app=frontend-app
```

### Database Rollback (if required)
```bash
# CAUTION: Only for schema changes, never for data loss

# Check current migration version
./scripts/db_version.sh

# Rollback to specific version (if safe)
./scripts/db_rollback.sh --version=20250925_120000 --confirm

# Verify database health
./scripts/db_health_check.sh
```

### Container Image Rollback
```bash
# Check current image tags
kubectl get deployment backend-api -n production -o jsonpath='{.spec.template.spec.containers[0].image}'

# Rollback to specific image
kubectl set image deployment/backend-api backend-api=chai-vc/backend:v1.2.2 -n production

# Monitor deployment
kubectl rollout status deployment/backend-api -n production --timeout=300s
```

## Rollback Decision Tree

### When to Rollback Immediately
- **Critical security vulnerability** introduced
- **Service completely unavailable** (>5 minutes)
- **Data corruption** detected
- **PHI/PII exposure** risk identified
- **Major API breaking changes** affecting critical customers

### When to Hotfix Instead
- **Minor performance degradation** (<20% impact)
- **Non-critical feature bugs** not affecting core functionality
- **Configuration issues** that can be fixed without code changes
- **Single customer impact** with workaround available

### When to Monitor and Assess
- **Minor error rate increase** (<5% above baseline)
- **Performance degradation** in non-critical paths
- **New feature issues** not affecting existing functionality
- **Cosmetic UI problems**

## Verification Steps Post-Rollback

### Health Check Sequence
```bash
# 1. Basic connectivity
curl -f http://api.chai-vc.com/health || echo "Health check failed"

# 2. Authentication test
curl -H "Authorization: Bearer $TEST_TOKEN" http://api.chai-vc.com/api/user/profile

# 3. Core functionality test
curl -X POST http://api.chai-vc.com/api/credentials/verify \
  -H "Content-Type: application/json" \
  -d '{"vcJwt": "'$TEST_CREDENTIAL'"}'

# 4. Database connectivity
./scripts/db_connection_test.sh

# 5. External service integration
./scripts/test_external_apis.sh
```

### Smoke Test Execution
```bash
# Run automated smoke tests
./scripts/smoke_e2e.sh --environment=production --timeout=300

# Expected output:
# ✅ Health check: PASS
# ✅ Authentication: PASS
# ✅ Credential issuance: PASS
# ✅ Credential verification: PASS
# ✅ Database operations: PASS
```

### Performance Baseline Check
```bash
# Check key metrics return to baseline
curl -s http://prometheus:9090/api/v1/query?query=http_request_duration_seconds_p95 | jq '.data.result[0].value[1]'

# Expected: <2.0 seconds
# Alert if: >5.0 seconds
```

## Communication Plan

### Internal Communication (Immediate)
```
Subject: PRODUCTION ROLLBACK - Backend v1.2.3 → v1.2.2

Issue: [Brief description of problem]
Action: Rolled back backend deployment to previous stable version
Status: Rollback complete, services restored
Impact: [Customer impact description]
Next Steps: [Investigation plan]

- Incident Commander: [Name]
- Engineering Lead: [Name]
- Customer Support: Notified
- Estimated Resolution: [Timeline]
```

### Customer Communication (if required)
```
Subject: Service Restoration Complete

We experienced a brief service disruption and have restored normal operations.

Timeline:
• 2:15 PM PT - Issue detected
• 2:18 PM PT - Rollback initiated
• 2:22 PM PT - Services restored
• Total downtime: 7 minutes

Impact: Some verification requests may have failed during this window.
Action Required: Please retry any failed operations.

We apologize for the inconvenience and are investigating to prevent recurrence.
```

### Stakeholder Update
```
• CEO/CTO: Immediate notification
• Customer Success: Impact assessment
• Sales Team: Customer communication talking points
• Legal/Compliance: Regulatory notification requirements
```

## Post-Rollback Procedures

### Incident Documentation
1. **Root Cause Analysis** within 24 hours
2. **Incident Timeline** with precise timestamps
3. **Impact Assessment** (customers, revenue, compliance)
4. **Action Items** with owners and due dates
5. **Prevention Measures** to avoid recurrence

### Technical Cleanup
```bash
# Clean up failed deployment artifacts
kubectl delete pods -n production -l version=v1.2.3 --grace-period=30

# Remove problematic container images
docker image rm chai-vc/backend:v1.2.3

# Update deployment tracking
./scripts/update_deployment_log.sh --action=rollback --from=v1.2.3 --to=v1.2.2
```

### Monitoring & Alerting
- **Enhanced monitoring** for related metrics for 48 hours
- **Lower alert thresholds** temporarily to catch similar issues
- **Additional health checks** in affected areas
- **Review alert configuration** to improve detection time

## Recovery Planning

### Re-deployment Strategy
1. **Fix identification** and testing in staging
2. **Incremental rollout** with canary deployment
3. **Enhanced monitoring** during re-deployment
4. **Rollback plan** updated based on lessons learned

### Testing Requirements Before Re-deployment
- [ ] **Unit tests** pass with 100% coverage on changed code
- [ ] **Integration tests** validate all API contracts
- [ ] **Performance tests** show no regression
- [ ] **Security scan** shows no new vulnerabilities
- [ ] **Staging deployment** successful with full smoke tests
- [ ] **Load testing** on staging environment

## Owners & Contacts

### Incident Response Team
- **Incident Commander**: @sre-team-lead (primary decision maker)
- **Engineering Lead**: @backend-team-lead (technical execution)
- **Product Owner**: @product-lead (business impact assessment)
- **Customer Success**: @support-team-lead (customer communication)

### Escalation Chain
1. **On-call Engineer** (immediate response)
2. **SRE Team Lead** (tactical decisions)
3. **Engineering Manager** (resource allocation)
4. **CTO** (strategic decisions, external communication)

### 24/7 Contacts
- **Emergency Hotline**: 1-800-CHAI-VC-EMERG
- **PagerDuty**: chai-vc-production-critical
- **Slack**: #incident-response (war room)
- **Conference Bridge**: [Meeting link for war room]