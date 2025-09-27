# ZKP Trusted-Setup Plan

## Executive Summary

This document outlines the trusted setup ceremony plan for the Chai VC Platform's zero-knowledge proof system. The trusted setup is critical for ensuring the security and privacy guarantees of our ZK-SNARK implementation while maintaining transparency and verifiability of the ceremony process.

## Overview

### Purpose
The trusted setup ceremony generates the common reference string (CRS) and proving/verification keys required for our zero-knowledge proof circuits. This ceremony is essential for:
- Generating secure cryptographic parameters
- Establishing trust in the ZK system
- Ensuring no backdoors exist in the parameter generation
- Creating verifiable proof of ceremony integrity

### Cryptographic Requirements
- **Circuit Family**: BN254 curve with Groth16 proving system
- **Ceremony Type**: Universal trusted setup (supporting multiple circuits)
- **Security Level**: 128-bit security
- **Participants**: Minimum 20, target 50+ contributors
- **Phases**: Powers of Tau + circuit-specific phase

## Ceremony Architecture

### Phase 1: Powers of Tau (Universal Setup)
```
Participant 1 → Participant 2 → ... → Participant N
      ↓              ↓                    ↓
   tau^1, tau^2, tau^3, ..., tau^{2^n}
```

**Objectives:**
- Generate powers of tau up to 2^28 (supporting circuits up to ~134M constraints)
- Create structured reference string (SRS)
- Establish foundation for all future circuits

### Phase 2: Circuit-Specific Setup
```
Circuit 1: Medical License Verification
Circuit 2: Age Verification
Circuit 3: Employment History
Circuit 4: Educational Credentials
```

**Per-Circuit Requirements:**
- Proving key (pk) and verification key (vk) generation
- Circuit-specific toxic waste elimination
- Parameter verification and testing

## Participant Requirements

### Eligibility Criteria
1. **Technical Competency**: Demonstrated experience with cryptographic software
2. **Hardware Requirements**:
   - 32GB+ RAM
   - 1TB+ available storage
   - Reliable internet connection
3. **Geographic Distribution**: Maximum 20% from any single country
4. **Organizational Diversity**: No more than 2 participants from same organization

### Participant Categories
- **Healthcare Organizations**: 30% (hospitals, medical boards, insurance)
- **Technology Companies**: 25% (blockchain, privacy tech, security firms)
- **Academic Institutions**: 20% (universities, research institutes)
- **Government/Regulatory**: 15% (health departments, standards bodies)
- **Community Contributors**: 10% (individual developers, advocates)

### Participant Responsibilities
1. **Pre-Ceremony**:
   - Complete security audit of local environment
   - Generate and secure entropy sources
   - Verify software checksums
   - Sign participation agreement

2. **During Ceremony**:
   - Execute contribution software in air-gapped environment
   - Provide entropy for randomness beacon
   - Generate attestation of honest participation
   - Destroy local toxic waste

3. **Post-Ceremony**:
   - Verify their contribution in final parameters
   - Provide public attestation of participation
   - Maintain confidentiality of private randomness

## Ceremony Protocol

### Pre-Ceremony Phase (4 weeks)

#### Week 1-2: Participant Recruitment
```
Day 1-7:   Public announcement and application opening
Day 8-14:  Participant vetting and selection
```

#### Week 3-4: Preparation
```
Day 15-21: Software distribution and testing
Day 22-28: Security review and environment setup
```

### Main Ceremony Phase (2 weeks)

#### Powers of Tau (1 week)
```
Contributor queue: [P1] → [P2] → [P3] → ... → [P50]
Each contribution: 4-6 hours computing + verification
Total Phase 1 time: ~7 days
```

#### Circuit-Specific Phase (1 week)
```
Parallel circuit processing:
- Medical License Circuit: Contributors 1-15
- Age Verification Circuit: Contributors 16-30
- Employment Circuit: Contributors 31-45
- Educational Circuit: Contributors 46-50+
```

