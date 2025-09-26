generated-by: Claude 2025-09-26T00:00:00Z
# Release Process

## Release Steps
1. **Prepare Release**
   - Update CHANGELOG.md with release notes
   - Run full test suite: `npm run test:ci`
   - Security scan: `npm audit --audit-level=high`

2. **Cut Release**
   - Create release branch: `git checkout -b release/v1.2.3`
   - Tag version: `git tag -a v1.2.3 -m "Release v1.2.3"`
   - Push tag: `git push origin v1.2.3`

3. **Deploy**
   - Staging deployment triggers automatically
   - Production deployment requires manual approval
   - Monitor health endpoints post-deployment

## Rollback Process
```bash
# Immediate rollback
kubectl rollout undo deployment/backend-api -n production
kubectl rollout undo deployment/frontend-app -n production

# Database rollback (if needed)
./scripts/db_rollback.sh --version=v1.2.2

# Verify rollback
curl https://api.chai-vc.com/health
```

## Owners
- **Release Manager**: @backend-team lead
- **Production Deploy**: @ops-team
- **Hotfix Approval**: @cto