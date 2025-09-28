generated-by: Claude 2025-09-26T00:00:00Z
# Incident Runbook: Key Compromise

## Scope
Response plan for cryptographic signing key compromise (issuers, verifiers, or platform root).

## Immediate Actions (0–15m)
- Revoke affected keys
- Rotate to new keys (multi-party generation)
- Pause issuance services (verification read-only)
- Engage incident commander

## Communication
- Notify affected issuers/verifiers
- External comms template: see `docs/key-compromise-legal-notifications.md`
- Status page update within 15m

## Recovery
- Reissue affected credentials
- Validate monitoring/alerts
- Third-party forensic report

## Post-Incident
- Root cause analysis (RCA) within 24h
- Regulatory notifications within required windows (HIPAA/GDPR/CCPA)
- Security posture updates