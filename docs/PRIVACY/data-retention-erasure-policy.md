# Data Retention & Erasure Policy (MVP)

**generated-by: Claude 2025-01-15T10:30:00Z**

## Intent
Minimal viable policy for PHI data retention and cryptographic erasure in blockchain healthcare system.

## Steps/How-to

### 1. Data Classification
```yaml
on_chain_data:
  - Cryptographic hashes only (SHA-256)
  - Zero-knowledge proofs
  - Public verification keys
  - NO PHI or PII stored on-chain

off_chain_data:
  - Encrypted PHI (AES-256-GCM)
  - Healthcare credentials
  - User authentication data
  - Audit logs (structured, no PHI)
```

### 2. Retention Windows
```yaml
healthcare_data:
  medical_licenses: "7 years post-expiry (HIPAA)"
  verification_logs: "10 years (audit requirement)"
  user_accounts: "7 years post-deletion request"

system_data:
  application_logs: "2 years"
  security_logs: "5 years"
  blockchain_hashes: "permanent (no PHI)"
```

### 3. Cryptographic Erasure Process
```bash
# For immediate PHI deletion (right to be forgotten)
# Step 1: Delete encryption keys from HSM
vault delete secret/healthcare-keys/${RECORD_ID}

# Step 2: Verify key deletion
vault read secret/healthcare-keys/${RECORD_ID} || echo "KEY_DELETED"

# Step 3: Mark on-chain record as deleted (hash remains but meaningless)
substrate-cli tx credential-registry mark-deleted ${RECORD_HASH}
```

### 4. GDPR Erasure Implementation
```typescript
async function processErasureRequest(dataSubjectId: string) {
  // 1. Find all associated records
  const records = await db.find({ dataSubjectId });

  // 2. Delete encryption keys (makes data unrecoverable)
  await keyService.deleteKeys(records.map(r => r.keyId));

  // 3. Remove off-chain data
  await db.delete({ dataSubjectId });

  // 4. On-chain hashes remain but are now meaningless
  return { status: 'ERASED', recordCount: records.length };
}
```

### 5. Automated Retention Enforcement
```bash
# Daily cleanup cron job
0 2 * * * /scripts/retention-cleanup.sh

# retention-cleanup.sh content:
#!/bin/bash
# Find expired records
psql -c "SELECT id FROM healthcare_records WHERE expires_at < NOW() - INTERVAL '7 years'"

# Delete encryption keys for expired records
for record_id in $(psql -t -c "SELECT key_id FROM expired_healthcare_records"); do
    vault delete secret/healthcare-keys/$record_id
done

# Remove expired off-chain data
psql -c "DELETE FROM healthcare_records WHERE expires_at < NOW() - INTERVAL '7 years'"
```

## Owners
- **Privacy Officer**: Policy compliance and GDPR requests
- **Security Team**: Key management and cryptographic erasure
- **Database Team**: Off-chain data lifecycle management
- **Legal Team**: Retention window validation

## Risks/Notes
- **REVIEW: Legal** - Confirm 7-year retention meets state requirements
- **Key Recovery**: Deleted keys cannot be recovered (by design)
- **Audit Trail**: Deletion events logged but not the deleted content
- **Blockchain Immutability**: On-chain hashes permanent but meaningless without keys
- **Cross-Border**: EU GDPR vs US HIPAA compliance considerations need review

**Emergency Erasure Hotline**: privacy-emergency@chai-vc.com