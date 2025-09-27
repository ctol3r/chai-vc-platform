# Developer PR Review Training Document
## Chai VC Platform Healthcare Code Review Standards

**Document Version:** 1.0
**Last Updated:** 2025-01-XX
**Classification:** Internal/Training
**Stakeholders:** Engineering Team, Tech Leads, QA Team

---

## Executive Summary

This training document establishes comprehensive code review standards for the Chai VC Platform healthcare credentialing system. Given the critical nature of healthcare data and patient safety implications, our code review process emphasizes security, compliance, reliability, and maintainability with specific focus on HIPAA requirements, zero-knowledge proof implementations, and blockchain security.

---

## Healthcare Code Review Fundamentals

### Why Healthcare Code Review is Different

#### Patient Safety Implications
```yaml
healthcare_specific_risks:
  patient_safety:
    - "Code errors could affect medical credential verification"
    - "Security vulnerabilities may expose PHI data"
    - "Performance issues could delay emergency credentialing"
    - "Compliance violations could lead to legal action"

  regulatory_requirements:
    - "HIPAA compliance mandatory for all PHI handling"
    - "SOC 2 controls must be implemented in code"
    - "Audit trails required for all healthcare operations"
    - "Data retention policies enforced programmatically"

  zero_tolerance_areas:
    - "PHI logging or exposure"
    - "Authentication and authorization bypasses"
    - "Cryptographic implementation errors"
    - "Data integrity violations"
```

#### Review Mindset for Healthcare
- 🏥 **Patient First**: Every line of code potentially impacts patient care
- 🔒 **Privacy by Design**: Assume all data is sensitive until proven otherwise
- 📋 **Compliance Conscious**: Consider regulatory implications of every change
- 🚨 **Fail Safe**: Errors should fail securely, not expose data
- 📊 **Auditable**: All operations must be traceable and logged

---

## Pre-Review Checklist for Developers

### Before Submitting a PR
```yaml
developer_pre_submission_checklist:
  code_quality:
    - "Code follows team style guide and conventions"
    - "All functions have clear, descriptive names"
    - "Complex logic includes explanatory comments"
    - "No commented-out code or debug statements"
    - "Error handling is comprehensive and appropriate"

  security_basics:
    - "No hardcoded secrets, passwords, or API keys"
    - "Input validation on all user-provided data"
    - "Output encoding to prevent XSS vulnerabilities"
    - "SQL queries use parameterized statements"
    - "Authentication required for sensitive operations"

  healthcare_specific:
    - "No PHI data in logs, error messages, or debug output"
    - "Healthcare operations include proper audit logging"
    - "Patient data access follows least-privilege principle"
    - "Medical professional data properly encrypted"
    - "Credential verification logic is tamper-proof"

  testing_requirements:
    - "Unit tests cover all new functionality"
    - "Integration tests for healthcare workflows"
    - "Security tests for authentication/authorization"
    - "Performance tests for credential verification"
    - "All tests pass locally before submission"
```

### Self-Review Process
```typescript
interface SelfReviewChecklist {
  codeQuality: {
    readability: boolean;
    maintainability: boolean;
    performance: boolean;
    testability: boolean;
  };

  securityReview: {
    inputValidation: boolean;
    outputEncoding: boolean;
    authenticationChecks: boolean;
    authorizationControls: boolean;
    cryptographicSafety: boolean;
  };

  healthcareCompliance: {
    phiProtection: boolean;
    auditLogging: boolean;
    dataRetention: boolean;
    accessControls: boolean;
    regulatoryAlignment: boolean;
  };

  documentationUpdates: {
    apiDocumentation: boolean;
    readmeUpdates: boolean;
    architectureDiagrams: boolean;
    complianceDocuments: boolean;
  };
}
```

---

## Code Review Standards by Component

