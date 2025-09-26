# Monorepo Layout Proposal

## Current State Analysis

The Chai VC Platform currently has a mixed structure with some monorepo characteristics but lacks consistent organization and clear boundaries between packages. Key issues identified:

- Inconsistent nesting (e.g., `backend/backend/` duplication)
- Mixed responsibilities in single directories
- Unclear dependency relationships
- Scattered configuration files
- No consistent package naming conventions

## Proposed Canonical Structure

```
chai-vc-platform/
├── packages/                          # All reusable packages
│   ├── shared/                        # Shared utilities and types
│   │   ├── types/                     # TypeScript type definitions
│   │   ├── utils/                     # Common utilities
│   │   ├── constants/                 # Shared constants
│   │   └── schemas/                   # Validation schemas
│   ├── crypto/                        # Cryptographic utilities
│   │   ├── zkp/                       # Zero-knowledge proof helpers
│   │   ├── signatures/                # Digital signature utilities
│   │   └── encryption/                # Encryption/decryption helpers
│   ├── blockchain/                    # Blockchain integrations
│   │   ├── substrate/                 # Substrate/Polkadot integration
│   │   ├── ethereum/                  # Ethereum integration
│   │   ├── solana/                    # Solana integration
│   │   └── avalanche/                 # Avalanche integration
│   └── did/                          # DID resolution and management
│       ├── resolvers/                 # DID resolver implementations
│       └── documents/                 # DID document utilities
├── apps/                             # Application deployments
│   ├── api/                          # Backend GraphQL API
│   │   ├── src/
│   │   │   ├── graphql/              # GraphQL schema and resolvers
│   │   │   ├── controllers/          # REST controllers
│   │   │   ├── services/             # Business logic services
│   │   │   ├── models/               # Database models
│   │   │   └── middleware/           # Express middleware
│   │   ├── prisma/                   # Database schema and migrations
│   │   ├── tests/                    # API tests
│   │   └── package.json
│   ├── web/                          # Frontend web application
│   │   ├── src/
│   │   │   ├── components/           # React components
│   │   │   ├── pages/                # Next.js pages
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── utils/                # Frontend utilities
│   │   │   └── styles/               # Styling files
│   │   ├── public/                   # Static assets
│   │   ├── tests/                    # Frontend tests
│   │   └── package.json
│   ├── mobile/                       # Mobile application (future)
│   │   ├── src/
│   │   ├── android/
│   │   ├── ios/
│   │   └── package.json
│   ├── aca-py-agent/                 # Aries Cloud Agent
│   │   ├── src/                      # Agent source code
│   │   ├── config/                   # Agent configuration
│   │   ├── tests/                    # Agent tests
│   │   └── requirements.txt
│   └── ai-matcher/                   # AI matching service
│       ├── src/                      # Matching service code
│       ├── models/                   # ML models
│       └── requirements.txt
├── services/                         # Microservices
│   ├── verifier/                     # Credential verification service
│   ├── issuer/                       # Credential issuance service
│   ├── privacy/                      # Privacy service (/prove, /verify)
│   ├── notification/                 # Notification service
│   └── audit/                        # Audit logging service
├── contracts/                        # Smart contracts
│   ├── substrate/                    # Substrate pallets
│   │   ├── identity-governance/      # Identity governance pallet
│   │   ├── credential-registry/      # Credential registry pallet
│   │   └── staking/                  # Staking pallet
│   ├── ethereum/                     # Ethereum contracts
│   │   ├── src/                      # Solidity contracts
│   │   ├── test/                     # Contract tests
│   │   ├── scripts/                  # Deployment scripts
│   │   └── artifacts/                # Compiled contracts
│   └── shared/                       # Shared contract utilities
├── infrastructure/                   # Infrastructure as Code
│   ├── kubernetes/                   # K8s manifests
│   │   ├── base/                     # Base configurations
│   │   ├── overlays/                 # Environment overlays
│   │   │   ├── development/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── helm/                     # Helm charts
│   ├── terraform/                    # Cloud infrastructure
│   │   ├── modules/                  # Reusable modules
│   │   ├── environments/             # Environment configs
│   │   └── shared/                   # Shared resources
│   └── docker/                       # Docker configurations
├── docs/                            # Documentation
│   ├── architecture/                # Architecture docs
│   ├── api/                         # API documentation
│   ├── deployment/                  # Deployment guides
│   ├── compliance/                  # Compliance documentation
│   ├── security/                    # Security documentation
│   └── development/                 # Development guides
├── tools/                           # Development tools
│   ├── build/                       # Build tools and scripts
│   ├── generators/                  # Code generators
│   ├── linting/                     # Linting configurations
│   └── testing/                     # Testing utilities
├── configs/                         # Shared configurations
│   ├── eslint/                      # ESLint configurations
│   ├── typescript/                  # TypeScript configurations
│   ├── jest/                        # Jest configurations
│   └── prettier/                    # Prettier configurations
├── scripts/                         # Build and utility scripts
│   ├── build/                       # Build scripts
│   ├── deploy/                      # Deployment scripts
│   ├── migration/                   # Migration scripts
│   └── utilities/                   # General utility scripts
├── tests/                          # Integration and E2E tests
│   ├── integration/                 # Integration tests
│   ├── e2e/                        # End-to-end tests
│   └── performance/                 # Performance tests
└── examples/                       # Example implementations
    ├── credential-demo/             # Credential demo
    ├── hospital-integration/        # Hospital integration example
    └── sdk-examples/               # SDK usage examples
```

