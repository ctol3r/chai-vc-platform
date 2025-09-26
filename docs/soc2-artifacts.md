# SOC 2 Artifacts Inventory

**generated-by: Claude 2025-01-15T10:30:00Z**

## Intent
Catalog existing evidence for SOC 2 Type II audit across Trust Service Categories with owners and locations.

## Steps/How-to

### Security (CC6.1-CC6.8)
| Evidence | Owner | Location | Status |
|----------|--------|----------|---------|
| Access control policies | @security-team | `docs/security/access-control.md` | ✅ Ready |
| Multi-factor authentication logs | @platform-engineering | CloudWatch `/aws/cognito/` | ✅ Ready |
| Vulnerability scan reports | @security-team | `security/scans/quarterly/` | ✅ Ready |
| Penetration test results | @external-auditors | `security/pentests/2024-q4.pdf` | ✅ Ready |
| Security incident logs | @security-team | SIEM dashboard + `logs/security/` | ✅ Ready |
| Encryption key management | @platform-engineering | HashiCorp Vault audit logs | ✅ Ready |
| Code review evidence | @engineering-leads | GitHub PR reviews, branch protection | ✅ Ready |
| Security training records | @hr-team | LMS completion reports | 🔄 In Progress |

### Availability (CC7.1-CC7.2)
| Evidence | Owner | Location | Status |
|----------|--------|----------|---------|
| Uptime monitoring | @sre-team | Datadog SLI/SLO dashboards | ✅ Ready |
| Incident response logs | @on-call-team | PagerDuty + `docs/incidents/` | ✅ Ready |
| Backup procedures | @database-team | `ops/backup-procedures.md` | ✅ Ready |
| Disaster recovery testing | @sre-team | `tests/dr/quarterly-tests.md` | 🔄 Q1 2025 |
| Capacity planning reports | @platform-engineering | `metrics/capacity/monthly/` | ✅ Ready |
| Performance monitoring | @sre-team | Prometheus + Grafana dashboards | ✅ Ready |

### Processing Integrity (CC8.1)
| Evidence | Owner | Location | Status |
|----------|--------|----------|---------|
| Data validation controls | @backend-team | Unit tests, input validation code | ✅ Ready |
| Transaction audit logs | @database-team | PostgreSQL audit extension logs | ✅ Ready |
| Healthcare workflow validation | @healthcare-team | HITL review logs, `docs/workflows/` | ✅ Ready |
| Cryptographic proof verification | @crypto-team | ZK proof verification logs | ✅ Ready |
| API rate limiting evidence | @platform-engineering | Kong rate limiting logs | ✅ Ready |

### Confidentiality (CC9.1)
| Evidence | Owner | Location | Status |
|----------|--------|----------|---------|
| Encryption at rest evidence | @database-team | RDS encryption configuration | ✅ Ready |
| Encryption in transit evidence | @platform-engineering | TLS certificate management | ✅ Ready |
| PHI data classification | @privacy-officer | `docs/PRIVACY/data-classification.md` | ✅ Ready |
| Zero-knowledge proof implementation | @crypto-team | Circuit code + security proofs | ✅ Ready |
| Key rotation procedures | @security-team | Vault key rotation logs | ✅ Ready |

### Privacy (CC10.1-CC10.2)
| Evidence | Owner | Location | Status |
|----------|--------|----------|---------|
| Privacy policy | @legal-team | Website `/privacy` + version control | ✅ Ready |
| GDPR compliance documentation | @privacy-officer | `docs/PRIVACY/gdpr-compliance.md` | ✅ Ready |
| Data retention policies | @privacy-officer | `docs/PRIVACY/data-retention-erasure-policy.md` | ✅ Ready |
| User consent management | @frontend-team | Consent management platform logs | ✅ Ready |
| Data subject request handling | @privacy-officer | GDPR request tracking system | ✅ Ready |
| HIPAA Business Associate Agreements | @legal-team | `legal/contracts/hipaa-baa/` | ✅ Ready |

## Owners
- **Primary**: @compliance-officer (SOC 2 program management)
- **Technical**: @security-team, @sre-team (evidence collection)
- **Legal**: @legal-team (policy documentation)
- **Privacy**: @privacy-officer (privacy controls)

## Risks/Notes
- **Missing**: Security training completion reports (Q1 2025 target)
- **Pending**: DR testing documentation (scheduled Q1 2025)
- **REVIEW: Legal** - Ensure all privacy policies meet current regulatory requirements
- **Audit Timeline**: Type II audit scheduled for Q2 2025
- **Evidence Retention**: All artifacts must be retained for 3 years post-audit

**Artifact Collection Commands:**
```bash
# Generate evidence package
./scripts/collect-soc2-evidence.sh

# Audit log export (last 12 months)
./scripts/export-audit-logs.sh --period=12months --format=pdf
```