# OID4VCI/VP Conformance Test Plan
**OpenID for Verifiable Credential Issuance & Verifiable Presentations**
**CHAI•VITALCV Healthcare Credentialing Platform**

## Overview

This test plan ensures conformance with OpenID4VCI and OpenID4VP specifications for healthcare credential issuance and presentation flows. Tests cover normal operations, edge cases, and failure scenarios to validate interoperability with standard-compliant wallets and verifiers.

**Standards Coverage**:
- OpenID for Verifiable Credential Issuance (OID4VCI) - Draft 13
- OpenID for Verifiable Presentations (OID4VP) - Draft 18
- Self-Issued OpenID Provider v2 (SIOPv2) - Draft 12

## Test Environment Setup

### Test Infrastructure
```yaml
# Test Environment Configuration
issuer_endpoint: "https://issuer-test.chai-vc.com"
verifier_endpoint: "https://verifier-test.chai-vc.com"
wallet_endpoints:
  - "https://wallet-test.chai-vc.com"  # Reference implementation
  - "https://microsoft-authenticator-test"  # Microsoft Authenticator
  - "https://lissi-wallet-test"  # Lissi Wallet

test_credentials:
  - medical_license
  - board_certification
  - continuing_education
  - malpractice_insurance
```

### Test Vectors
Standardized test data for reproducible testing across implementations.

```json
{
  "test_vectors": {
    "healthcare_provider_credential": {
      "credential_id": "urn:uuid:test-12345678-1234-1234-1234-123456789abc",
      "issuer": "did:web:test.chai-vc.com:issuer",
      "subject": "did:key:test-z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      "credential_type": "MedicalLicenseCredential",
      "claims": {
        "license_number": "MD123456",
        "state": "California",
        "specialty": "Internal Medicine",
        "issue_date": "2020-01-01",
        "expiry_date": "2025-01-01",
        "status": "active"
      }
    }
  }
}
```

---

## OID4VCI Conformance Tests

### 1. Credential Offer Flow Tests

#### TC-VCI-001: Authorization Code Flow
**Objective**: Test standard authorization code flow for credential issuance
**Specification**: OID4VCI Section 4.1

**Test Steps**:
1. Issuer generates credential offer with authorization code grant
2. Wallet processes offer and initiates authorization
3. User authenticates with issuer authorization server
4. Wallet receives authorization code
5. Wallet exchanges code for access token
6. Wallet requests credential using access token
7. Issuer returns signed verifiable credential

**Test Vector**:
```json
{
  "credential_offer": {
    "credential_issuer": "https://issuer-test.chai-vc.com",
    "credentials": ["MedicalLicenseCredential"],
    "grants": {
      "authorization_code": {
        "issuer_state": "test-state-12345"
      }
    }
  }
}
```

**Expected Result**: ✅ Valid credential received with proper signatures
**Failure Modes**:
- Invalid issuer_state → 400 Bad Request
- Expired authorization code → 400 Invalid Grant
- Malformed credential request → 422 Unprocessable Entity

#### TC-VCI-002: Pre-Authorized Code Flow
**Objective**: Test streamlined pre-authorized flow for known subjects
**Specification**: OID4VCI Section 4.2

**Test Vector**:
```json
{
  "credential_offer": {
    "credential_issuer": "https://issuer-test.chai-vc.com",
    "credentials": ["BoardCertificationCredential"],
    "grants": {
      "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
        "pre-authorized_code": "test-preauth-789xyz",
        "user_pin_required": true
      }
    }
  }
}
```

**Test Steps**:
1. Issuer provides pre-authorized code with PIN requirement
2. Wallet prompts user for PIN
3. Wallet exchanges pre-authorized code + PIN for access token
4. Wallet requests credential using access token
5. Credential issued without additional authorization

**Expected Result**: ✅ Credential issued after PIN validation
**Failure Modes**:
- Missing PIN → 400 Bad Request
- Invalid PIN → 401 Unauthorized
- Expired pre-authorized code → 400 Invalid Grant

#### TC-VCI-003: Batch Credential Issuance
**Objective**: Test multiple credential issuance in single flow
**Specification**: OID4VCI Section 7.2

**Test Vector**:
```json
{
  "credential_request": {
    "format": "jwt_vc_json",
    "credential_definition": {
      "type": ["VerifiableCredential", "MedicalCredentialBundle"],
      "credentialSubject": {
        "licenses": ["medical_license", "dea_registration"],
        "certifications": ["board_certification"]
      }
    },
    "proof": {
      "proof_type": "jwt",
      "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9..."
    }
  }
}
```

