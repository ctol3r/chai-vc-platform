generated-by: Claude 2025-09-26T00:00:00Z
# Security Review Checklist

## Cryptographic Changes
- [ ] Key generation uses secure randomness
- [ ] Proper key storage (HSM/Vault)
- [ ] Key rotation procedures documented
- [ ] Zero-knowledge proofs independently verified
- [ ] Signature schemes follow best practices

## Authentication/Authorization
- [ ] JWT tokens properly validated
- [ ] RBAC permissions correctly enforced
- [ ] Session management secure
- [ ] API rate limiting in place
- [ ] Input validation comprehensive

## Data Protection
- [ ] PII/PHI encryption at rest
- [ ] TLS encryption in transit
- [ ] Data minimization applied
- [ ] Retention policies followed
- [ ] Audit logging complete

## Infrastructure
- [ ] Network segmentation proper
- [ ] Container security hardening
- [ ] Secrets management secure
- [ ] Monitoring/alerting configured
- [ ] Backup encryption enabled

## Code Quality
- [ ] Static analysis clean
- [ ] Dependency vulnerabilities resolved
- [ ] Error handling doesn't leak information
- [ ] Security tests written
- [ ] Third-party code reviewed

## Owners
- **Review Required**: @security-team
- **Approval Authority**: @ciso