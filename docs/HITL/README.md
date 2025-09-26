# Human-in-the-Loop (HITL) Review System

**generated-by: Claude 2025-01-15T10:30:00Z**

## Intent
Overview of reviewer queue system for healthcare credential verification with acceptance criteria and audit requirements.

## Steps/How-to

### 1. Reviewer Queue Overview
```yaml
queue_types:
  emergency:
    sla: "30 minutes"
    criteria: "Patient safety impact, emergency credentialing"
    reviewers: "Senior medical coordinators + CMO approval"

  urgent:
    sla: "4 hours"
    criteria: "High-risk specialties, complex multi-state licenses"
    reviewers: "Certified credentialing specialists"

  standard:
    sla: "24 hours"
    criteria: "Routine verifications, AI confidence >90%"
    reviewers: "Junior credentialing coordinators"
```

### 2. Review Assignment
```bash
# Auto-assignment based on AI confidence
if confidence < 85%: queue = "urgent"
if specialty in ["surgery", "anesthesia", "emergency"]: queue = "urgent"
if multi_state_license: queue = "urgent"
else: queue = "standard"

# Manual escalation
curl -X POST /api/hitl/escalate \
  -d '{"credentialId": "ID", "reason": "Complex case", "targetQueue": "emergency"}'
```

### 3. Acceptance Criteria

#### Success Criteria (All Must Pass)
```yaml
credential_approval_requires:
  - Primary source verification (state medical board API response = "active")
  - Background check completion (no disqualifying actions in last 7 years)
  - Education verification (medical school transcript + LCME accreditation)
  - Current malpractice insurance ($1M+ coverage, expires >90 days)
  - Peer references (minimum 2 verified, rating ≥7/10)
  - Specialty board certification (if applicable, current within 10 years)
  - Identity verification (government ID + biometric match >95%)
```

#### Automatic Rejection Triggers
```yaml
automatic_rejection_triggers:
  - Active license suspension or probation
  - Unreported malpractice claims >$100K
  - Criminal convictions (felony or healthcare-related misdemeanor)
  - Falsified application information (any field)
  - Expired credentials without renewal in progress
  - Failed identity verification (<95% biometric match)
  - Missing required documentation after 48h notice
```

#### Pass/Fail Test Cases
```bash
# PASS example
{
  "license_status": "active",
  "background_clear": true,
  "education_verified": true,
  "insurance_valid": true,
  "references_count": 3,
  "identity_match": 0.97,
  "decision": "APPROVE"
}

# FAIL example
{
  "license_status": "probation",
  "background_clear": false,
  "malpractice_claims": 150000,
  "decision": "REJECT",
  "reason": "Active probation + unreported claims"
}
```

### 4. Review Process
```bash
# Reviewer workflow
1. Access review queue: GET /api/hitl/queue/{reviewerId}
2. Claim credential: POST /api/hitl/claim/{credentialId}
3. Review documentation: GET /api/hitl/credential/{credentialId}/documents
4. Make decision: POST /api/hitl/decision
   {
     "decision": "APPROVE|REJECT|REQUEST_INFO|ESCALATE",
     "conditions": ["supervision_required", "limited_scope"],
     "notes": "Detailed rationale",
     "confidence": 8
   }
5. Submit decision: PUT /api/hitl/submit/{credentialId}
```

### 5. Audit Logging Requirements
```typescript
// Every HITL action must log:
interface HITLAuditEvent {
  timestamp: string;
  reviewerId: string;
  credentialId: string;
  action: "CLAIM" | "REVIEW" | "APPROVE" | "REJECT" | "ESCALATE";
  duration: number; // seconds
  decision_rationale: string;
  patient_safety_assessment: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  compliance_checked: boolean;
  peer_review_required: boolean;
}
```

### 6. Performance Metrics
```bash
# Queue health monitoring
curl /api/hitl/metrics | jq '.queue_stats'
{
  "emergency_queue_size": 2,
  "urgent_queue_size": 15,
  "standard_queue_size": 47,
  "avg_review_time": "18 minutes",
  "sla_compliance": "94.2%"
}

# Reviewer performance
curl /api/hitl/reviewer/{id}/stats | jq '.performance'
{
  "reviews_completed_today": 12,
  "avg_review_time": "22 minutes",
  "accuracy_score": "96%",
  "escalation_rate": "8%"
}
```

## Owners
- **HITL System**: @healthcare-team (queue management, workflow)
- **Review Quality**: @chief-medical-officer (clinical oversight)
- **Audit Compliance**: @compliance-officer (logging, reporting)
- **Technical Support**: @platform-engineering (system maintenance)

## Risks/Notes
- **Patient Safety**: Emergency queue delays directly impact patient care
- **Regulatory**: All decisions must meet Joint Commission standards
- **Audit Trail**: Complete logging required for malpractice defense
- **REVIEW: Legal** - Ensure reviewer liability protection and insurance coverage
- **Scalability**: Current system handles ~200 reviews/day, plan for 1000+

**Emergency Escalation:**
- Queue backup >4 hours: Page @chief-medical-officer
- Patient safety concern: Immediate escalation to clinical leadership
- System down: Activate manual backup procedures

**HITL Dashboard**: https://app.chai-vc.com/hitl/dashboard

## Data Retention & Privacy

### Retention Policy
All HITL review data follows the privacy policy defined in `docs/PRIVACY/data-retention-erasure-policy.md`:

```yaml
retention_schedule:
  review_decisions: 7_years  # regulatory requirement
  audit_logs: 7_years       # compliance + legal defense
  reviewer_notes: 2_years   # operational improvement
  biometric_data: 90_days   # identity verification only

erasure_triggers:
  - Subject request (GDPR/CCPA Article 17)
  - Retention period expiry
  - Legal hold removal
  - Credential revocation + 30 days
```

### Privacy Controls
- All PII encrypted at rest (AES-256)
- Access logs for all PHI/PII access
- Reviewer access limited to assigned cases
- Automatic redaction after retention period
- No cross-border data transfer without adequacy

> See `docs/PRIVACY/data-retention-erasure-policy.md` for complete retention matrix and erasure procedures.