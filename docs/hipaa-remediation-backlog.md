generated-by: Claude 2025-09-26T00:00:00Z
# HIPAA Mapping Remediation Backlog

## Overview
Mapping HIPAA safeguards to current platform controls. Gaps identified below require remediation.

## Administrative Safeguards
- **Gap:** Automated access reviews missing
  - **Owner:** @security-team
  - **ETA:** 30 days
  - **Status:** 🔄 In Progress
  - **Remediation:** Implement quarterly automated access review using Okta API

- **Gap:** Workforce training automation
  - **Owner:** @hr-team
  - **ETA:** 60 days
  - **Status:** 📋 Planned
  - **Remediation:** Deploy LMS with HIPAA training modules and completion tracking

- **Gap:** Business associate agreements automation
  - **Owner:** @legal-compliance
  - **ETA:** 45 days
  - **Status:** 📋 Planned
  - **Remediation:** Create self-service BAA signing workflow

## Technical Safeguards
- **Gap:** Minimum-necessary enforcement
  - **Owner:** @backend-team
  - **ETA:** 90 days
  - **Status:** 🔄 In Progress
  - **Remediation:** Implement RBAC with field-level PHI access controls

- **Gap:** Audit log integrity verification
  - **Owner:** @backend-team
  - **ETA:** 60 days
  - **Status:** 📋 Planned
  - **Remediation:** Add cryptographic audit log tamper detection

## Physical Safeguards
- **Gap:** Remote work security standards
  - **Owner:** @ops
  - **ETA:** 45 days
  - **Status:** 🔄 In Progress
  - **Remediation:** MDM deployment + endpoint security policy enforcement

- **Gap:** Facility access logging
  - **Owner:** @ops
  - **ETA:** 30 days
  - **Status:** 📋 Planned
  - **Remediation:** Badge access system integration with SIEM

---

> Status updated: 2025-09-26