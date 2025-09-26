generated-by: Claude 2025-09-26T00:00:00Z
# Backup & Restore SOP

## Database Backup Procedures

### Automated Daily Backups
```bash
# PostgreSQL backup with encryption
pg_dump -h $DB_HOST -U $DB_USER -d chai_vc_prod \
  --verbose --clean --create --if-exists \
  | gpg --encrypt --recipient backup@chai-vc.com \
  > /backups/daily/chai_vc_$(date +%Y%m%d_%H%M%S).sql.gpg

# Verify backup integrity
./scripts/verify_backup.sh /backups/daily/chai_vc_$(date +%Y%m%d)*.sql.gpg
```

### Full System Backup (Weekly)
```bash
# Complete system state backup
./scripts/full_backup.sh --environment=production --encrypt=true

# Backup includes:
# - Database dump (PostgreSQL)
# - Redis state
# - Configuration files
# - SSL certificates
# - Application logs (last 30 days)
# - Uploaded documents (encrypted)
```

### Backup Verification
```bash
# Test backup restore to staging
./scripts/test_restore.sh --backup-file=/backups/daily/latest.sql.gpg --target=staging

# Verify data integrity
./scripts/backup_integrity_check.sh --backup=/backups/daily/latest.sql.gpg
```

## Key Material Backup

### HSM Key Backup
```bash
# Export key shares (requires M of N key holders)
hsm-tool export-key-shares --key-id=master-signing-key \
  --output=/secure-backup/key-shares/ \
  --encrypt-with=backup-public-key.pem

# Verify key share integrity
hsm-tool verify-shares --shares-dir=/secure-backup/key-shares/
```

### Encryption Key Backup
```bash
# Backup database encryption keys
vault kv get -field=key secret/database/encryption-key | \
  gpg --encrypt --recipient backup@chai-vc.com \
  > /secure-backup/db-encryption-key-$(date +%Y%m%d).gpg

# Backup application signing keys
vault kv get -field=private_key secret/jwt/signing-key | \
  gpg --encrypt --recipient backup@chai-vc.com \
  > /secure-backup/jwt-signing-key-$(date +%Y%m%d).gpg
```

### Key Recovery Testing
```bash
# Quarterly key recovery test
./scripts/test_key_recovery.sh --key-type=all --target=test-environment

# Verify recovered keys work
./scripts/validate_recovered_keys.sh --environment=test
```

## Restore Procedures

### Database Restore
```bash
# Stop application services
kubectl scale deployment backend-api --replicas=0 -n production

# Decrypt and restore database
gpg --decrypt /backups/daily/chai_vc_20250926_120000.sql.gpg | \
  psql -h $DB_HOST -U $DB_USER -d chai_vc_prod

# Verify restore integrity
./scripts/post_restore_validation.sh

# Restart services
kubectl scale deployment backend-api --replicas=3 -n production
```

### Point-in-Time Recovery
```bash
# Restore to specific timestamp (requires WAL archives)
./scripts/pitr_restore.sh --timestamp="2025-09-26 14:30:00" \
  --target-database=chai_vc_recovery \
  --validate=true
```

### Disaster Recovery (Full System)
```bash
# Complete system restore from backup
./scripts/disaster_recovery.sh --backup-date=2025-09-26 \
  --target-environment=production-dr \
  --validate-all=true

# Steps included:
# 1. Infrastructure provisioning
# 2. Database restore with validation
# 3. Key material recovery
# 4. Application deployment
# 5. Configuration restoration
# 6. SSL certificate installation
# 7. DNS failover preparation
```

## Backup Storage & Retention

### Storage Locations
```yaml
primary_backups:
  location: "AWS S3 - us-west-2"
  encryption: "AES-256 + GPG"
  retention: "90 days"

secondary_backups:
  location: "Azure Blob - west-us"
  encryption: "AES-256 + GPG"
  retention: "90 days"

long_term_archives:
  location: "AWS Glacier Deep Archive"
  encryption: "AES-256 + GPG"
  retention: "7 years (compliance requirement)"

key_backups:
  location: "Physical secure facility + cloud HSM"
  encryption: "Hardware security module + multi-party"
  retention: "Indefinite (until key rotation)"
```

