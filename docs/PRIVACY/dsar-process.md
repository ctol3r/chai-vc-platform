generated-by: Claude 2025-09-26T00:00:00Z
# Data Subject Access Request (DSAR) Process

## Purpose
Handle GDPR Article 15 (Right of Access) and CCPA requests for personal data access, portability, and deletion.

## Request Types
- **Access Request**: Provide copy of personal data
- **Portability Request**: Export data in machine-readable format
- **Deletion Request**: Erase personal data (Right to be Forgotten)
- **Rectification Request**: Correct inaccurate personal data

## Process Steps

### 1. Request Intake (SLA: 24 hours)
```bash
# Log request in tracking system
curl -X POST /api/admin/dsar \
  -d '{
    "type": "ACCESS|DELETION|PORTABILITY|RECTIFICATION",
    "subject_id": "user@example.com",
    "request_date": "2025-09-26T12:00:00Z",
    "verification_method": "email_verification"
  }'
```

### 2. Identity Verification (SLA: 48 hours)
- Email verification for basic requests
- Government ID + biometric for sensitive PHI
- Legal representative documentation (if applicable)

### 3. Data Location & Retrieval (SLA: 72 hours)
```bash
# Search across all systems
./scripts/dsar_search.sh --subject="did:example:123" --type="pii_phi"
# Output: list of databases, files, backups containing subject data
```

### 4. Legal Review (SLA: 5 days)
- Verify legitimate interest vs subject rights
- Check for law enforcement holds
- Assess third-party data implications
- Document legal basis for any processing continuation

### 5. Data Preparation (SLA: 15 days)
```bash
# Access request - generate export package
./scripts/dsar_export.sh --subject="did:example:123" --format="json"

# Deletion request - mark for erasure
./scripts/dsar_delete.sh --subject="did:example:123" --verify-backup-purge
```

### 6. Response Delivery (SLA: 30 days total)
- Secure delivery via encrypted email or portal
- Document delivery confirmation
- Update subject rights register

## Data Sources

### Primary Systems
- **PostgreSQL Database**: User profiles, credentials, audit logs
- **File Storage**: Uploaded documents, certificates
- **Blockchain**: Hashes only (pseudonymized)
- **Logs**: Application logs, access logs, security logs

### Backup Systems
- **Database Backups**: 7-year retention
- **Encrypted Archives**: Long-term compliance storage
- **Disaster Recovery**: Offsite backup verification

## Technical Implementation

### Access Request Response
```json
{
  "subject_id": "did:example:123",
  "personal_data": {
    "profile": {
      "name": "[REDACTED - AVAILABLE UPON VERIFICATION]",
      "email": "user@example.com",
      "created": "2024-01-01T00:00:00Z"
    },
    "credentials": [
      {
        "type": "MedicalLicense",
        "issued": "2024-06-15T10:30:00Z",
        "status": "active"
      }
    ],
    "processing_activities": [
      {
        "purpose": "credential_verification",
        "legal_basis": "legitimate_interest",
        "retention_period": "7_years"
      }
    ]
  }
}
```

### Deletion Confirmation
```json
{
  "subject_id": "did:example:123",
  "deletion_completed": "2025-09-26T15:30:00Z",
  "systems_purged": [
    "primary_database",
    "file_storage",
    "application_logs",
    "backup_systems"
  ],
  "retained_data": [
    {
      "type": "transaction_hash",
      "reason": "blockchain_immutability",
      "pseudonymized": true
    }
  ]
}
```

## Owners & SLAs

### Response Team
- **DSAR Coordinator**: @privacy-officer (overall process)
- **Technical Implementation**: @backend-team (data extraction)
- **Legal Review**: @legal-compliance (rights assessment)
- **Customer Support**: @support-team (communication)

### SLA Timeline
- **Initial Response**: 24 hours
- **Identity Verification**: 48 hours
- **Legal Assessment**: 5 business days
- **Complete Response**: 30 calendar days (GDPR requirement)
- **Complex Cases**: 60 days (with notification to subject)

### Escalation
- **Day 20**: Alert privacy officer if delayed
- **Day 25**: Executive escalation required
- **Day 30**: Regulatory breach notification preparation

## Compliance Notes
- All DSAR activities logged for audit
- Regular training for response team
- Annual process review and updates
- Coordination with data processors/vendors