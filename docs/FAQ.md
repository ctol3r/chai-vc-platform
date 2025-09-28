generated-by: Claude 2025-09-26T00:00:00Z
# Developer FAQ - Top 20 Questions

## Getting Started

### 1. How do I set up the development environment?
```bash
# Clone repository
git clone https://github.com/your-org/chai-vc-platform.git
cd chai-vc-platform

# Install dependencies
npm install

# Start development servers
cd backend && npm run dev &
cd frontend && npm run dev
```
Backend runs on `:3000`, frontend on `:3001`.

### 2. What are the main components of the platform?
- **Backend**: Express + Apollo GraphQL + Prisma ORM
- **Frontend**: Next.js + TypeScript + React
- **Blockchain**: Substrate pallets + Solidity contracts
- **Privacy**: Zero-knowledge proofs (Circom circuits)
- **Database**: PostgreSQL with encrypted PII/PHI storage

### 3. How do I run tests?
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# End-to-end tests
./scripts/smoke_e2e.sh

# Specific test suites
npm run test:verifier
npm run test:hitl
```

## API & Integration

### 4. How do I authenticate API requests?
```bash
# Get API key from platform admin
export API_KEY="your-api-key"

# Use in requests
curl -H "Authorization: Bearer $API_KEY" \
  https://api.chai-vc.com/api/credentials
```

### 5. What's the credential verification flow?
```bash
# 1. Issue credential
POST /api/credentials/issue
{"subjectId": "did:example:123", "credentialType": "MedicalLicense"}

# 2. Verify credential
POST /api/credentials/verify
{"vcJwt": "eyJhbGciOiJFUzI1NksiLCJ..."}

# 3. Check status
GET /api/credentials/{id}/status
```

### 6. How do I handle rate limiting?
- Standard rate limit: 100 requests/minute per API key
- Verification endpoints: 50 requests/minute
- Retry with exponential backoff on `HTTP 429`
- Contact support for higher limits

## Architecture & Design

### 7. How is PII/PHI protected?
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Zero-knowledge proofs**: Verify without revealing data
- **Access controls**: RBAC with minimum necessary access
- **Audit logging**: All PHI access logged and monitored

### 8. What blockchain networks are supported?
- **Primary**: Custom Substrate-based chain
- **Ethereum**: Smart contracts for governance and tokens
- **Testnets**: Sepolia (Ethereum), Local devnet (Substrate)
- **Future**: Polkadot parachain, additional EVM chains

### 9. How does the HITL (Human-in-the-Loop) system work?
- **Automatic routing**: Low-confidence verifications → human review
- **Queue types**: Emergency (30min), Urgent (4h), Standard (24h)
- **API access**: `GET /api/hitl/queue/{reviewerId}`
- **Decision tracking**: All decisions logged for compliance

## Privacy & Compliance

### 10. How do you handle GDPR/CCPA compliance?
- **Data minimization**: Collect only necessary information
- **Right to erasure**: `DELETE /api/users/{id}` with full purge
- **Data portability**: `GET /api/users/{id}/export`
- **Consent management**: Granular privacy controls

### 11. What about HIPAA compliance?
- **Business Associate Agreements**: Required for PHI access
- **Audit trails**: Complete access logging
- **Encryption**: All PHI encrypted in storage and transit
- **Access controls**: Role-based with minimum necessary access

### 12. How is data retained and deleted?
```yaml
retention_schedule:
  audit_logs: 7_years
  credential_proofs: 7_years
  user_profiles: until_deletion_request
  cache_data: 24_hours
  debug_logs: 30_days
```

## Development & Deployment

### 13. How do I add a new API endpoint?
```bash
# 1. Add route in backend/src/routes/
# 2. Implement controller logic
# 3. Add tests in __tests__/
# 4. Update API documentation
# 5. Submit PR with proper template
```

### 14. What's the deployment process?
- **Staging**: Auto-deploy on PR merge to `develop`
- **Production**: Manual approval required
- **Rollback**: `kubectl rollout undo deployment/backend-api`
- **Monitoring**: Health checks and alerts configured

### 15. How do I debug issues?
```bash
# Check application logs
kubectl logs deployment/backend-api -n production

# Database queries
./scripts/db_debug.sh --query="SELECT * FROM credentials LIMIT 10"

# Health status
curl https://api.chai-vc.com/health
```

## Security & Best Practices

### 16. What are the security requirements?
- **No secrets in code**: Use environment variables
- **Input validation**: Validate all user inputs
- **SQL injection prevention**: Use parameterized queries
- **Authentication**: Require API keys for all endpoints
- **Rate limiting**: Implement appropriate limits

### 17. How do I report security vulnerabilities?
- **Email**: security@chai-vc.com
- **Bug bounty**: Up to $15,000 for critical findings
- **Response time**: 24-48 hours for initial assessment
- **Disclosure**: Responsible disclosure policy

### 18. What coding standards should I follow?
- **TypeScript**: Strict mode enabled, no `any` types
- **Linting**: ESLint + Prettier configuration
- **Testing**: >80% code coverage required
- **Documentation**: Document all public APIs
- **Security**: Follow OWASP guidelines

## Troubleshooting

### 19. Common issues and solutions

**Dependency resolution error:**
```bash
npm install
```

**Database connection error:**
```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
./scripts/db_connection_test.sh
```

**Tests failing:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Reset test database
npm run db:test:reset
```

### 20. Who should I contact for help?

**Technical questions**: @backend-team on Slack
**API issues**: @api-support on GitHub issues
**Security concerns**: security@chai-vc.com
**Compliance questions**: @legal-compliance team
**General support**: support@chai-vc.com

## Additional Resources

- **API Documentation**: `/docs/api/README.md`
- **Architecture Overview**: `/docs/technical-architecture.md`
- **Contributing Guide**: `/CONTRIBUTING.md`
- **Security Guidelines**: `/docs/security/review-checklist.md`
- **Compliance**: `/docs/compliance/`

---

*Can't find what you're looking for? Check the full documentation index at `/docs/index.md` or reach out to the team on Slack.*
