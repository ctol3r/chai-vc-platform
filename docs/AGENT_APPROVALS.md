generated-by: Codex 2025-09-26T00:00:00Z
# Agent Approvals — Human Overview

## AUTO (no human approval required)
### Codex
- `tests:add`
- `tests:edit`
- `docs:add`
- `scripts:add_nonprod`
- `ci:config_nonprod`
- `types:shim_with_todo`

### Claude
- `docs:add_update`
- `runbooks:add_update`
- `checklists:generate`
- `pr:templates`

## HUMAN REVIEW REQUIRED
### Codex → human reviewer: `@backend-team`
- `runtime:api_change`
- `db:schema_or_migration`
- `infra:prod`
- `crypto:onchain_or_keys`
- `deps:major_change_prod`

### Claude → human reviewer: `@legal-compliance`
- `compliance:public_artifacts`
- `privacy:policy_text`
- `legal:tokenomics_or_ads`

## LEGAL SIGN-OFF
Items flagged `privacy:*` or `legal:*` require final approval from `@legal-compliance` even after technical review. Loop them in via the PR reviewers list and Slack `#legal-compliance`.

## ESCALATION GUARDRAILS
- Applying `security` or `PHI-risk` labels blocks merge and auto-pings `@legal-compliance` + `@backend-team`.
- If an agent hits a restricted path, notify the reviewers above and pause automation until resolved.

## KILL SWITCH
- Path: `scripts/agent_kill_switch`
- Contents: `STOP_AGENTS=1`
- Commit & push the change to halt agents immediately.

## MERGE SAFEGUARDS
- Protected branches: `main`
- Required label on agent-authored PRs: `approved-by`
- Ensure reviewers listed above are assigned before merge.