### Healthcare Data Handling
```typescript
// ❌ WRONG - Logging PHI data
function processCredential(credential: HealthcareCredential) {
  console.log('Processing credential:', credential); // PHI EXPOSURE!
  logger.info(`Processing license ${credential.licenseNumber}`); // PHI EXPOSURE!
}

// ✅ CORRECT - Safe logging with audit trail
function processCredential(credential: HealthcareCredential) {
  const credentialId = credential.id;
  logger.info(`Processing credential`, { credentialId, timestamp: Date.now() });

  // Audit trail for healthcare operations
  auditLogger.logHealthcareOperation({
    operation: 'CREDENTIAL_PROCESSING',
    credentialId,
    userId: getCurrentUser().id,
    timestamp: Date.now(),
    ipAddress: getClientIP(),
    userAgent: getUserAgent()
  });
}

// Review Focus Points:
// 1. No PHI in logs or console output
// 2. Proper audit trail for healthcare operations
// 3. Structured logging with non-sensitive identifiers
// 4. Compliance with data retention policies
```

### Authentication & Authorization
```typescript
// ❌ WRONG - Insufficient authorization checks
async function getPatientCredentials(patientId: string) {
  // Missing authorization check!
  return await db.credentials.findMany({ where: { patientId } });
}

// ✅ CORRECT - Comprehensive authorization
async function getPatientCredentials(
  patientId: string,
  requestingUser: User,
  auditContext: AuditContext
): Promise<HealthcareCredential[]> {
  // 1. Authentication verification
  if (!requestingUser || !requestingUser.isAuthenticated) {
    throw new UnauthorizedError('Authentication required');
  }

  // 2. Authorization check
  const hasAccess = await authorizationService.canAccessPatientData(
    requestingUser.id,
    patientId,
    'READ_CREDENTIALS'
  );

  if (!hasAccess) {
    await auditLogger.logUnauthorizedAccess({
      userId: requestingUser.id,
      attemptedResource: `patient_credentials_${patientId}`,
      timestamp: Date.now()
    });
    throw new ForbiddenError('Insufficient permissions');
  }

  // 3. Data retrieval with audit
  const credentials = await db.credentials.findMany({
    where: { patientId },
    select: getAuthorizedFields(requestingUser.role)
  });

  // 4. Audit successful access
  await auditLogger.logDataAccess({
    userId: requestingUser.id,
    resourceType: 'PATIENT_CREDENTIALS',
    resourceId: patientId,
    recordCount: credentials.length,
    timestamp: Date.now()
  });

  return credentials;
}

// Review Focus Points:
// 1. Every healthcare data access requires authentication
// 2. Authorization checks are role-based and granular
// 3. Failed access attempts are logged for security monitoring
// 4. Successful access is audited for compliance
// 5. Data returned is filtered based on user permissions
```

### Cryptographic Operations
```typescript
// ❌ WRONG - Insecure cryptographic practices
function encryptCredential(credential: string): string {
  const cipher = crypto.createCipher('aes192', 'password123'); // INSECURE!
  let encrypted = cipher.update(credential, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// ✅ CORRECT - Secure cryptographic implementation
import { createCipherGCM, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function encryptCredential(
  credential: string,
  masterKey: Buffer
): Promise<EncryptedCredential> {
  // 1. Generate random salt and IV
  const salt = randomBytes(16);
  const iv = randomBytes(16);

  // 2. Derive key using scrypt (FIPS 140-2 approved)
  const key = (await scryptAsync(masterKey, salt, 32)) as Buffer;

  // 3. Encrypt using AES-256-GCM (authenticated encryption)
  const cipher = createCipherGCM('aes-256-gcm');
  cipher.setAAD(Buffer.from('chai-vc-healthcare-credential'));

  let encrypted = cipher.update(credential, 'utf8');
  cipher.final();
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted.toString('base64'),
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    algorithm: 'aes-256-gcm',
    keyDerivation: 'scrypt'
  };
}

// Review Focus Points:
// 1. Use only FIPS 140-2 approved cryptographic algorithms
// 2. Generate cryptographically secure random values
// 3. Use authenticated encryption (GCM mode)
// 4. Never hardcode keys or use weak key derivation
// 5. Include algorithm versioning for future upgrades
```