**Expected Result**: ✅ Bundle of related credentials returned
**Failure Modes**:
- Partial authorization → 403 Forbidden with details
- Mixed credential types → 422 Unprocessible Entity

### 2. Credential Format Tests

#### TC-VCI-004: JWT VC Format Support
**Objective**: Validate JWT Verifiable Credential format compliance
**Specification**: RFC 7519, W3C VC Data Model

**Test Vector**:
```json
{
  "credential_request": {
    "format": "jwt_vc_json",
    "credential_definition": {
      "type": ["VerifiableCredential", "MedicalLicenseCredential"]
    },
    "proof": {
      "proof_type": "jwt",
      "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJkaWQ6a2V5OnRlc3QtejZNa2hhWGdCWkR2b3REa0w1MjU3ZmFpenRpR2lDMlF0S0xHcGJubkVHdGEyZG9LIiwic3ViIjoiZGlkOmtleTp0ZXN0LXo2TWtoYVhnQlpEdm90RGtMNTI1N2ZhaXp0aUdpQzJRdEtMR3Bibm5FR3RhMmRvSyIsImF1ZCI6Imh0dHBzOi8vaXNzdWVyLXRlc3QuY2hhaS12Yy5jb20iLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MDk5NTUwMCwibm9uY2UiOiJ0ZXN0LW5vbmNlLTEyMzQ1In0.signature"
    }
  }
}
```

**Expected Result**: ✅ Valid JWT VC with proper header, payload, signature
**Validation Checks**:
- JWT header contains correct `alg` and `typ`
- Payload includes required VC fields (`iss`, `sub`, `vc`)
- Signature verification with issuer's public key
- Credential schema validation

#### TC-VCI-005: JSON-LD VC Format Support
**Objective**: Validate JSON-LD Verifiable Credential format
**Specification**: W3C VC Data Model, JSON-LD 1.1

**Test Vector**:
```json
{
  "credential_request": {
    "format": "ldp_vc",
    "credential_definition": {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schemas.chai-vc.com/medical-license/v1"
      ],
      "type": ["VerifiableCredential", "MedicalLicenseCredential"]
    }
  }
}
```

**Expected Result**: ✅ Valid JSON-LD VC with proof
**Validation Checks**:
- Proper `@context` array with required contexts
- Linked Data Proof with valid signature suite
- JSON-LD normalization produces consistent hash

### 3. DID Method Integration Tests

#### TC-VCI-006: DID Key Method Support
**Objective**: Test integration with did:key method
**Specification**: DID Key Method, did:key Method Spec

**Test Vector**:
```json
{
  "credential_subject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "type": "HealthcareProvider",
    "license": {
      "number": "MD123456",
      "state": "CA",
      "status": "active"
    }
  }
}
```

**Expected Result**: ✅ Credential issued to did:key subject
**Validation**: DID resolution and signature verification work

#### TC-VCI-007: DID Web Method Support
**Objective**: Test integration with did:web method for institutional DIDs
**Specification**: DID Web Method

**Test Vector**:
```json
{
  "issuer": "did:web:hospital.example.com:departments:cardiology",
  "credential_subject": {
    "id": "did:web:provider.example.com:doctors:john-doe",
    "affiliation": "did:web:hospital.example.com:departments:cardiology"
  }
}
```

**Expected Result**: ✅ Institutional credential with verifiable issuer DID
**Validation**: HTTPS DID document retrieval and signature verification

---

## OID4VP Conformance Tests

### 4. Presentation Request Flow Tests

#### TC-VP-001: Basic Presentation Request
**Objective**: Test simple credential presentation flow
**Specification**: OID4VP Section 5.1

**Test Vector**:
```json
{
  "presentation_definition": {
    "id": "medical_license_verification",
    "input_descriptors": [
      {
        "id": "medical_license",
        "format": {
          "jwt_vc_json": {
            "alg": ["ES256", "ES256K"]
          }
        },
        "constraints": {
          "fields": [
            {
              "path": ["$.vc.type"],
              "filter": {
                "type": "array",
                "contains": {
                  "const": "MedicalLicenseCredential"
                }
              }
            },
            {
              "path": ["$.vc.credentialSubject.status"],
              "filter": {
                "type": "string",
                "const": "active"
              }
            }
          ]
        }
      }
    ]
  }
}
```

**Test Steps**:
1. Verifier creates presentation request with specific requirements
2. Wallet receives and parses presentation definition
3. Wallet finds matching credentials in storage
4. Wallet prompts user for consent to share
5. Wallet creates verifiable presentation
6. Wallet submits presentation to verifier
7. Verifier validates presentation and credentials

