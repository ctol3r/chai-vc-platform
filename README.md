# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Continuous Monitoring Service

The repository includes a basic monitoring service that schedules a monthly
Primary Source Verification (PSV) refresh. The service lives in
`monitoring-service/continuous_monitoring.py` and can be executed directly:

```bash
python monitoring-service/continuous_monitoring.py
```

It runs continuously and triggers the refresh logic on the first day of each
month.