### Database Operations
```typescript
// ❌ WRONG - SQL injection vulnerability
async function findCredentialByLicense(licenseNumber: string) {
  const query = `SELECT * FROM credentials WHERE license_number = '${licenseNumber}'`;
  return await db.raw(query); // SQL INJECTION RISK!
}

// ✅ CORRECT - Parameterized queries with validation
async function findCredentialByLicense(
  licenseNumber: string,
  requestingUser: User
): Promise<HealthcareCredential | null> {
  // 1. Input validation
  if (!licenseNumber || typeof licenseNumber !== 'string') {
    throw new ValidationError('License number is required');
  }

  // Validate license number format
  const licenseRegex = /^[A-Z]{2}\d{6,8}$/;
  if (!licenseRegex.test(licenseNumber.toUpperCase())) {
    throw new ValidationError('Invalid license number format');
  }

  // 2. Authorization check
  const canSearch = await authorizationService.canSearchCredentials(
    requestingUser.id
  );

  if (!canSearch) {
    throw new ForbiddenError('Insufficient permissions to search credentials');
  }

  // 3. Parameterized query
  const credential = await db.credentials.findFirst({
    where: {
      licenseNumber: licenseNumber.toUpperCase(),
      // Additional security: only return active credentials
      status: 'ACTIVE',
      expiresAt: {
        gte: new Date()
      }
    },
    select: {
      id: true,
      licenseNumber: true,
      holderName: true,
      issuerName: true,
      expiresAt: true,
      specialties: true,
      // Never select sensitive fields unless specifically authorized
      ...(requestingUser.role === 'ADMIN' && {
        internalNotes: true,
        auditHistory: true
      })
    }
  });

  // 4. Audit the search
  await auditLogger.logCredentialSearch({
    userId: requestingUser.id,
    searchType: 'LICENSE_NUMBER',
    found: !!credential,
    timestamp: Date.now()
  });

  return credential;
}

// Review Focus Points:
// 1. All database queries use parameterized statements
// 2. Input validation prevents injection attacks
// 3. Only authorized users can perform searches
// 4. Sensitive fields are conditionally selected
// 5. All database operations are audited
```

---

## Zero-Knowledge Proof Review Standards

### ZK Circuit Validation
```rust
// Review requirements for ZK circuits (Circom)
template MedicalLicenseVerification(n) {
    // Inputs (private unless marked public)
    signal private input licenseNumber[n];
    signal private input holderSSN[9];  // ⚠️ REVIEW: PHI handling
    signal private input issueDate;
    signal private input expiryDate;

    signal public input currentDate;
    signal public input stateCode;

    signal output isValid;

    // Review Focus Points:
    // 1. Are all private inputs properly protected?
    // 2. Do public inputs reveal sensitive information?
    // 3. Is the logic sound and complete?
    // 4. Are there any potential constraint bypasses?

    component licenseValid = LicenseNumberValidation(n);
    component dateValid = DateRangeCheck();
    component ssnValid = SSNValidation(); // ⚠️ REVIEW: Should SSN be in circuit?

    // Constraint review
    licenseValid.number <== licenseNumber;
    licenseValid.stateCode <== stateCode;

    dateValid.issueDate <== issueDate;
    dateValid.expiryDate <== expiryDate;
    dateValid.currentDate <== currentDate;

    // Final validation
    isValid <== licenseValid.valid * dateValid.valid * ssnValid.valid;
}

// Reviewer checklist for ZK circuits:
// ✅ Private inputs contain no unnecessary PHI
// ✅ Public inputs don't leak sensitive information
// ✅ Constraints properly enforce business logic
// ✅ No arithmetic overflow/underflow possibilities
// ✅ Circuit generates correct proofs for all valid inputs
// ✅ Circuit rejects all invalid inputs
```