**Expected Result**: ✅ Valid presentation submitted and verified
**Failure Modes**:
- No matching credentials → User informed, flow aborted
- Invalid presentation format → 400 Bad Request
- Expired credential → 422 Unprocessable Entity

#### TC-VP-002: Selective Disclosure Presentation
**Objective**: Test BBS+ selective disclosure in presentations
**Specification**: BBS+ Signatures 2020, OID4VP Section 8

**Test Vector**:
```json
{
  "presentation_definition": {
    "id": "specialty_verification",
    "input_descriptors": [
      {
        "id": "medical_specialty",
        "format": {
          "ldp_vc": {
            "proof_type": ["BbsBlsSignature2020"]
          }
        },
        "constraints": {
          "limit_disclosure": "required",
          "fields": [
            {
              "path": ["$.credentialSubject.specialty"],
              "intent_to_retain": true
            },
            {
              "path": ["$.credentialSubject.license_number"],
              "intent_to_retain": false
            }
          ]
        }
      }
    ]
  }
}
```

**Expected Result**: ✅ Presentation contains only requested fields
**Validation**: Verify undisclosed fields are not in presentation

#### TC-VP-003: Cross-Device Flow
**Objective**: Test QR code based cross-device presentation
**Specification**: OID4VP Section 7.1

**Test Steps**:
1. Verifier generates presentation request QR code
2. User scans QR with mobile wallet
3. Wallet processes same-device or cross-device flow
4. Wallet completes presentation on original device
5. Verifier receives presentation callback

**Test Vector**:
```json
{
  "client_id": "https://verifier.hospital.com/callback",
  "response_uri": "https://verifier.hospital.com/presentations/12345",
  "presentation_definition_uri": "https://verifier.hospital.com/requests/12345",
  "state": "cross-device-test-state"
}
```

**Expected Result**: ✅ Successful cross-device presentation flow

### 5. Error Handling Tests

#### TC-VP-004: Malformed Presentation Definition
**Objective**: Test error handling for invalid presentation requests
**Specification**: OID4VP Section 6.1

**Test Vectors**:
```json
{
  "test_cases": [
    {
      "name": "Missing input descriptors",
      "presentation_definition": {
        "id": "invalid_request"
      },
      "expected_error": "invalid_request",
      "expected_description": "Missing required input_descriptors"
    },
    {
      "name": "Invalid JSON Schema",
      "presentation_definition": {
        "id": "schema_error",
        "input_descriptors": [
          {
            "constraints": {
              "fields": [
                {
                  "path": "invalid_json_path[",
                  "filter": "not_an_object"
                }
              ]
            }
          }
        ]
      },
      "expected_error": "invalid_request",
      "expected_description": "Invalid JSONPath or filter schema"
    }
  ]
}
```

**Expected Result**: ✅ Appropriate error responses with standard error codes

#### TC-VP-005: Presentation Verification Failures
**Objective**: Test handling of invalid presentations
**Specification**: OID4VP Section 6.3

**Test Scenarios**:
1. **Expired Credential**: Presentation contains expired credential
2. **Revoked Credential**: Credential has been revoked by issuer
3. **Invalid Signature**: Presentation signature verification fails
4. **Schema Mismatch**: Credential doesn't match requested schema

**Expected Results**: ✅ Proper error responses with security event logging

---

## Integration Tests

### 6. Wallet Interoperability Tests

#### TC-INT-001: Microsoft Authenticator Integration
**Objective**: Test compatibility with Microsoft Authenticator
**Protocol Support**: OID4VCI, OID4VP, SIOPv2

**Test Matrix**:
| Feature | Support | Test Status |
|---------|---------|-------------|
| Authorization Code Flow | ✅ | ✅ Passed |
| Pre-Authorized Code | ✅ | ✅ Passed |
| JWT VC Format | ✅ | ✅ Passed |
| JSON-LD VC Format | ⚠️ Limited | 🔄 Testing |
| BBS+ Signatures | ❌ None | ❌ Skip |
| Cross-Device Flow | ✅ | ✅ Passed |

#### TC-INT-002: Lissi Wallet Integration
**Objective**: Test compatibility with Lissi Wallet
**Protocol Support**: Full OID4VCI/VP, BBS+ support

**Test Matrix**:
| Feature | Support | Test Status |
|---------|---------|-------------|
| Authorization Code Flow | ✅ | ✅ Passed |
| Pre-Authorized Code | ✅ | ✅ Passed |
| JWT VC Format | ✅ | ✅ Passed |
| JSON-LD VC Format | ✅ | ✅ Passed |
| BBS+ Signatures | ✅ | ✅ Passed |
| Cross-Device Flow | ✅ | ✅ Passed |

