generated-by: Claude 2025-09-26T00:00:00Z
# Labels Policy

## Standard Labels

### Type
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `hotfix` - Critical production fix

### Component
- `backend` - Backend API/services
- `frontend` - UI/UX changes
- `contracts` - Smart contracts
- `agents` - Agent-generated changes

### Priority
- `critical` - Security/production issue
- `high` - Important feature/fix
- `medium` - Standard priority
- `low` - Nice to have

### Process
- `triage` - Needs initial review
- `approved-by` - Has required approvals
- `compliance` - Compliance-related changes
- `security` - Security review required
- `PHI-risk` - Handles patient data

## Usage
- PRs must have at least one type and component label
- Critical/security issues require immediate triage
- Compliance/PHI-risk labels trigger additional review