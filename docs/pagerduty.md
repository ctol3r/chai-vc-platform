# PagerDuty Configuration

This document outlines how to configure PagerDuty for the Chai VC Platform including the severity matrix and on‑call rotation.

## Service Setup
1. Create a new service in PagerDuty named **Chai VC Platform**.
2. Use the **Events API v2** integration to receive alerts from monitoring tools.
3. Set the escalation policy described below as the service’s default.

## Severity Matrix
| Impact | Severity | Description |
|-------|---------|-------------|
| Critical outage | P1 | Customer facing outage or security incident. Immediate resolution required. |
| Major degradation | P2 | Partial loss of functionality affecting multiple users or core workflows. |
| Minor issue | P3 | Problem with limited scope or workaround available. |
| Informational | P4 | Low risk events that do not require immediate action. |

## On‑Call Rotation
1. Create an on‑call schedule containing all backend engineers.
2. Configure weekly rotation starting Monday 09:00 UTC.
3. Assign the schedule to the escalation policy so that the primary on‑call engineer receives alerts.
4. Add a secondary schedule as backup with a one‑week offset.

## Escalation Policy
1. First level: notify the primary on‑call schedule (immediate alert).
2. Second level: after 15 minutes without acknowledgement, notify the backup schedule.
3. Third level: after another 15 minutes, notify the engineering manager via email and phone.