## Migration Plan

### Phase 1: Foundation Setup (Weeks 1-2)
1. Create new directory structure
2. Set up workspace configuration (package.json workspaces)
3. Configure build tools and CI/CD pipelines
4. Establish shared configuration packages

### Phase 2: Package Extraction (Weeks 3-4)
1. Extract shared utilities into `packages/shared`
2. Create blockchain package structure
3. Move crypto utilities to dedicated package
4. Set up DID resolution package

### Phase 3: Application Restructuring (Weeks 5-6)
1. Restructure backend API into `apps/api`
2. Move frontend to `apps/web`
3. Organize ACA-Py agent into `apps/aca-py-agent`
4. Update all import paths and dependencies

### Phase 4: Service Separation (Weeks 7-8)
1. Extract microservices from monolithic backend
2. Create dedicated privacy service
3. Separate verifier and issuer services
4. Set up service communication patterns

### Phase 5: Infrastructure Organization (Weeks 9-10)
1. Move Kubernetes manifests to `infrastructure/`
2. Organize Docker configurations
3. Set up Terraform modules
4. Migrate CI/CD pipelines

### Phase 6: Final Integration (Weeks 11-12)
1. Update all build scripts and configurations
2. Test full build and deployment pipeline
3. Update documentation
4. Validate all service communications

## Workspace Configuration

### Root package.json
```json
{
  "name": "chai-vc-platform",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*",
    "services/*",
    "tools/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "dev": "turbo run dev --parallel",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Turborepo Configuration (turbo.json)
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Package Naming Convention

- **Scoped packages**: `@chai-vc/package-name`
- **Internal apps**: `@chai-vc/app-*`
- **Shared packages**: `@chai-vc/shared-*`
- **Blockchain packages**: `@chai-vc/blockchain-*`
- **Service packages**: `@chai-vc/service-*`

## Dependency Management

### Internal Dependencies
- Use workspace protocol: `"@chai-vc/shared-types": "workspace:*"`
- Centralized version management via root package.json
- Automated dependency updates via Renovate

### External Dependencies
- Pin exact versions in package.json
- Use pnpm for efficient package management
- Regular security audits via npm audit

## Build and Development

### Build Pipeline
1. **Shared packages** build first (types, utilities)
2. **Apps and services** build in parallel after shared packages
3. **Contracts** compile and generate TypeScript bindings
4. **Docker images** build with optimized layer caching

### Development Workflow
1. Local development with hot reload
2. Automated testing on code changes
3. Lint and format enforcement
4. Pre-commit hooks for code quality

## Benefits of New Structure

### Development Experience
- **Clear separation of concerns**: Each package has a single responsibility
- **Improved build times**: Incremental builds and caching
- **Better IDE support**: Clear module boundaries
- **Consistent tooling**: Shared configurations across packages

### Maintainability
- **Reduced complexity**: Smaller, focused packages
- **Clear dependencies**: Explicit dependency graph
- **Version consistency**: Centralized version management
- **Code reuse**: Shared packages across applications

### Scalability
- **Independent deployments**: Services can be deployed separately
- **Team boundaries**: Clear ownership of packages
- **Technology flexibility**: Different packages can use different technologies
- **Feature flags**: Gradual rollout of new features

## Migration Checklist

- [ ] Create new directory structure
- [ ] Set up workspace configuration
- [ ] Configure Turborepo for build orchestration
- [ ] Extract shared packages
- [ ] Restructure applications
- [ ] Separate microservices
- [ ] Organize infrastructure code
- [ ] Update CI/CD pipelines
- [ ] Migrate documentation
- [ ] Update team documentation and onboarding
- [ ] Validate full build and deployment
- [ ] Performance benchmarking
- [ ] Security review of new structure

## Risk Mitigation

### Technical Risks
- **Breaking changes**: Gradual migration with feature flags
- **Build complexity**: Comprehensive testing of build pipeline
- **Import path changes**: Automated refactoring tools

### Operational Risks
- **Deployment disruption**: Blue-green deployment strategy
- **Team coordination**: Clear communication and documentation
- **Timeline overruns**: Phased approach with rollback plans

---

*Document Version: 1.0*
*Last Updated: September 2025*
*Next Review: December 2025*