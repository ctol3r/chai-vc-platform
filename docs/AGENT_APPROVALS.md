generated-by: Claude 2025-09-26T00:00:00Z
# Agent Approvals — Human Overview

## Purpose
Define what Codex/Claude can do without approval vs. what needs human/legal review.

## Auto-Apply (no human approval)
- Codex: tests, dev scripts, docs, formatting, CI config (non-prod), TS shims with TODO tickets.
- Claude: docs in docs/, draft runbooks, checklists, PR templates.

## Human-Required
- Runtime behavior changes (APIs, DB schema, on-chain code), secrets/keys, prod infra, token contracts, legal-facing docs.

## Legal-Required
- Privacy policy updates, public T&Cs, tokenomics legal positioning, CA ADS/CO AI statements.

## Escalation
- `security`, `PHI-risk` labels stop merges and notify @legal-compliance + @backend-team.

## Kill-switch
- `scripts/agent_kill_switch` (contains STOP_AGENTS=1) halts agents.