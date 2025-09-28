generated-by: Claude 2025-09-26T00:00:00Z
# Audit Evidence Collection Plan

## Automated Evidence Collection

### Daily Collection
```bash
# System health metrics
curl -s http://localhost:3000/metrics | grep -E "(uptime|error_rate|response_time)" > evidence/daily/$(date +%Y-%m-%d)-metrics.txt

# Access logs aggregation
./scripts/collect_access_logs.sh --date=$(date +%Y-%m-%d) --output=evidence/daily/

# Security scan results
npm audit --json > evidence/daily/$(date +%Y-%m-%d)-security-scan.json
```

### Weekly Collection
```bash
# Code review evidence
gh pr list --state=merged --limit=50 --json number,title,reviewDecision > evidence/weekly/$(date +%Y-W%U)-code-reviews.json

# Training completion reports
./scripts/collect_training_evidence.sh --week=$(date +%Y-W%U)

# Backup verification
./scripts/verify_backups.sh --report-format=json > evidence/weekly/$(date +%Y-W%U)-backup-verification.json
```

### Monthly Collection
```bash
# Comprehensive system inventory
./scripts/system_inventory.sh --output=evidence/monthly/$(date +%Y-%m)-inventory.json

# Access review reports
./scripts/access_review_report.sh --month=$(date +%Y-%m)

# Vendor assessment updates
./scripts/vendor_evidence.sh --month=$(date +%Y-%m)
```

## Evidence Categories

### Security Controls (SOC 2 CC6)
| Control | Evidence Source | Automation Level | Storage |
|---------|----------------|------------------|---------|
| Access Management | Okta API logs | ✅ Automated | `evidence/security/access/` |
| MFA Enforcement | Authentication logs | ✅ Automated | `evidence/security/mfa/` |
| Vulnerability Management | Scanning reports | ✅ Automated | `evidence/security/vulns/` |
| Code Reviews | GitHub API | ✅ Automated | `evidence/security/reviews/` |
| Security Training | LMS API | 🔄 Semi-automated | `evidence/security/training/` |

### Availability Controls (SOC 2 CC7)
| Control | Evidence Source | Automation Level | Storage |
|---------|----------------|------------------|---------|
| Uptime Monitoring | Prometheus metrics | ✅ Automated | `evidence/availability/uptime/` |
| Incident Response | PagerDuty API | ✅ Automated | `evidence/availability/incidents/` |
| Backup Procedures | Backup verification scripts | ✅ Automated | `evidence/availability/backups/` |
| Capacity Planning | Resource utilization data | ✅ Automated | `evidence/availability/capacity/` |

### HIPAA Controls
| Control | Evidence Source | Automation Level | Storage |
|---------|----------------|------------------|---------|
| PHI Access Logs | Application audit logs | ✅ Automated | `evidence/hipaa/access/` |
| Encryption Verification | TLS/encryption audits | ✅ Automated | `evidence/hipaa/encryption/` |
| BAA Management | Contract management system | 🔄 Semi-automated | `evidence/hipaa/contracts/` |
| Training Records | LMS completion data | ✅ Automated | `evidence/hipaa/training/` |

## Automatable Milestones

### Q1 2025 Targets
- [ ] **100% automated security evidence collection**
  - GitHub API integration for code reviews
  - Okta API for access management evidence
  - Automated vulnerability scan aggregation

- [ ] **HIPAA audit trail automation**
  - PHI access logging with automated reports
  - Encryption status verification scripts
  - Training completion tracking

### Q2 2025 Targets
- [ ] **SOC 2 evidence dashboard**
  - Real-time compliance posture display
  - Automated gap detection and alerting
  - Evidence package generation for auditors

- [ ] **Continuous compliance monitoring**
  - Daily compliance checks with alerts
  - Automated remediation for common gaps
  - Integration with incident response

## Evidence Storage & Retention

### Storage Structure
```
evidence/
├── daily/
│   ├── 2025-09-26-metrics.txt
│   ├── 2025-09-26-access-logs.json
│   └── 2025-09-26-security-scan.json
├── weekly/
│   ├── 2025-W39-code-reviews.json
│   └── 2025-W39-training.json
├── monthly/
│   ├── 2025-09-inventory.json
│   └── 2025-09-access-review.json
└── auditor-packages/
    ├── soc2-type2-2025-q4/
    └── hipaa-assessment-2025/
```

### Retention Policy
- **Security Evidence**: 7 years (regulatory requirement)
- **Access Logs**: 7 years (HIPAA requirement)
- **Training Records**: 3 years (compliance standard)
- **System Metrics**: 2 years (operational need)
- **Audit Packages**: 7 years (legal requirement)

## Evidence Quality Assurance

### Automated Validation
```bash
# Daily evidence validation
./scripts/validate_evidence.sh --date=$(date +%Y-%m-%d)
# Checks: file completeness, data integrity, format compliance

# Weekly evidence review
./scripts/evidence_quality_check.sh --week=$(date +%Y-W%U)
# Checks: trend analysis, gap detection, alert generation
```

### Manual Review Points
- **Monthly**: Evidence completeness review by @legal-compliance
- **Quarterly**: Evidence quality audit by @audit-team
- **Annually**: Full evidence inventory and retention review

## Owners
- **Evidence Collection**: @backend-team (automation)
- **Quality Assurance**: @legal-compliance (validation)
- **Audit Coordination**: @audit-team (external interface)