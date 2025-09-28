# Security Runbook: Verification Outage

**generated-by: Claude 2025-01-15T10:30:00Z**

## Intent
On-call response procedures for healthcare credential verification outages with patient safety considerations.

## Steps/How-to

### 1. Immediate Response (0-5 min)
```bash
# Verify outage
curl -f https://api.chai-vc.com/verification/health || echo "OUTAGE CONFIRMED"

# Check system status
kubectl get pods -l app=verification-service
docker-compose ps | grep verification

# Alert team
slack-cli send "#healthcare-emergency" "🚨 VERIFICATION OUTAGE: Patient safety impact possible"
```

### 2. Triage & Assessment (5-15 min)
```bash
# Service logs
kubectl logs -l app=verification-service --tail=100
tail -f /var/log/verification-service/error.log

# Database connectivity
pg_isready -h $DB_HOST -p $DB_PORT

# Dependencies check
curl -f https://api.chai-vc.com/health/dependencies
```

**Patient Impact Assessment:**
- Emergency credentialing blocked → **CRITICAL** (page CEO)
- Standard verification slow → **HIGH** (notify stakeholders)
- Background processes affected → **MEDIUM** (standard response)

### 3. Escalation Matrix
```yaml
CRITICAL (patient safety):
  - Immediate: @on-call-engineer, @security-lead
  - Within 15min: @cto, @ceo, @chief-medical-officer
  - Communication: All healthcare customers

HIGH (service degraded):
  - Within 30min: @platform-team, @customer-success
  - Communication: Affected customers only

MEDIUM (non-critical):
  - Within 1hr: @backend-team
  - Communication: Internal only
```

### 4. Communication Template
```text
Subject: [URGENT] Healthcare Verification Service Issue

Healthcare Partners,

We are experiencing an issue with our credential verification service that may delay medical professional credentialing.

Status: [INVESTIGATING/IDENTIFIED/RESOLVING]
Impact: [Emergency/Routine] credentialing affected
ETA: [TIME] for resolution

Alternative: Manual verification available at +1-555-CHAI-911

Updates: Every 30 minutes until resolved

Chai VC Platform Team
```

### 5. Recovery Actions
```bash
# Database failover
kubectl patch service postgres-primary -p '{"spec":{"selector":{"role":"replica"}}}'

# Service restart
kubectl rollout restart deployment/verification-service

# Cache clear
redis-cli FLUSHDB

# Health verification
for i in {1..10}; do curl -f https://api.chai-vc.com/verification/health && break; sleep 30; done
```

## Owners
- **On-Call Engineer**: Primary response, technical recovery
- **Security Lead**: Security incident assessment
- **Customer Success**: Healthcare customer communication
- **CEO/CTO**: Executive decisions for patient safety issues

## Risks/Notes
- **Patient Safety**: Any delay in emergency credentialing is CRITICAL
- **Legal**: HIPAA breach assessment required if PHI exposed
- **Compliance**: Document all actions for regulatory audit
- **REVIEW: Legal** - Ensure communication templates meet regulatory requirements

**Emergency Contacts:**
- On-call: +1-555-ONCALL
- Healthcare hotline: +1-555-CHAI-911
- Security team: security-emergency@chai-vc.com