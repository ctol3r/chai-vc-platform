generated-by: Claude 2025-09-26T00:00:00Z
# Contributing to Chai VC Platform

## Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `agents/claude/description` - Agent-generated changes
- `hotfix/description` - Production fixes

## Commit Messages
```
type(scope): description

feat(api): add credential verification endpoint
fix(auth): resolve JWT token expiration issue
docs(api): update authentication examples
test(hitl): add reviewer queue tests
```

## PR Process
1. Create branch from `main`
2. Use appropriate PR template (human.md or agent.md)
3. Add required reviewers based on CODEOWNERS
4. Ensure all checks pass
5. Squash merge after approval

## Code Standards
- TypeScript for all new backend code
- ESLint + Prettier formatting
- Jest tests for new functionality
- Document public APIs

## Security
- Never commit secrets or keys
- Use environment variables for config
- Follow HIPAA compliance guidelines
- Add security review for crypto changes