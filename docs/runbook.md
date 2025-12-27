# Operations Runbook

## Overview
Guides on maintaining service health and responding to incidents across the CHAI credentialing platform.

## Health Checks
- **Liveness**: `GET /healthz`
- **Readiness**: `GET /readyz`
- **Key Dashboards**: `issuer_latency_ms`, `verify_fail_rate`

## Incident Response
1. **Detect**: Pager alert or dashboard anomaly.
2. **Triage**: Classify severity, assign incident commander.
3. **Mitigate**: Apply known fixes or rollback via `scripts/dr/failover.sh`.
4. **Communicate**: Use the incident comms templates in `incident-comms-template.md`.
5. **Post‑mortem**: Capture timeline and corrective actions within 48h.

## Acceptance
Tabletop incident exercise passes.