### Post-Ceremony Phase (1 week)
```
Day 1-3: Parameter verification and testing
Day 4-5: Final attestation collection
Day 6-7: Public parameter publication
```

## Security Measures

### Environment Security
1. **Air-Gapped Systems**: All contributions performed offline
2. **Hardware Attestation**: TPM/SGX verification where available
3. **Source Code Verification**: Reproducible builds with checksums
4. **Entropy Sources**: Multiple independent randomness sources

### Toxic Waste Elimination
```
Participant Actions:
1. Generate random τ (tau)
2. Compute τ^1, τ^2, ..., τ^{2^n}
3. Pass structured output to next participant
4. SECURELY DELETE τ and all intermediate values
5. Generate attestation of honest behavior
```

### Verification Protocols
1. **Contribution Verification**: Each participant verifies previous contributions
2. **Randomness Beacon**: External entropy from multiple sources
3. **Multi-Party Computation**: No single point of failure
4. **Public Auditability**: All contributions publicly verifiable

## Software Stack

### Core Components
```
ceremony-coordinator/     # Ceremony orchestration
├── src/
│   ├── phase1/          # Powers of Tau implementation
│   ├── phase2/          # Circuit-specific setup
│   ├── verification/    # Parameter verification
│   └── attestation/     # Attestation management
├── circuits/
│   ├── medical_license.circom
│   ├── age_verification.circom
│   ├── employment.circom
│   └── education.circom
└── tests/               # Comprehensive test suite
```

### Dependencies
- **Circom**: Circuit compilation
- **snarkjs**: JavaScript implementation
- **arkworks-rs**: Rust implementation (backup)
- **Phase2-bn254**: Specialized setup tools

### Build and Distribution
```bash
# Reproducible build process
docker build -t ceremony-setup:v1.0.0 .
docker run --rm ceremony-setup:v1.0.0 --verify-checksums
```

## Risk Management

### Technical Risks

#### Circuit Bugs
- **Risk**: Incorrect circuit implementation
- **Mitigation**: Formal verification, multiple audits, extensive testing
- **Detection**: Property-based testing, symbolic execution

#### Parameter Corruption
- **Risk**: Invalid or malicious parameters
- **Mitigation**: Multi-party verification, independent implementations
- **Detection**: Cross-verification between implementations

#### Software Vulnerabilities
- **Risk**: Compromised ceremony software
- **Mitigation**: Security audits, reproducible builds, checksums
- **Detection**: Binary comparison, static analysis

### Operational Risks

#### Participant Dropout
- **Risk**: Insufficient participation
- **Mitigation**: 50+ participant buffer, backup contributors
- **Contingency**: Emergency participant pool (vetted)

#### Coordination Failures
- **Risk**: Ceremony delays or failures
- **Mitigation**: Automated orchestration, clear protocols
- **Recovery**: Restart procedures, checkpoint mechanisms

#### Communication Issues
- **Risk**: Information asymmetry
- **Mitigation**: Multi-channel communication, clear documentation
- **Backup**: Emergency contact protocols

### Security Risks

#### Adversarial Participation
- **Risk**: Malicious participants
- **Mitigation**: 1-of-N security model, participant vetting
- **Detection**: Behavioral analysis, contribution verification

#### Collusion Attacks
- **Risk**: Coordinated compromise
- **Mitigation**: Geographic/organizational diversity
- **Monitoring**: Communication pattern analysis

#### Side-Channel Attacks
- **Risk**: Information leakage during computation
- **Mitigation**: Air-gapped environments, hardware attestation
- **Verification**: Timing analysis, power consumption monitoring

## Ceremony Timeline

### Pre-Ceremony (Month 1)
```
Week 1: [Planning Phase]
- Finalize circuit implementations
- Complete security audit
- Prepare ceremony software

Week 2: [Recruitment Phase]
- Launch participant application
- Begin vetting process
- Set up communication channels

Week 3: [Selection Phase]
- Select participants
- Distribute software packages
- Conduct training sessions

Week 4: [Preparation Phase]
- Participant environment setup
- Final software testing
- Security review completion
```

