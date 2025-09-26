generated-by: Claude 2025-09-26T00:00:00Z
# How to PR - Steps, Labels, Required Checks

## Pre-PR Checklist

### Before Creating Your PR
- [ ] **Branch naming**: Follow convention (`feature/`, `fix/`, `docs/`)
- [ ] **Local testing**: All tests pass locally
- [ ] **Code quality**: Run linter and fix all issues
- [ ] **Documentation**: Update relevant docs if needed
- [ ] **Security review**: No secrets or sensitive data committed

### Code Quality Requirements
```bash
# Run these before submitting PR
npm run lint          # Fix all linting issues
npm run test          # All tests must pass
npm run build         # Must build successfully
npm run typecheck     # TypeScript must compile
```

## Creating the PR

### 1. Choose the Right Template
- **Human changes**: Use `.github/PULL_REQUEST_TEMPLATE/human.md`
- **Agent changes**: Use `.github/PULL_REQUEST_TEMPLATE/agent.md`

### 2. Required PR Information
```markdown
**Why**: Clear problem statement
**What changed**: Specific files and functionality
**Tests**: How you validated the changes
**Risk**: Potential impact and mitigation
**Approvals Needed**: Based on CODEOWNERS
```

### 3. Add Appropriate Labels

#### Type Labels (Required - choose one)
- `enhancement` - New features or improvements
- `bug` - Bug fixes and corrections
- `documentation` - Documentation updates
- `hotfix` - Critical production fixes

#### Component Labels (Required - choose all that apply)
- `backend` - Backend API/services changes
- `frontend` - UI/UX changes
- `contracts` - Smart contract modifications
- `agents` - AI agent generated changes

#### Priority Labels (Optional)
- `critical` - Security or production issues
- `high` - Important features or fixes
- `medium` - Standard priority items
- `low` - Nice-to-have improvements

#### Process Labels (Applied automatically or by reviewers)
- `approved-by` - Has all required approvals
- `compliance` - Compliance review completed
- `security` - Security review required/completed
- `PHI-risk` - Handles patient health information

## Required Checks & Approvals

### Automated Checks (Must Pass)
- [ ] **CI Tests**: All test suites pass
- [ ] **Build**: Code builds successfully
- [ ] **Linting**: No linting errors
- [ ] **Security Scan**: No new vulnerabilities
- [ ] **Type Check**: TypeScript compilation

### Required Approvals (Based on Changes)

#### Code Changes
- **Backend code**: 1 approval from @backend-team
- **Frontend code**: 1 approval from @product
- **Smart contracts**: 1 approval from @blockchain-team

#### Security/Crypto Changes
- **Any security-related code**: 1 approval from @security-team
- **Cryptographic implementations**: Security review checklist completed
- **Key management changes**: Additional security team review

#### Compliance/Policy Changes
- **PHI/PII handling**: 1 approval from @legal-compliance
- **Privacy policy updates**: Legal team approval required
- **HIPAA-related changes**: Compliance review checklist completed

#### Documentation
- **Technical docs**: 1 approval from relevant technical team
- **Policy documents**: 1 approval from @legal-compliance
- **User-facing docs**: 1 approval from @product

### Review Checklists

#### For Security Reviews
- [ ] No hardcoded secrets or credentials
- [ ] Proper input validation and sanitization
- [ ] Appropriate error handling (no info leakage)
- [ ] Access controls properly implemented
- [ ] Audit logging for sensitive operations

#### For Compliance Reviews
- [ ] HIPAA compliance maintained
- [ ] Privacy policy implications considered
- [ ] Data retention rules followed
- [ ] Cross-border transfer restrictions respected
- [ ] Audit trail requirements met

## PR Process Flow

### 1. Submit PR
```bash
git push origin feature/your-branch-name
# Create PR through GitHub UI
# Fill out PR template completely
# Add appropriate labels
```

### 2. Automated Review
- CI checks run automatically
- Security scans execute
- Code quality checks perform
- PR blocked if any automated checks fail

### 3. Human Review Process
```yaml
review_timeline:
  initial_review: "24-48 hours"
  security_review: "2-5 business days (if required)"
  compliance_review: "3-7 business days (if required)"
  final_approval: "24 hours after all requirements met"
```

### 4. Approval & Merge
- All required approvals obtained
- All automated checks passing
- Squash merge for feature branches
- Immediate deployment to staging (if applicable)

## Common Issues & Solutions

### PR Blocked Issues

**Missing approvals:**
- Check CODEOWNERS file for required reviewers
- Ping appropriate team in Slack if no response after 48h
- Use appropriate labels to signal review type needed

**Failed CI checks:**
- Review CI logs in GitHub Actions tab
- Fix issues and push new commits
- Checks will re-run automatically

**Merge conflicts:**
```bash
# Update your branch with latest main
git checkout main && git pull
git checkout your-branch
git merge main
# Resolve conflicts, test, and push
```

**Security scan failures:**
- Review security scan results
- Update dependencies if vulnerabilities found
- Contact @security-team if false positives suspected

### Review Process Issues

**Slow review times:**
- Ensure PR has proper labels and description
- Ping reviewers in Slack (after 48h for non-critical)
- Break large PRs into smaller, focused changes

**Conflicting feedback:**
- Schedule sync meeting with conflicting reviewers
- Document decisions in PR comments
- Escalate to team leads if needed

**Missing context:**
- Add more detailed PR description
- Reference related issues or documentation
- Include before/after examples or screenshots

## Emergency/Hotfix Process

### For Critical Issues
```bash
# Create hotfix branch from main
git checkout main && git pull
git checkout -b hotfix/critical-security-fix

# Make minimal changes
# Test thoroughly
# Create PR with 'critical' label
# Ping @security-team and @backend-team immediately
```

### Expedited Review
- **Critical/Security**: 30 minutes - 2 hours
- **Production down**: Immediate review required
- **Data breach risk**: All hands on deck

## Best Practices

### PR Size & Scope
- **Small PRs**: Easier to review, faster approval
- **Single responsibility**: One logical change per PR
- **Documentation**: Include relevant documentation updates
- **Testing**: Add tests for new functionality

### Communication
- **Clear titles**: Descriptive PR titles help reviewers
- **Detailed descriptions**: Help reviewers understand context
- **Respond promptly**: Address review feedback quickly
- **Ask questions**: Clarify feedback if unclear

### After PR Merge
- **Monitor deployment**: Watch for issues in staging/production
- **Clean up**: Delete feature branch after merge
- **Follow up**: Address any post-merge issues quickly

---

**Need help?** Contact @backend-team on Slack or open a GitHub issue with the `help-wanted` label.