### 7. Healthcare-Specific Tests

#### TC-HEALTH-001: NPPES Data Integration
**Objective**: Test credential issuance from NPPES registry data
**Data Source**: National Plan and Provider Enumeration System

**Test Vector**:
```json
{
  "nppes_data": {
    "npi": "1234567890",
    "provider_name": "Dr. Jane Smith",
    "specialty": "Internal Medicine",
    "practice_address": {
      "state": "CA",
      "zip": "90210"
    },
    "enumeration_date": "2010-01-01"
  }
}
```

**Expected Result**: ✅ Medical license credential generated from NPPES data

#### TC-HEALTH-002: Multi-State License Verification
**Objective**: Test presentation of multi-state medical licenses
**Scenario**: Provider licensed in multiple states, verifier needs any valid license

**Test Vector**:
```json
{
  "presentation_definition": {
    "id": "any_state_license",
    "input_descriptors": [
      {
        "id": "medical_license_any_state",
        "constraints": {
          "fields": [
            {
              "path": ["$.vc.credentialSubject.license_state"],
              "filter": {
                "type": "string",
                "enum": ["CA", "NY", "TX", "FL"]
              }
            },
            {
              "path": ["$.vc.credentialSubject.status"],
              "filter": {
                "const": "active"
              }
            }
          ]
        }
      }
    ]
  }
}
```

**Expected Result**: ✅ Wallet presents any valid license from accepted states

---

## Performance Tests

### 8. Load Testing

#### TC-PERF-001: Credential Issuance Load
**Objective**: Test system performance under credential issuance load
**Target**: 1000 credentials/minute

**Test Configuration**:
- Concurrent users: 100
- Test duration: 10 minutes
- Credential types: Mixed (license, certification, insurance)

**Success Criteria**:
- 99% success rate for credential issuance
- P95 response time < 2 seconds
- No memory leaks or resource exhaustion

#### TC-PERF-002: Presentation Verification Load
**Objective**: Test presentation verification performance
**Target**: 5000 verifications/minute

**Test Configuration**:
- Concurrent presentations: 500
- Test duration: 5 minutes
- Presentation types: Mixed (simple, selective disclosure, complex)

**Success Criteria**:
- 99.9% success rate for verification
- P95 response time < 500ms
- Signature verification accuracy 100%

---

## Security Tests

### 9. Threat Model Testing

#### TC-SEC-001: Replay Attack Protection
**Objective**: Verify presentation replay attack prevention
**Attack Vector**: Resubmit captured presentation

**Test Steps**:
1. Complete valid presentation flow
2. Capture presentation JWT/payload
3. Replay presentation to different verifier
4. Verify rejection with appropriate error

**Expected Result**: ✅ Replay detected and rejected

#### TC-SEC-002: Credential Forgery Attempts
**Objective**: Test detection of forged credentials
**Attack Vector**: Modified credential signatures

**Test Scenarios**:
1. Modified credential claims
2. Invalid signature
3. Wrong issuer DID
4. Expired signing key

**Expected Result**: ✅ All forgery attempts detected and rejected

#### TC-SEC-003: Privacy Correlation Analysis
**Objective**: Verify presentation unlinkability
**Test Method**: Statistical analysis of multiple presentations

**Test Steps**:
1. Generate 1000 presentations from same credential
2. Analyze for correlation patterns
3. Verify unlinkability properties
4. Test with different selective disclosure patterns

**Expected Result**: ✅ No statistical correlation between presentations

---

## Test Execution

### Automated Test Suite
```bash
# Run full conformance test suite
npm run test:oid4vci
npm run test:oid4vp
npm run test:integration
npm run test:performance
npm run test:security

# Generate conformance report
npm run test:conformance-report
```

### Manual Test Procedures
1. **Wallet Installation**: Install test wallets on mobile devices
2. **QR Code Testing**: Physical QR code scanning tests
3. **User Experience**: Manual UX validation for credential flows
4. **Cross-Browser**: Web-based wallet testing across browsers

### Continuous Testing
- **Daily**: Core conformance tests
- **Weekly**: Full integration test suite
- **Monthly**: Performance and security test battery
- **Pre-Release**: Complete test execution with manual validation

---

**Document Version**: 1.0
**Test Suite Version**: v2.1.0
**Last Updated**: January 15, 2024
**Next Review**: March 15, 2024
**Test Coverage**: 127 test cases, 89% automation
**Standards Compliance**: OID4VCI Draft 13, OID4VP Draft 18