### ZK Proof Verification
```typescript
// ZK proof verification in application code
async function verifyMedicalLicense(
  proof: ZKProof,
  publicInputs: PublicInputs,
  verificationContext: VerificationContext
): Promise<VerificationResult> {
  // Review Focus Points for ZK verification:

  // 1. Verify proof structure and format
  if (!isValidProofStructure(proof)) {
    throw new ValidationError('Invalid proof structure');
  }

  // 2. Validate public inputs don't contain PHI
  validatePublicInputs(publicInputs); // ⚠️ CRITICAL REVIEW POINT

  // 3. Use correct verification key for the circuit
  const verificationKey = await getVerificationKey(
    verificationContext.circuitId,
    verificationContext.version
  );

  // 4. Perform cryptographic verification
  const isValidProof = await zkVerifier.verify(
    proof,
    publicInputs,
    verificationKey
  );

  // 5. Additional business logic validation
  if (isValidProof) {
    // Verify the proof is recent and not replayed
    const proofAge = Date.now() - publicInputs.timestamp;
    if (proofAge > MAX_PROOF_AGE) {
      throw new ValidationError('Proof too old');
    }

    // Check if proof has been used before (prevent replay)
    const proofHash = hashProof(proof);
    if (await proofReplayDetector.hasBeenUsed(proofHash)) {
      throw new SecurityError('Proof replay detected');
    }

    await proofReplayDetector.markAsUsed(proofHash);
  }

  // 6. Audit the verification attempt
  await auditLogger.logZKVerification({
    circuitId: verificationContext.circuitId,
    verificationResult: isValidProof,
    userId: verificationContext.userId,
    timestamp: Date.now(),
    proofHash: hashProof(proof)
  });

  return {
    isValid: isValidProof,
    verifiedAt: Date.now(),
    circuitId: verificationContext.circuitId
  };
}

// ZK Proof Review Checklist:
// ✅ Proof structure validation prevents malformed inputs
// ✅ Public inputs validated to prevent PHI exposure
// ✅ Correct verification key used for circuit version
// ✅ Replay attacks prevented through proof tracking
// ✅ All verification attempts audited
// ✅ Error handling doesn't leak cryptographic details
```

---

## Blockchain Integration Review Standards

### Smart Contract Interactions
```typescript
// Substrate pallet interaction review
async function recordCredentialOnChain(
  credential: HealthcareCredential,
  submitter: User
): Promise<BlockchainTransactionResult> {
  // Review Focus Points for blockchain operations:

  // 1. Never put PHI directly on blockchain
  const credentialCommitment = await createPrivacyPreservingCommitment(credential);

  // 2. Validate transaction parameters
  if (!isValidCredentialCommitment(credentialCommitment)) {
    throw new ValidationError('Invalid credential commitment');
  }

  // 3. Check user authorization for blockchain operations
  const canSubmit = await authorizationService.canSubmitToBlockchain(
    submitter.id,
    'CREDENTIAL_REGISTRY'
  );

  if (!canSubmit) {
    throw new ForbiddenError('Unauthorized blockchain submission');
  }

  // 4. Prepare extrinsic with proper error handling
  try {
    const api = await getSubstrateAPI();
    const keyring = await getAuthorizedKeyring(submitter.id);

    const extrinsic = api.tx.credentialRegistry.recordCredential(
      credentialCommitment.hash,
      credentialCommitment.merkleRoot,
      credentialCommitment.metadata
    );

    // 5. Submit with monitoring
    const txHash = await extrinsic.signAndSend(keyring, ({ status, events }) => {
      if (status.isInBlock) {
        // Transaction included in block
        auditLogger.logBlockchainTransaction({
          txHash: txHash.toHex(),
          blockHash: status.asInBlock.toHex(),
          userId: submitter.id,
          operation: 'RECORD_CREDENTIAL',
          timestamp: Date.now()
        });
      }
    });

    return {
      txHash: txHash.toHex(),
      status: 'SUBMITTED',
      timestamp: Date.now()
    };

  } catch (error) {
    // 6. Error handling without information disclosure
    logger.error('Blockchain submission failed', {
      userId: submitter.id,
      error: error.message,
      timestamp: Date.now()
    });

    throw new BlockchainError('Failed to record credential on blockchain');
  }
}

// Blockchain Review Checklist:
// ✅ No PHI or sensitive data stored on-chain
// ✅ Privacy-preserving commitments used instead
// ✅ User authorization checked before blockchain operations
// ✅ Transaction monitoring and error handling implemented
// ✅ All blockchain operations audited
// ✅ Error messages don't expose internal details
```

