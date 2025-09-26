# Circuit Requirements: State License Verification

## Executive Summary

This document defines the zero-knowledge proof circuit requirements for verifying state-issued professional licenses in the healthcare domain. The circuit enables privacy-preserving verification of license validity, specialization, and status without revealing sensitive personal information.

## Circuit Overview

### Purpose
Verify healthcare professional licenses issued by state medical boards while preserving privacy and enabling selective disclosure of relevant attributes.

### Target Use Cases
1. Hospital credentialing verification
2. Telemedicine platform onboarding
3. Insurance provider validation
4. Locum tenens placement verification
5. Multi-state practice authorization

## Witness Types and Structure

### Public Inputs (Verifier Known)
```circom
signal input verifierDID;           // Verifier's decentralized identifier
signal input challengeNonce;        // Unique verification challenge
signal input minLicenseDate;        // Minimum required license issue date
signal input requiredState;         // State jurisdiction requirement (0 = any)
signal input specialtyRequired;     // Required medical specialty (0 = any)
signal input currentTimestamp;      // Current verification timestamp
signal input issuerPublicKey[2];    // State medical board public key
```

### Private Inputs (Prover Secret)
```circom
// License Core Data
signal private input licenseNumber;        // State-issued license number
signal private input licenseType;          // License type (MD, DO, RN, etc.)
signal private input issueDate;            // Original license issue date
signal private input expirationDate;      // License expiration date
signal private input stateCode;            // Issuing state code
signal private input specialty;            // Medical specialty code

// Personal Information (Hidden)
signal private input fullName;             // Licensed professional name
signal private input dateOfBirth;          // Professional's date of birth
signal private input socialSecurityHash;   // Hashed SSN for uniqueness
signal private input addressHash;          // Hashed address for correspondence

// Credential Metadata
signal private input issuerSignature[2];   // Medical board signature
signal private input credentialHash;       // Hash of full credential
signal private input revocationSalt;       // Salt for revocation checking
signal private input attestationDate;      // Attestation timestamp
```

### Public Outputs (Verification Results)
```circom
signal output isValidLicense;        // 1 if license is valid, 0 otherwise
signal output licenseTypeVerified;   // Verified license type (if disclosed)
signal output specialtyVerified;     // Verified specialty (if disclosed)
signal output stateVerified;         // Verified state (if disclosed)
signal output expirationStatus;      // 1 if not expired, 0 if expired
signal output credentialCommitment;  // Commitment to full credential
signal output nullifierHash;         // Prevents double-spending/reuse
```

## Circuit Constraints

### Core Verification Logic
```circom
template StatelicenseVerification(n) {
    // Signature verification constraint
    component sigVerify = EdDSAMiMCVerifier();
    sigVerify.enabled <== 1;
    sigVerify.Ax <== issuerPublicKey[0];
    sigVerify.Ay <== issuerPublicKey[1];
    sigVerify.R8x <== issuerSignature[0];
    sigVerify.R8y <== issuerSignature[1];
    sigVerify.S <== issuerSignature[2];
    sigVerify.M <== credentialHash;

    // Date validity constraints
    component dateChecker = LessThanEqConstraint(64);
    dateChecker.in[0] <== minLicenseDate;
    dateChecker.in[1] <== issueDate;

    component expirationChecker = LessThanConstraint(64);
    expirationChecker.in[0] <== currentTimestamp;
    expirationChecker.in[1] <== expirationDate;

    // State matching constraint (if required)
    component stateMatch = IfThenElse();
    stateMatch.condition <== requiredState;
    stateMatch.true_value <== IsEqual()([stateCode, requiredState]);
    stateMatch.false_value <== 1; // Always valid if no state required

    // Specialty matching constraint (if required)
    component specialtyMatch = IfThenElse();
    specialtyMatch.condition <== specialtyRequired;
    specialtyMatch.true_value <== IsEqual()([specialty, specialtyRequired]);
    specialtyMatch.false_value <== 1; // Always valid if no specialty required

    // Final validity computation
    isValidLicense <== sigVerify.valid *
                       dateChecker.out *
                       expirationChecker.out *
                       stateMatch.out *
                       specialtyMatch.out;
}
```

