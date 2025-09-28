# Compliance Dashboard Design — CHAI•VITALCV

## Purpose
A real-time compliance dashboard surfacing the organization's SOC2/HIPAA/GDPR posture and key compliance metrics (KCIs).
Designed for SRE, Security, Compliance and Executive observers.

## Users & Views
- Executive (high level): compliance score, error budget, top-5 risks.
- Security/Compliance: control status, evidence gaps, alerts.
- SRE/Oncall: operational incidents mapped to controls, recent audit trails.
- Auditor: access to evidence repository (read-only), exportable reports.

## Data Sources
- SOC2 evidence collection scripts (automated outputs)
- Prometheus metrics (SLOs/SRIs)
- Kubernetes / cloud logs (filtered)
- IAM logs (provisioning events)
- SIEM alerts / forensic artifacts
- Consent & privacy audit logs

## Key Compliance Indicators (KCIs)
- SOC2 control health (per TSC, normalized 0-100)
- HIPAA mapping compliance percentage
- Evidence completeness (%) — percent of required evidence present for current audit period
- Error budget consumption for critical SLOs (P95 latency, verification success rate)
- Incident rate with compliance impact (24h/7d/30d)

## Dashboard Panels (priority)
1. Executive summary (scorecards + trend sparklines)
2. Control map heatmap (controls vs systems; color = health)
3. Evidence gap list (missing artifacts with owners & Due dates)
4. SLO & SLI panel (proof_verify P50/P95/P99, success rate)
5. Alerts & Incidents (filterable by severity & control impacted)
6. Audit trail explorer (immutable IDs, export option)
7. Compliance runbook quick-links (remediation steps)

## Alerting & Automation
- Thresholds for auto-open tickets when evidence missing > X days or error budget > Y%
- Integration with PagerDuty/Slack for P0/P1 compliance alerts
- Automated daily snapshot exported to Evidence Repo for auditors

## Security & Access
- RBAC enforced at dashboard layer (exec, compliance, security, auditor)
- Audit logging for all inspector actions + export attempts
- Export only allowed for authorized auditor roles with approval flow

## Implementation notes
- UI: React + charting (prefetch APIs for low-latency)
- Backend: Node service that aggregates metrics & evidence, caches snapshot hourly
- Metrics: use Prometheus exporters + scrape configs, Loki for logs
- Storage: evidence stored in S3 with WORM policy and checksummed manifests
- Export: signed, time-limited links for auditor deliverables

## Acceptance criteria
- Dashboard available and populated with live KCIs
- RBAC enforced; auditors can export reports
- Alerts fire on missing evidence and error-budget thresholds
- Daily snapshot process completes within the scheduled window