---

## Review Process & Roles

### Review Assignment Matrix
```yaml
review_assignments:
  healthcare_data_changes:
    required_reviewers: 2
    required_roles: ["healthcare_lead", "security_engineer"]
    additional_approvals: ["compliance_officer"]

  authentication_authorization:
    required_reviewers: 2
    required_roles: ["security_engineer", "senior_developer"]
    additional_approvals: ["security_lead"]

  cryptographic_operations:
    required_reviewers: 2
    required_roles: ["cryptography_expert", "security_engineer"]
    additional_approvals: ["cto"]

  zk_proof_circuits:
    required_reviewers: 2
    required_roles: ["zk_expert", "cryptography_expert"]
    additional_approvals: ["research_lead"]

  blockchain_integration:
    required_reviewers: 2
    required_roles: ["blockchain_engineer", "security_engineer"]
    additional_approvals: ["architecture_lead"]

  database_schema:
    required_reviewers: 2
    required_roles: ["database_expert", "healthcare_lead"]
    additional_approvals: ["data_governance"]
```

### Review Timeline & Process
```yaml
review_process:
  initial_assignment:
    timeframe: "2 hours"
    action: "Automatic assignment based on changed files"

  first_review:
    timeframe: "24 hours"
    requirements:
      - "Complete code review checklist"
      - "Run security analysis tools"
      - "Validate healthcare compliance"
      - "Check test coverage"

  security_review:
    timeframe: "48 hours for security-sensitive changes"
    requirements:
      - "Threat modeling review"
      - "Security tool scan results"
      - "Manual security testing"
      - "Compliance validation"

  final_approval:
    timeframe: "72 hours maximum"
    requirements:
      - "All reviewer comments addressed"
      - "Automated tests passing"
      - "Security scans clean"
      - "Documentation updated"
```

---

## Automated Review Tools Integration

### Pre-commit Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running Chai VC healthcare code quality checks..."

# 1. Security scanning
echo "🔍 Running security scans..."
npm audit --audit-level moderate
bandit -r backend/src/ -f json -o security-report.json

# 2. Healthcare-specific linting
echo "🏥 Checking healthcare compliance..."
python scripts/healthcare-lint.py

# 3. PHI detection
echo "🔒 Scanning for potential PHI exposure..."
grep -r "ssn\|social.security\|patient.name" src/ && echo "❌ Potential PHI detected" && exit 1

# 4. Cryptographic validation
echo "🔐 Validating cryptographic operations..."
python scripts/crypto-validation.py

# 5. Test coverage enforcement
echo "📊 Checking test coverage..."
npm run test:coverage -- --threshold=90

echo "✅ All pre-commit checks passed!"
```

### Automated Security Scanning
```yaml
security_tools_integration:
  static_analysis:
    - "ESLint with security rules"
    - "Bandit for Python security issues"
    - "Semgrep with healthcare-specific rules"
    - "CodeQL for vulnerability detection"

  dependency_scanning:
    - "npm audit for JavaScript dependencies"
    - "Safety for Python dependencies"
    - "Snyk for comprehensive vulnerability scanning"

  secret_detection:
    - "GitLeaks for secret scanning"
    - "TruffleHog for entropy-based detection"
    - "Custom rules for healthcare-specific secrets"

  compliance_checking:
    - "HIPAA compliance rule validation"
    - "PHI exposure detection"
    - "Audit logging requirement enforcement"
```

### Healthcare-Specific Linting Rules
```python
# scripts/healthcare-lint.py
import ast
import sys
import re

