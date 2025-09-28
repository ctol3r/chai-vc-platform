# Technical Architecture Document

## Executive Summary

The Chai VC Platform is an end-to-end healthcare credentialing and hiring verification system built on a microservices architecture with blockchain integration. The platform enables secure issuance, verification, and management of healthcare credentials while maintaining privacy and regulatory compliance.

## Architecture Overview

### High-Level Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Next.js)     │◄──►│   (GraphQL)     │◄──►│   (Substrate)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   ACA-Py Agent  │              │
         └──────────────►│   (Aries)       │◄─────────────┘
                        └─────────────────┘
```

### Core Services

1. **Frontend Application** (`frontend/`)
   - Next.js-based React application
   - Client-side encryption vault (`frontend/vault/`)
   - Onboarding wizard with GPT integration
   - Wallet interface for credential management

2. **Backend API** (`backend/`)
   - GraphQL API powered by Apollo Server
   - Express.js middleware stack
   - Prisma ORM for database operations
   - PostgreSQL database

3. **ACA-Py Agent** (`aca_py_agent/`)
   - Hyperledger Aries Cloud Agent Python
   - Supports AnonCreds and W3C Verifiable Credentials
   - Selective disclosure capabilities

4. **Blockchain Layer**
   - Substrate-based blockchain (`substrate/`)
   - Polkadot ecosystem integration
   - Smart contracts on EVM-compatible chains
   - Cross-chain DID resolution

## Core Technologies

### Backend Stack
- **Runtime**: Node.js with TypeScript
- **API Layer**: GraphQL with Apollo Server
- **Web Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: mTLS for service-to-service communication
- **Policy Engine**: Open Policy Agent (OPA)

### Frontend Stack
- **Framework**: Next.js (React)
- **Styling**: CSS-in-JS (styled-jsx)
- **State Management**: React Context/Hooks
- **Client-side Encryption**: Web Crypto API

### Blockchain Integration
- **Primary Chain**: Substrate/Polkadot
- **EVM Compatibility**: Ethereum, Avalanche, other EVM chains
- **Interoperability**: Cross-chain DID resolution
- **Smart Contracts**: Solidity for EVM, Rust for Substrate

## Data Architecture

### Database Schema (Prisma)
- **Credentials**: Core credential data
- **Users**: User management and profiles
- **Issuers**: Trusted credential issuers
- **Verifiers**: Verification service providers

### Blockchain Storage
- **On-Chain**: Hashes, proofs, and public metadata
- **Off-Chain**: Full credential data with encryption
- **IPFS**: Distributed storage for larger documents

### Privacy & Encryption
- **Client-side encryption** for PII before transmission
- **Zero-knowledge proofs** for selective disclosure
- **Hardware security modules** for key management

## Security Architecture

### Key Management
- **Hardware Wallets**: YubiKey, Ledger for issuer keys
- **Key Rotation**: Automated policy-based rotation
- **Multi-signature**: Required for critical operations

### Transport Security
- **mTLS**: All service-to-service communication
- **TLS 1.3**: Client-to-server communication
- **Certificate Management**: Kubernetes secret mounting

### Access Control
- **OPA Policies**: Centralized policy enforcement
- **RBAC**: Role-based access control
- **JWT Tokens**: Stateless authentication

## Compliance & Governance

### Regulatory Compliance
- **HIPAA**: Healthcare data protection
- **GDPR/CCPA**: Data privacy and right-to-erasure
- **SOC 2**: Security controls and compliance

### Governance
- **On-chain Voting**: Community governance via DAO
- **Proposal System**: Democratic decision making
- **Economic Parameters**: Configurable via governance

## Deployment Architecture

### Kubernetes Infrastructure
```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Frontend   │  │   Backend   │  │   ACA-Py    │     │
│  │   Service   │  │   Service   │  │   Agent     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │     OPA     │  │  PostgreSQL │  │   Redis     │     │
│  │   Sidecar   │  │  Database   │  │   Cache     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Deployment Strategy
- **Canary Deployments**: Argo Rollouts with automated analysis
- **Blue-Green**: Zero-downtime deployments
- **Multi-region**: Disaster recovery and failover

## Integration Points

### External Services
- **Ocean Protocol**: Data monetization marketplace
- **Chainlink**: Oracle services for off-chain data
- **Universal Resolver**: DID resolution across networks

### API Integrations
- **REST APIs**: External verifier integrations
- **GraphQL**: Primary client interface
- **WebSocket**: Real-time updates

### SDKs
- **Solana SDK**: Solana blockchain integration
- **Avalanche SDK**: Avalanche network support
- **JavaScript SDK**: Web application integration

## Performance & Scalability

### Caching Strategy
- **Redis**: Session and API response caching
- **CDN**: Static asset delivery
- **Database**: Query optimization and indexing

### Load Balancing
- **Horizontal Scaling**: Container orchestration
- **Database Sharding**: Partitioned data storage
- **Microservices**: Independent service scaling

### Monitoring & Observability
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard and visualization
- **Distributed Tracing**: Request flow tracking
- **Log Aggregation**: Centralized logging

## Future Architecture Considerations

### Planned Enhancements
- **zk-SNARK Integration**: Advanced privacy proofs
- **Layer 2 Solutions**: Optimistic rollups for scalability
- **Mobile SDKs**: Native mobile application support
- **API Gateway**: Centralized API management

### Scalability Targets
- **Throughput**: 10,000+ credentials/minute
- **Latency**: <100ms API response times
- **Availability**: 99.9% uptime SLA
- **Storage**: Petabyte-scale document storage

## Security Considerations

### Threat Model
- **Credential Forgery**: Cryptographic proof validation
- **Privacy Breaches**: Zero-knowledge selective disclosure
- **Key Compromise**: Hardware-backed key storage
- **Service Attacks**: DDoS protection and rate limiting

### Audit & Compliance
- **Regular Penetration Testing**: Quarterly security assessments
- **Code Audits**: Automated and manual code review
- **Compliance Monitoring**: Continuous compliance validation
- **Incident Response**: 24/7 security operations center

---

*Document Version: 1.0*
*Last Updated: September 2025*
*Next Review: December 2025*