### Retention Policy
- **Daily Backups**: 30 days (rolling)
- **Weekly Full Backups**: 12 weeks (quarterly)
- **Monthly Archives**: 12 months (annual compliance)
- **Annual Archives**: 7 years (HIPAA requirement)
- **Key Material**: Until next key rotation + 1 year

### Backup Monitoring
```bash
# Monitor backup job status
./scripts/backup_status.sh --check-last-24h

# Expected output:
# ✅ Daily backup: Completed 02:15 AM
# ✅ Integrity check: Passed
# ✅ Remote sync: Completed 02:45 AM
# ✅ Key backup: Completed (monthly schedule)

# Alert if backup fails
if ! ./scripts/backup_status.sh --silent; then
  ./scripts/alert_backup_failure.sh --severity=critical
fi
```

## Recovery Testing

### Monthly Recovery Test
```bash
# Test restore to isolated environment
./scripts/monthly_recovery_test.sh --date=$(date +%Y-%m-01)

# Test includes:
# - Database restore and validation
# - Key recovery and functionality
# - Application startup and health checks
# - API functionality verification
# - Performance baseline validation
```

### Disaster Recovery Drill (Quarterly)
```bash
# Full DR drill with timeline
./scripts/dr_drill.sh --scenario=complete_outage --measure_rto_rpo=true

# Metrics tracked:
# - RTO (Recovery Time Objective): Target <4 hours
# - RPO (Recovery Point Objective): Target <1 hour
# - Data integrity validation: 100%
# - Service functionality: All critical paths
```

## Emergency Procedures

### Data Corruption Response
```bash
# Immediate response to suspected data corruption
# 1. Stop write operations
kubectl patch deployment backend-api -p '{"spec":{"template":{"metadata":{"annotations":{"readonly":"true"}}}}}'

# 2. Assess corruption scope
./scripts/corruption_assessment.sh --full-scan=true

# 3. Point-in-time recovery to last known good state
./scripts/emergency_pitr.sh --target-time="last_known_good" --validate=true

# 4. Restore services with validation
./scripts/restore_validation.sh --comprehensive=true
```

### Ransomware Response
```bash
# Ransomware incident response
# 1. Isolate systems immediately
./scripts/isolate_production.sh --emergency=true

# 2. Assess backup integrity (check for encryption)
./scripts/backup_integrity_emergency.sh --scan-for-encryption=true

# 3. Restore from oldest verified clean backup
./scripts/restore_from_clean_backup.sh --verify-clean=true --date=verified_clean_date

# 4. Rebuild systems from scratch if needed
./scripts/infrastructure_rebuild.sh --from-backup=true
```

## Compliance & Audit

### HIPAA Requirements
- **Backup Encryption**: All backups encrypted at rest and in transit
- **Access Controls**: Multi-person authorization for restore operations
- **Audit Logging**: Complete audit trail of backup/restore activities
- **Retention**: 7-year minimum retention for compliance archives

### SOC 2 Requirements
- **Backup Monitoring**: Automated monitoring with alert escalation
- **Recovery Testing**: Quarterly testing with documented results
- **Change Management**: Approved procedures for backup/restore modifications
- **Incident Response**: Integration with incident response procedures

### Documentation Requirements
```bash
# Generate compliance report
./scripts/backup_compliance_report.sh --period=quarterly --format=pdf

# Report includes:
# - Backup success/failure rates
# - Recovery test results
# - Compliance metric compliance
# - Security incident related to backups
# - Retention policy adherence
```

## Owners & Responsibilities

### Backup Operations
- **Daily Operations**: @sre-team (automated monitoring)
- **Recovery Testing**: @sre-team + @backend-team (monthly)
- **Disaster Recovery**: @sre-team-lead (quarterly drills)
- **Compliance Reporting**: @legal-compliance (audit support)

### Emergency Response
- **Data Corruption**: @database-team (technical lead)
- **Security Incidents**: @security-team (incident command)
- **Business Continuity**: @business-continuity-team (coordination)
- **External Communication**: @cto (stakeholder updates)

### 24/7 Emergency Contacts
- **Backup System Emergency**: backup-emergency@chai-vc.com
- **PagerDuty Escalation**: chai-vc-backup-critical
- **Vendor Support**: AWS/Azure premium support hotlines