class HealthcareLinter(ast.NodeVisitor):
    def __init__(self):
        self.issues = []

    def visit_Call(self, node):
        # Check for PHI in logging calls
        if hasattr(node.func, 'attr') and node.func.attr in ['log', 'info', 'debug', 'warn', 'error']:
            for arg in node.args:
                if isinstance(arg, ast.Str):
                    if re.search(r'(ssn|social.security|patient.name|license.number)', arg.s, re.IGNORECASE):
                        self.issues.append(f"Line {node.lineno}: Potential PHI in log statement")

        # Check for insecure crypto usage
        if hasattr(node.func, 'attr') and node.func.attr in ['createCipher', 'createHash']:
            if len(node.args) > 0 and isinstance(node.args[0], ast.Str):
                if node.args[0].s in ['md5', 'sha1', 'des', 'rc4']:
                    self.issues.append(f"Line {node.lineno}: Insecure cryptographic algorithm")

        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        # Check for healthcare data access without audit
        healthcare_functions = ['getPatientData', 'accessCredentials', 'verifyLicense']
        if any(keyword in node.name for keyword in healthcare_functions):
            # Check if function includes audit logging
            audit_found = False
            for child in ast.walk(node):
                if isinstance(child, ast.Call) and hasattr(child.func, 'attr'):
                    if 'audit' in child.func.attr.lower():
                        audit_found = True
                        break

            if not audit_found:
                self.issues.append(f"Line {node.lineno}: Healthcare function missing audit logging")

        self.generic_visit(node)

# Usage in CI/CD pipeline
def main():
    for filename in sys.argv[1:]:
        with open(filename, 'r') as f:
            tree = ast.parse(f.read(), filename=filename)
            linter = HealthcareLinter()
            linter.visit(tree)

            if linter.issues:
                print(f"Healthcare compliance issues in {filename}:")
                for issue in linter.issues:
                    print(f"  - {issue}")
                return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
```

---

## Common Review Patterns & Anti-Patterns

### Healthcare Data Handling Patterns

#### ✅ Good Patterns
```typescript
// Pattern: Structured healthcare data access with audit
async function accessHealthcareData(
  resourceId: string,
  user: User,
  operation: HealthcareOperation
): Promise<HealthcareResource> {
  // 1. Authentication check
  await ensureAuthenticated(user);

  // 2. Authorization validation
  await ensureAuthorized(user, resourceId, operation);

  // 3. Data access with selective fields
  const resource = await dataService.getResource(
    resourceId,
    getAuthorizedFields(user.role, operation)
  );

  // 4. Audit logging
  await auditLogger.log({
    userId: user.id,
    operation,
    resourceId,
    timestamp: Date.now()
  });

  return resource;
}

// Pattern: Privacy-preserving data transformation
function sanitizeForDisplay(credential: HealthcareCredential, userRole: UserRole): DisplayCredential {
  const base = {
    id: credential.id,
    type: credential.type,
    issuer: credential.issuer,
    status: credential.status,
    expiresAt: credential.expiresAt
  };

  // Role-based field inclusion
  if (userRole === 'ADMIN' || userRole === 'HEALTHCARE_PROVIDER') {
    return {
      ...base,
      licenseNumber: maskLicenseNumber(credential.licenseNumber),
      specialties: credential.specialties
    };
  }

  return base; // Minimal info for other roles
}
```

#### ❌ Anti-Patterns
```typescript
// Anti-pattern: Direct database access without checks
async function getCredential(id: string) {
  return await db.credentials.findUnique({ where: { id } }); // Missing auth/audit!
}

// Anti-pattern: PHI in error messages
try {
  await processCredential(credential);
} catch (error) {
  throw new Error(`Failed to process credential ${credential.licenseNumber}: ${error.message}`); // PHI LEAK!
}

// Anti-pattern: Overly permissive data return
function serializeCredential(credential: HealthcareCredential) {
  return JSON.stringify(credential); // Returns all fields including sensitive ones!
}
```

### Security Review Patterns

#### ✅ Security Best Practices
```typescript
// Pattern: Input validation with healthcare context
function validateLicenseNumber(licenseNumber: string, state: string): void {
  // 1. Basic type and presence validation
  if (!licenseNumber || typeof licenseNumber !== 'string') {
    throw new ValidationError('License number is required');
  }

  // 2. Format validation by state
  const stateRegexes = {
    'CA': /^CA\d{8}$/,
    'NY': /^NY\d{6}$/,
    'TX': /^TX[A-Z]\d{7}$/
  };

  const regex = stateRegexes[state];
  if (!regex || !regex.test(licenseNumber)) {
    throw new ValidationError(`Invalid license number format for state ${state}`);
  }

  // 3. Length validation (prevent DoS)
  if (licenseNumber.length > 20) {
    throw new ValidationError('License number too long');
  }
}

