generated-by: Claude 2025-09-26T00:00:00Z
# Bug Bounty Program

## Scope

### In-Scope Assets
- **Primary Domain**: `*.chai-vc.com`
- **API Endpoints**: `/api/*` (excluding rate-limited test endpoints)
- **Mobile Applications**: iOS/Android credential wallet apps
- **Open Source**: GitHub repositories (with security impact)

### Out-of-Scope
- Social engineering attacks
- Physical security testing
- Third-party services (unless direct impact)
- Rate limiting/DDoS testing
- Non-security bugs (use GitHub issues)

## Reward Tiers

### Critical ($5,000 - $15,000)
- Remote code execution
- SQL injection leading to PHI/PII access
- Authentication bypass
- Cryptographic implementation flaws
- Zero-knowledge proof vulnerabilities

### High ($2,000 - $5,000)
- Privilege escalation
- Sensitive data exposure (PHI/PII)
- HIPAA compliance violations
- Cross-site scripting (stored)
- Directory traversal with data access

### Medium ($500 - $2,000)
- Cross-site request forgery
- Information disclosure
- Business logic flaws
- Session management issues
- Cross-site scripting (reflected)

### Low ($100 - $500)
- Security misconfigurations
- Missing security headers
- Clickjacking
- Open redirects
- Information leakage

## Submission Process

### 1. Initial Report
```markdown
**Vulnerability Type**: [e.g., SQL Injection]
**Affected Asset**: [URL/endpoint]
**Risk Level**: [Critical/High/Medium/Low]
**Description**: [Detailed explanation]
**Steps to Reproduce**: [Step-by-step]
**Impact**: [Business/security impact]
**Proof of Concept**: [Screenshots/videos]
```

### 2. Report Validation (48 hours)
- Security team reviews submission
- Vulnerability confirmed or declined
- Initial reward tier assessment
- Researcher communication initiated

### 3. Fix Development (varies by severity)
- **Critical**: 24-48 hours
- **High**: 1-2 weeks
- **Medium**: 2-4 weeks
- **Low**: 4-8 weeks

### 4. Reward Payment (after fix deployment)
- PayPal, bank transfer, or cryptocurrency
- Public acknowledgment (unless researcher prefers anonymity)
- Hall of fame recognition

## Special Healthcare Considerations

### HIPAA-Protected Data
- **Bonus Multiplier**: 2x for vulnerabilities affecting PHI
- **Immediate Escalation**: Direct notification to privacy officer
- **Legal Review**: All PHI-related findings reviewed by legal

### State Medical Board Integration
- **Priority**: Vulnerabilities affecting license verification
- **Coordination**: Work with state partners on disclosure
- **Timeline**: Accelerated fix schedule for regulatory impact

## Intake & Triage

### Submission Channels
- **Primary**: security@chai-vc.com
- **HackerOne**: [Platform account when available]
- **GitHub**: Security advisories for OSS components

### Triage Workflow
```bash
# Log new submission
./scripts/bounty_intake.sh --reporter="researcher@email.com" --type="sql_injection"

# Assign to security team
./scripts/assign_bounty.sh --id="CVE-2025-001" --assignee="security-team"

# Track resolution
./scripts/bounty_status.sh --id="CVE-2025-001" --status="in_progress"
```

### Response SLAs
- **Initial Acknowledgment**: 24 hours
- **Triage Assessment**: 48 hours
- **Status Updates**: Weekly during remediation
- **Resolution Notification**: Within 24 hours of fix

## Legal Framework

### Safe Harbor Policy
- Good faith security research protected
- No legal action for compliant testing
- Responsible disclosure timeline respected
- Researcher privacy protected

### Terms & Conditions
- Must comply with applicable laws
- No disruption to services or data
- No access to other users' data
- Report vulnerabilities promptly and privately

## Program Management

### Security Team Responsibilities
- **Triage Lead**: @security-team-lead (primary contact)
- **Technical Assessment**: @senior-security-engineer
- **Legal Coordination**: @legal-compliance
- **Payment Processing**: @finance-team

### Metrics & Reporting
```yaml
monthly_metrics:
  submissions_received: 0
  valid_vulnerabilities: 0
  average_resolution_time: "0 days"
  total_rewards_paid: "$0"
  researcher_satisfaction: "N/A"
```

### Annual Program Review
- Reward tier assessment
- Scope expansion/reduction
- Process improvement
- Budget planning