### Selective Disclosure Constraints
```circom
// License type disclosure logic
component licenseTypeDisclosure = Mux1();
licenseTypeDisclosure.c[0] <== 0; // Hidden
licenseTypeDisclosure.c[1] <== licenseType; // Revealed
licenseTypeDisclosure.s <== discloseLicenseType;
licenseTypeVerified <== licenseTypeDisclosure.out;

// Specialty disclosure logic
component specialtyDisclosure = Mux1();
specialtyDisclosure.c[0] <== 0; // Hidden
specialtyDisclosure.c[1] <== specialty; // Revealed
specialtyDisclosure.s <== discloseSpecialty;
specialtyVerified <== specialtyDisclosure.out;

// State disclosure logic
component stateDisclosure = Mux1();
stateDisclosure.c[0] <== 0; // Hidden
stateDisclosure.c[1] <== stateCode; // Revealed
stateDisclosure.s <== discloseState;
stateVerified <== stateDisclosure.out;
```

### Anti-Replay Protection
```circom
// Nullifier generation to prevent proof reuse
component nullifier = MiMC7(2);
nullifier.x_in <== socialSecurityHash;
nullifier.k <== challengeNonce;
nullifierHash <== nullifier.out;

// Credential commitment for consistency
component commitment = Pedersen(8);
commitment.in[0] <== licenseNumber;
commitment.in[1] <== issueDate;
commitment.in[2] <== stateCode;
commitment.in[3] <== specialty;
commitment.in[4] <== fullName; // Private but committed
commitment.in[5] <== dateOfBirth; // Private but committed
commitment.in[6] <== revocationSalt;
commitment.in[7] <== attestationDate;
credentialCommitment <== commitment.out;
```

## Circuit Parameters

### Constraint Complexity
- **Total Constraints**: ~50,000
- **Public Inputs**: 8
- **Private Inputs**: 12
- **Public Outputs**: 7
- **Curve**: BN254 (alt_bn128)
- **Hash Function**: MiMC-7 for efficiency
- **Signature Scheme**: EdDSA with MiMC

### Performance Targets
- **Proving Time**: <30 seconds on standard hardware
- **Verification Time**: <100 milliseconds
- **Proof Size**: <1KB
- **Setup Size**: <100MB (universal setup)
- **Memory Usage**: <8GB RAM for proving

## State License Data Schema

### License Types (Standardized Codes)
```typescript
enum LicenseType {
  MD = 1,      // Doctor of Medicine
  DO = 2,      // Doctor of Osteopathic Medicine
  RN = 3,      // Registered Nurse
  NP = 4,      // Nurse Practitioner
  PA = 5,      // Physician Assistant
  DDS = 6,     // Doctor of Dental Surgery
  RPH = 7,     // Registered Pharmacist
  PT = 8,      // Physical Therapist
  OT = 9,      // Occupational Therapist
  MSW = 10     // Master of Social Work
}
```

### Medical Specialties (AMA Codes)
```typescript
enum MedicalSpecialty {
  FAMILY_MEDICINE = 1,
  INTERNAL_MEDICINE = 2,
  PEDIATRICS = 3,
  SURGERY = 4,
  CARDIOLOGY = 5,
  NEUROLOGY = 6,
  PSYCHIATRY = 7,
  RADIOLOGY = 8,
  ANESTHESIOLOGY = 9,
  EMERGENCY_MEDICINE = 10,
  // ... additional specialties
}
```

### State Codes (FIPS Codes)
```typescript
enum StateCode {
  ALABAMA = 1,
  ALASKA = 2,
  ARIZONA = 4,
  ARKANSAS = 5,
  CALIFORNIA = 6,
  // ... all 50 states + DC
}
```

## Verification Scenarios

### Scenario 1: Basic License Validation
```json
{
  "description": "Verify valid medical license without disclosure",
  "publicInputs": {
    "verifierDID": "did:web:hospital.example.com",
    "challengeNonce": "0x1234567890abcdef",
    "minLicenseDate": 1577836800, // 2020-01-01
    "requiredState": 0, // Any state
    "specialtyRequired": 0, // Any specialty
    "currentTimestamp": 1727222400
  },
  "expectedOutputs": {
    "isValidLicense": 1,
    "licenseTypeVerified": 0, // Hidden
    "specialtyVerified": 0, // Hidden
    "stateVerified": 0, // Hidden
    "expirationStatus": 1
  }
}
```

