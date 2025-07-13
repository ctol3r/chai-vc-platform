# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Monitoring

A minimal Prometheus stack is included to demonstrate alerting on
`vc_issue_duration_seconds`. The alert fires when the metric exceeds `2`
for more than one minute and sends a notification to Slack via Alertmanager.

### Running locally

Set a `SLACK_WEBHOOK_URL` environment variable and start the services:

```bash
docker-compose up -d prometheus alertmanager
```

Prometheus will load `monitoring/alert_rules.yml` and Alertmanager will
use `monitoring/alertmanager.yml` for Slack routing.

