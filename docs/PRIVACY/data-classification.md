generated-by: Claude 2025-09-26T00:00:00Z
# PII/PHI Data Classification

## Classification Levels

### PHI (Protected Health Information) - HIPAA
- **Medical license numbers**
- **Provider NPI numbers**
- **Patient-provider interaction records**
- **Health plan information**
- **Medical education transcripts with health info**

### PII (Personally Identifiable Information)
- **Names and addresses**
- **Social Security Numbers**
- **Government-issued ID numbers**
- **Biometric identifiers**
- **Email addresses (when linked to health info)**

### Professional Information
- **Medical specialties**
- **Board certifications**
- **Professional references**
- **Employment history**
- **License statuses (when not linked to PHI)**

## Data Boundaries

### Backend Systems
```yaml
phi_handling:
  storage: "encrypted_at_rest_aes256"
  transit: "tls_1.3_minimum"
  access: "minimum_necessary_rbac"
  retention: "7_years_regulatory_requirement"

pii_handling:
  storage: "encrypted_at_rest_aes256"
  transit: "tls_1.3_minimum"
  access: "role_based_access_control"
  retention: "per_gdpr_ccpa_requirements"
```

### Blockchain/Public Ledger
```yaml
allowed:
  - "credential_hashes"
  - "zero_knowledge_proofs"
  - "issuer_did_identifiers"
  - "schema_references"

prohibited:
  - "raw_pii_phi"
  - "personally_identifiable_hashes"
  - "medical_information"
  - "contact_information"
```

## Redaction/Limits

### API Responses
- **Production**: Full redaction of PHI/PII in logs
- **Staging**: Masked data only (test@example.com → t***@***.com)
- **Development**: Synthetic data only

### Audit Logs
- **Access Events**: Log who accessed what, not content
- **Data Changes**: Log fact of change, not values
- **Search Queries**: Log query patterns, not results

## Owners
- **Data Classification**: @privacy-officer
- **Technical Implementation**: @backend-team
- **Compliance Verification**: @legal-compliance