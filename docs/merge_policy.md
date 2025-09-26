generated-by: Claude 2025-09-26T00:00:00Z
# Merge Policy

## Required Checks
- ✅ All CI tests pass
- ✅ Code coverage >80%
- ✅ Lint/format checks pass
- ✅ Security scan clean
- ✅ Required approvals received

## Approval Requirements

### Code Changes
- 1 approval from @backend-team (for backend)
- 1 approval from @product (for frontend/UX)

### Security/Crypto Changes
- 1 approval from @security-team
- Security review checklist completed

### Compliance/Policy Changes
- 1 approval from @legal-compliance
- Compliance review checklist completed

### Documentation
- 1 approval from relevant team (@product, @backend-team, @legal-compliance)

## Branch Protection
- `main` branch protected
- No direct pushes to main
- Require PR before merge
- Dismiss stale reviews on new commits
- Require status checks to pass

## Merge Strategy
- Squash commits for feature branches
- Preserve commit history for release branches
- Delete feature branches after merge