// Pattern: Secure error handling
try {
  await sensitiveOperation();
} catch (error) {
  // Log detailed error internally
  logger.error('Sensitive operation failed', {
    userId: user.id,
    operation: 'CREDENTIAL_VERIFICATION',
    error: error.message,
    stack: error.stack
  });

  // Return generic error to user
  throw new ApplicationError('Operation failed. Please try again.');
}
```

#### ❌ Security Anti-Patterns
```typescript
// Anti-pattern: SQL injection vulnerability
async function findByLicense(license: string) {
  return await db.raw(`SELECT * FROM credentials WHERE license = '${license}'`); // SQL INJECTION!
}

// Anti-pattern: Information disclosure in errors
catch (error) {
  throw new Error(`Database error: ${error.message}`); // Leaks internal details!
}

// Anti-pattern: Weak authentication check
if (req.headers.authorization) {
  // User is authenticated
  return await getPrivateData(); // No actual token validation!
}
```

---

## Review Tools & Resources

### Code Review Checklist Template
```markdown
## Healthcare Code Review Checklist

### Security Review
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] Proper authentication and authorization checks
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection where applicable
- [ ] Secure error handling (no information disclosure)

### Healthcare Compliance
- [ ] No PHI in logs or error messages
- [ ] Proper audit logging for healthcare operations
- [ ] HIPAA-compliant data handling
- [ ] Appropriate data retention policies applied
- [ ] Role-based access controls enforced
- [ ] Patient privacy protections implemented

### Cryptography Review
- [ ] FIPS 140-2 approved algorithms only
- [ ] Proper key management practices
- [ ] Secure random number generation
- [ ] Authenticated encryption where needed
- [ ] No deprecated cryptographic functions

### Zero-Knowledge Proofs
- [ ] Circuit logic is sound and complete
- [ ] Private inputs properly protected
- [ ] Public inputs don't leak sensitive data
- [ ] Proof verification is cryptographically secure
- [ ] Replay attack prevention implemented

### Blockchain Integration
- [ ] No PHI stored on-chain
- [ ] Privacy-preserving commitments used
- [ ] Transaction monitoring implemented
- [ ] Error handling prevents information disclosure
- [ ] Gas optimization considered

### Code Quality
- [ ] Code follows team conventions
- [ ] Complex logic is well-commented
- [ ] Error handling is comprehensive
- [ ] Performance considerations addressed
- [ ] Tests cover new functionality

### Documentation
- [ ] API documentation updated
- [ ] Architecture diagrams updated
- [ ] Security documentation updated
- [ ] Compliance documentation updated
```

### Review Comment Templates
```yaml
security_comments:
  input_validation: |
    🔒 **Security**: This input needs validation to prevent injection attacks.
    Consider adding validation for:
    - Input type and format
    - Length limits
    - Character allowlist
    Example: `validateLicenseNumber(input, state)`

  authentication_missing: |
    🚨 **Critical**: This endpoint/function accesses sensitive data without authentication.
    Please add authentication check:
    ```typescript
    await ensureAuthenticated(user);
    await ensureAuthorized(user, resource, operation);
    ```

  phi_logging: |
    🏥 **HIPAA Violation**: This appears to log PHI data which violates HIPAA.
    Please remove sensitive data from logs or use structured logging:
    ```typescript
    logger.info('Processing credential', { credentialId, userId });
    ```

healthcare_comments:
  missing_audit: |
    📋 **Compliance**: Healthcare operations require audit logging.
    Please add audit trail:
    ```typescript
    await auditLogger.logHealthcareOperation({
      operation: 'CREDENTIAL_ACCESS',
      userId,
      resourceId,
      timestamp: Date.now()
    });
    ```

  data_retention: |
    📅 **Data Retention**: This creates/modifies healthcare data without retention metadata.
    Please add retention tracking:
    ```typescript
    await dataRetentionService.trackRecord(recordId, 'HEALTHCARE_CREDENTIAL');
    ```

