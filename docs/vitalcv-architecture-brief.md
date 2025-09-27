# CHAI•VITALCV Architecture Brief
**Healthcare Credentialing Platform - On/Off-Chain Architecture**

## Executive Summary
CHAI•VITALCV is a privacy-preserving healthcare credentialing platform that combines blockchain immutability with off-chain privacy controls. The architecture splits credential storage (off-chain) from verification proofs (on-chain) to achieve HIPAA compliance while maintaining cryptographic integrity.

## Core Architecture

### On-Chain Components (Polkadot Parachain)
- **Credential Registry**: Stores cryptographic hashes, not credential data
- **Revocation Lists**: Immutable revocation status updates
- **Audit Trail**: Verification events and governance decisions
- **Token Economics**: VITA token staking for issuers and validators
- **Governance**: Decentralized issuer approval and slashing mechanisms

### Off-Chain Components (Private Infrastructure)
- **Credential Storage**: Encrypted W3C Verifiable Credentials in secure databases
- **Privacy Service**: Zero-knowledge proof generation (zk-SNARKs, BBS+)
- **Identity Service**: DID resolution and key management
- **HIPAA Layer**: PHI handling, consent management, audit logging
- **Integration APIs**: NPPES, FHIR, wallet connectors

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     VITALCV ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐│
│  │   Healthcare    │    │    Employers     │    │   Wallets   ││
│  │   Providers     │    │   & Verifiers    │    │ & Citizens  ││
│  │  (Issuers)      │    │                  │    │             ││
│  └─────────┬───────┘    └────────┬─────────┘    └──────┬──────┘│
│            │                     │                     │       │
│            │                     │                     │       │
│  ┌─────────▼───────────────────────▼─────────────────────▼─────┐│
│  │                  API GATEWAY                               ││
│  │            (Rate Limiting, Auth, Routing)                  ││
│  └─────────┬───────────────────┬─────────────────────┬───────┘│
│            │                   │                     │        │
│            │                   │                     │        │
│  ┌─────────▼─────┐   ┌─────────▼─────────┐   ┌───────▼──────┐ │
│  │    Identity   │   │  Privacy Service  │   │ Verification │ │
│  │   Service     │   │                   │   │   Service    │ │
│  │               │   │  ┌─────────────┐  │   │              │ │
│  │ • DID Mgmt    │   │  │ ZK Circuit  │  │   │ • Proof      │ │
│  │ • Key Mgmt    │   │  │ Generator   │  │   │   Validation │ │
│  │ • Auth        │   │  └─────────────┘  │   │ • Schema     │ │
│  │               │   │                   │   │   Checks     │ │
│  └───────┬───────┘   │  ┌─────────────┐  │   └──────┬───────┘ │
│          │           │  │ BBS+ Signer │  │          │         │
│          │           │  └─────────────┘  │          │         │
│          │           └─────────┬─────────┘          │         │
│          │                     │                    │         │
│  ┌───────▼─────────────────────▼────────────────────▼───────┐ │
│  │                CREDENTIAL STORAGE                       │ │
│  │                                                         │ │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │  Credentials    │  │ Consent Mgmt │  │ Audit Logs │ │ │
│  │  │  (Encrypted)    │  │              │  │             │ │ │
│  │  │                 │  │ • User       │  │ • Access    │ │ │
│  │  │ • License Data  │  │   Preferences│  │   Events    │ │ │
│  │  │ • Education     │  │ • Disclosure │  │ • Issuance  │ │ │
│  │  │ • Certifications│  │   Policies   │  │   Records   │ │ │
│  │  └─────────────────┘  └──────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                    │                         │
│                                    │                         │
│  ┌─────────────────────────────────▼─────────────────────────┐ │
│  │              BLOCKCHAIN LAYER (Polkadot)                 │ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │ Credential  │  │ Revocation   │  │ Governance &    │  │ │
│  │  │ Registry    │  │ Registry     │  │ Token Economics │  │ │
│  │  │             │  │              │  │                 │  │ │
│  │  │ • Hashes    │  │ • Status     │  │ • Issuer Stake  │  │ │
│  │  │ • Metadata  │  │   Updates    │  │ • Validation    │  │ │
│  │  │ • Issuer    │  │ • Timestamps │  │ • Slashing      │  │ │
│  │  │   Signatures│  │              │  │ • Voting        │  │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Privacy Architecture

### Selective Disclosure Strategy
- **BBS+ Signatures**: Enable selective revelation of credential attributes
- **Zero-Knowledge Proofs**: Prove license validity without revealing details
- **Client-Side Encryption**: PHI encrypted before transmission
- **Consent Management**: Granular permission controls per verification request

### HIPAA Compliance Layer
- **Data Minimization**: Only necessary data processed per verification
- **Audit Trail**: Complete access logging with tamper-evident storage
- **Access Controls**: Role-based permissions with regular reviews
- **Encryption**: AES-256 at rest, TLS 1.3 in transit

## Key Design Decisions

### 1. Hybrid On/Off-Chain Model
**Decision**: Store sensitive data off-chain, proofs on-chain
**Rationale**: Achieves regulatory compliance while maintaining verification integrity

### 2. Multi-Signature Proof System
**Decision**: Support both BBS+ and zk-SNARKs
**Rationale**: BBS+ for selective disclosure, zk-SNARKs for complex license validations

### 3. Substrate/Polkadot Foundation
**Decision**: Build on Polkadot parachain vs. Ethereum
**Rationale**: Better performance, governance features, and interoperability for healthcare ecosystem

## Security Boundaries

### Trust Zones
- **Zone 1**: Blockchain (public, immutable, high trust)
- **Zone 2**: Privacy Service (private, high security, controlled access)
- **Zone 3**: External Integrations (varying trust, rate limited, monitored)

### Key Management
- **Hot Keys**: API operations, credential signing
- **Warm Keys**: Daily operations, automatically rotated
- **Cold Keys**: Governance, emergency recovery, hardware-secured

## Performance Targets

| Component | Target | Current |
|-----------|--------|---------|
| Credential Issuance | < 2s | TBD |
| Proof Generation | < 500ms | TBD |
| Verification | < 100ms | TBD |
| Blockchain Finality | < 12s | ~6s |

## Compliance Framework

### Data Classification
- **Public**: Schema definitions, public keys
- **Internal**: Operational metrics, non-PHI logs
- **Confidential**: Encrypted credentials, consent records
- **Restricted**: Raw PHI, private keys, audit trails

### Regulatory Alignment
- **HIPAA**: PHI handling, breach notification, business associate agreements
- **GDPR**: Right to erasure (off-chain), data portability, consent management
- **SOC2**: Access controls, monitoring, incident response, change management

## Integration Points

### Healthcare Standards
- **FHIR R4**: Practitioner resource mapping to VC schemas
- **NPPES**: Provider enrollment verification and updates
- **HL7**: Clinical data exchange for specialty certifications

### Wallet Ecosystem
- **W3C Standards**: VC/VP exchange protocols
- **Mobile Wallets**: Apple/Google Wallet integration
- **Enterprise**: OIDC/SAML for employer verification systems

**Document Version**: 1.0
**Last Updated**: 2024-01-15
**Next Review**: 2024-04-15