### Main Ceremony (Month 2, Weeks 1-2)
```
Week 1: [Phase 1 - Powers of Tau]
Day 1-2: Initialize ceremony, first 10 contributions
Day 3-4: Contributions 11-30
Day 5-6: Contributions 31-50
Day 7:   Phase 1 completion and verification

Week 2: [Phase 2 - Circuit Setup]
Day 1-2: Medical license circuit setup
Day 3-4: Age verification circuit setup
Day 5-6: Employment/education circuits setup
Day 7:   Phase 2 completion and verification
```

### Post-Ceremony (Month 2, Weeks 3-4)
```
Week 3: [Verification Phase]
Day 1-3: Cross-verification of all parameters
Day 4-5: Independent audit completion
Day 6-7: Final parameter preparation

Week 4: [Publication Phase]
Day 1-2: Public parameter release
Day 3-4: Documentation publication
Day 5-7: Community verification period
```

## Output Artifacts

### Cryptographic Parameters
```
parameters/
├── phase1/
│   ├── powersoftau_final.ptau
│   └── verification_data.json
├── phase2/
│   ├── medical_license.zkey
│   ├── age_verification.zkey
│   ├── employment.zkey
│   └── education.zkey
└── verification_keys/
    ├── medical_license_vk.json
    ├── age_verification_vk.json
    ├── employment_vk.json
    └── education_vk.json
```

### Attestations
```
attestations/
├── participants/
│   ├── participant_001_attestation.json
│   ├── participant_002_attestation.json
│   └── ...
├── ceremony_transcript.json
└── final_verification_report.pdf
```

### Documentation
```
docs/
├── ceremony_report.md
├── parameter_verification.md
├── participant_attestations.md
└── security_analysis.pdf
```

## Verification and Auditability

### Public Verification
1. **Parameter Verification**: Anyone can verify ceremony integrity
2. **Contribution Tracing**: Each contribution publicly linkable
3. **Randomness Verification**: Entropy sources publicly auditable
4. **Software Integrity**: Reproducible builds with public checksums

### Independent Audits
- **Academic Review**: University cryptography departments
- **Commercial Audit**: Professional security firms
- **Community Review**: Open source cryptography community
- **Regulatory Review**: Relevant healthcare/privacy regulators

### Long-term Integrity
- **Archive Storage**: Multiple geographic locations
- **Backup Procedures**: Regular integrity checks
- **Update Mechanisms**: Process for parameter updates if needed
- **Transparency Logs**: Immutable ceremony records

## Emergency Procedures

### Ceremony Restart
```
Triggers:
- Critical software vulnerability discovered
- Significant participant dropout (>30%)
- Evidence of parameter corruption
- Major security incident

Process:
1. Immediate ceremony suspension
2. Root cause analysis
3. Stakeholder notification
4. Software/process updates
5. New ceremony initiation
```

### Parameter Revocation
```
Triggers:
- Cryptographic weakness discovered
- Evidence of ceremony compromise
- Regulatory requirement

Process:
1. Public announcement
2. Parameter deprecation timeline
3. New ceremony scheduling
4. Migration assistance
```

## Post-Ceremony Operations

### Parameter Deployment
1. **Integration Testing**: Full system integration tests
2. **Staged Rollout**: Gradual deployment to production
3. **Monitoring**: Parameter usage and performance monitoring
4. **Backup Systems**: Alternative parameter sets for emergency

### Ongoing Maintenance
- **Quarterly Reviews**: Parameter integrity verification
- **Annual Audits**: Security and process reviews
- **Community Updates**: Regular communication with stakeholders
- **Research Monitoring**: Track advances in cryptographic attacks

---

*Document Version: 1.0*
*Last Updated: September 2025*
*Next Review: December 2025*