crypto_comments:
  weak_crypto: |
    🔐 **Cryptography**: This uses a deprecated/weak cryptographic algorithm.
    Please use FIPS 140-2 approved alternatives:
    - MD5/SHA1 → SHA-256/SHA-384
    - DES/3DES → AES-256
    - RC4 → ChaCha20-Poly1305
```

---

## Training Exercises & Scenarios

### Exercise 1: Healthcare Data Access Review
```typescript
// Review this code and identify all issues
async function getPatientCredentials(patientId, userId) {
  console.log(`User ${userId} accessing patient ${patientId}`);

  const credentials = await db.query(
    `SELECT * FROM credentials WHERE patient_id = '${patientId}'`
  );

  return credentials;
}

// Issues to identify:
// 1. PHI logging (patientId in console.log)
// 2. SQL injection vulnerability
// 3. No authentication check
// 4. No authorization validation
// 5. No audit logging
// 6. Returns all fields without filtering
// 7. No input validation
```

### Exercise 2: ZK Proof Verification Review
```typescript
// Review this ZK proof verification function
async function verifyProof(proof, publicInputs) {
  const vk = await fs.readFile('./verification-key.json');
  const result = zkVerify(proof, publicInputs, vk);

  if (result) {
    console.log('Proof verified for:', publicInputs);
    return { verified: true };
  }

  return { verified: false };
}

// Issues to identify:
// 1. Hardcoded verification key path
// 2. Potential PHI in publicInputs logging
// 3. No proof replay protection
// 4. No input validation
// 5. No audit logging
// 6. Synchronous file reading
// 7. No error handling
```

### Exercise 3: Cryptographic Implementation Review
```typescript
// Review this encryption implementation
function encryptData(data, password) {
  const cipher = crypto.createCipher('aes192', password);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

// Issues to identify:
// 1. Deprecated createCipher function
// 2. Weak AES-192 instead of AES-256
// 3. No salt/IV generation
// 4. Password used directly as key
// 5. No authenticated encryption
// 6. No input validation
// 7. No error handling
```

---

## Conclusion & Best Practices Summary

### Key Takeaways for Healthcare Code Review

1. **Patient Safety First**: Every line of code potentially impacts patient care and safety
2. **Privacy by Design**: Assume all data is sensitive and implement appropriate protections
3. **Compliance Consciousness**: Consider HIPAA, SOC2, and other regulatory requirements
4. **Security Depth**: Multiple layers of security controls for defense in depth
5. **Audit Everything**: Complete audit trails for all healthcare operations
6. **Fail Securely**: Ensure failures don't expose sensitive information
7. **Zero Tolerance**: No PHI in logs, no weak crypto, no unauthenticated access

### Review Quality Metrics
```yaml
quality_indicators:
  excellent_review:
    - "Identifies all security and compliance issues"
    - "Provides specific remediation guidance"
    - "Considers healthcare-specific implications"
    - "Includes code examples and alternatives"

  good_review:
    - "Catches most critical issues"
    - "Provides clear feedback"
    - "Considers security implications"
    - "Suggests improvements"

  needs_improvement:
    - "Misses critical security issues"
    - "Provides vague feedback"
    - "Doesn't consider healthcare context"
    - "Focuses only on style issues"
```

### Continuous Improvement
- 📊 **Regular Training**: Monthly healthcare security training sessions
- 🔍 **Review Analytics**: Track review effectiveness and common issues
- 📚 **Knowledge Sharing**: Document lessons learned and best practices
- 🎯 **Skills Development**: Specialized training for healthcare security
- 🔄 **Process Refinement**: Continuously improve review processes based on feedback

---

**Remember**: In healthcare technology, code reviews aren't just about code quality – they're about patient safety, privacy protection, and regulatory compliance. Take the time to do them right.

**Emergency Review Contacts:**
- **Security Issues**: security-team@chai-vc.com
- **HIPAA Concerns**: compliance@chai-vc.com
- **Critical Bugs**: engineering-leads@chai-vc.com