### Scenario 2: State-Specific Verification
```json
{
  "description": "Verify California medical license",
  "publicInputs": {
    "verifierDID": "did:web:ca-health.gov",
    "challengeNonce": "0xabcdef1234567890",
    "minLicenseDate": 1609459200, // 2021-01-01
    "requiredState": 6, // California
    "specialtyRequired": 0,
    "currentTimestamp": 1727222400
  },
  "expectedOutputs": {
    "isValidLicense": 1,
    "stateVerified": 6, // California disclosed
    "licenseTypeVerified": 1, // MD disclosed
    "specialtyVerified": 0 // Hidden
  }
}
```

### Scenario 3: Specialty Verification
```json
{
  "description": "Verify cardiologist license",
  "publicInputs": {
    "verifierDID": "did:web:cardiology-clinic.com",
    "challengeNonce": "0x9876543210fedcba",
    "minLicenseDate": 1546300800, // 2019-01-01
    "requiredState": 0,
    "specialtyRequired": 5, // Cardiology
    "currentTimestamp": 1727222400
  },
  "expectedOutputs": {
    "isValidLicense": 1,
    "specialtyVerified": 5, // Cardiology disclosed
    "licenseTypeVerified": 1, // MD disclosed
    "stateVerified": 0 // Hidden
  }
}
```

## Revocation Handling

### Revocation Registry Circuit
```circom
template RevocationCheck(TREE_HEIGHT) {
    signal input revocationRoot;        // Merkle root of revocation list
    signal input licenseCommitment;     // License commitment
    signal input revocationProof[TREE_HEIGHT]; // Non-membership proof
    signal input revocationIndex;       // Claimed index in tree

    signal output isNotRevoked;         // 1 if not revoked

    // Verify non-membership in revocation tree
    component merkleProof = MerkleTreeInclusionProof(TREE_HEIGHT);
    merkleProof.leaf <== licenseCommitment;
    merkleProof.pathElements <== revocationProof;
    merkleProof.pathIndices <== revocationIndex;

    // License is valid if NOT in revocation tree
    isNotRevoked <== 1 - merkleProof.root;
}
```

## Testing Requirements

### Unit Tests
- Signature verification with valid/invalid signatures
- Date constraint validation (past, current, future dates)
- State code matching logic
- Specialty code matching logic
- Selective disclosure functionality
- Nullifier uniqueness and collision resistance

### Integration Tests
- End-to-end proof generation and verification
- Multiple verifier scenarios
- Edge cases (expired licenses, revoked licenses)
- Performance benchmarks
- Memory usage validation

### Fuzzing Tests
- Random input generation
- Constraint system stress testing
- Proof malleability testing
- Soundness validation

## Security Considerations

### Soundness Requirements
1. **License Validity**: Invalid licenses cannot generate valid proofs
2. **Date Integrity**: Cannot fake license issue or expiration dates
3. **Signature Binding**: Proofs tied to specific medical board signatures
4. **Anti-Replay**: Nullifiers prevent proof reuse
5. **Selective Disclosure**: Hidden attributes remain cryptographically hidden

### Zero-Knowledge Requirements
1. **License Number Privacy**: License numbers not revealed
2. **Personal Information Privacy**: Names, SSNs, addresses hidden
3. **Unlinkability**: Proofs from same license not linkable
4. **Metadata Privacy**: Internal credential structure hidden

### Implementation Security
- Trusted setup ceremony for circuit parameters
- Secure random number generation for proofs
- Side-channel attack resistance
- Hardware security module integration for sensitive operations

## Circuit Compilation

### Build Process
```bash
# Install dependencies
npm install -g circom
npm install snarkjs

# Compile circuit
circom state_license_verification.circom --r1cs --wasm --sym

# Generate proving and verification keys (after trusted setup)
snarkjs groth16 setup state_license_verification.r1cs powersoftau_final.ptau \
  state_license_verification_0000.zkey

# Generate final keys
snarkjs zkey contribute state_license_verification_0000.zkey \
  state_license_verification_final.zkey --name="Contribution"

# Export verification key
snarkjs zkey export verificationkey state_license_verification_final.zkey \
  verification_key.json
```

### Deployment Checklist
- [ ] Circuit compilation successful
- [ ] Constraint count within target range (<100k)
- [ ] All test vectors pass
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Trusted setup ceremony completed
- [ ] Verification keys published
- [ ] Integration tests pass

---

*Document Version: 1.0*
*Last Updated: September 2025*
*Next Review: December 2025*