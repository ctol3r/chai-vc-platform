generated-by: Claude 2025-09-26T00:00:00Z
# Observability & Monitoring

## SLO Metrics & Queries

### Availability SLO (99.9% uptime)
```promql
# Service availability over 30 days
(
  sum(rate(http_requests_total{code!~"5.."}[30d])) /
  sum(rate(http_requests_total[30d]))
) * 100

# Error budget remaining
error_budget_remaining = (99.9 - availability_percentage) / 0.1 * 100
```

### Latency SLO (95% < 2s, 99% < 5s)
```promql
# P95 response time
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# P99 response time
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# SLO compliance rate
sum(rate(http_request_duration_seconds_bucket{le="2"}[5m])) /
sum(rate(http_request_duration_seconds_bucket{le="+Inf"}[5m])) * 100
```

### Business Metrics
```promql
# Credential verification success rate
sum(rate(credential_verification_total{status="success"}[5m])) /
sum(rate(credential_verification_total[5m])) * 100

# HITL queue size
hitl_queue_size{queue_type="urgent"}

# Daily active issuers/verifiers
increase(unique_api_keys_used[24h])
```

## Health Check Endpoints

### Primary Health Check
```bash
# Basic health check
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-09-26T12:00:00Z",
  "version": "v1.2.3",
  "services": {
    "database": "connected",
    "redis": "connected",
    "blockchain": "synced",
    "privacy_service": "available"
  }
}
```

### Detailed Health Check
```bash
# Comprehensive health check
curl http://localhost:3000/health/detailed

# Response includes:
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": "45ms",
      "connections": "5/20"
    },
    "blockchain": {
      "status": "healthy",
      "lastBlock": "12345678",
      "syncStatus": "synced"
    },
    "external_apis": {
      "state_medical_boards": "healthy",
      "failed_count": 0
    }
  }
}
```

## Alert Thresholds

### Critical Alerts (PagerDuty)
```yaml
critical_alerts:
  service_down:
    condition: "up == 0"
    duration: "30s"

  error_rate_high:
    condition: "rate(http_requests_total{code=~'5..'}[5m]) > 0.05"
    duration: "2m"

  response_time_critical:
    condition: "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 10"
    duration: "5m"

  hitl_queue_overflow:
    condition: "hitl_queue_size{queue_type='emergency'} > 10"
    duration: "1m"
```

### Warning Alerts (Slack)
```yaml
warning_alerts:
  error_rate_elevated:
    condition: "rate(http_requests_total{code=~'5..'}[5m]) > 0.01"
    duration: "5m"

  response_time_degraded:
    condition: "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 5"
    duration: "10m"

  database_connections_high:
    condition: "pg_stat_activity_count > 15"
    duration: "5m"
```

## Dashboards

### Operations Dashboard
- **Service Health**: Up/down status, response times
- **Traffic**: Requests per second, error rates
- **Infrastructure**: CPU, memory, disk usage
- **Business Metrics**: Verifications/hour, queue sizes

### Security Dashboard
- **Authentication**: Failed logins, suspicious patterns
- **Access Patterns**: Unusual API usage, rate limiting hits
- **Compliance**: PHI access logs, audit trail health
- **Threats**: Security scan results, vulnerability alerts

### Business Dashboard
- **Issuance Metrics**: Credentials issued per day/type
- **Verification Metrics**: Success rates, confidence scores
- **Customer Health**: API usage patterns, error rates by customer
- **Growth Metrics**: New registrations, usage trends

## Log Management

### Structured Logging Format
```json
{
  "timestamp": "2025-09-26T12:00:00.000Z",
  "level": "INFO",
  "service": "backend-api",
  "component": "credential-verification",
  "message": "Credential verified successfully",
  "metadata": {
    "credentialId": "cred_abc123",
    "verifierId": "org_xyz789",
    "confidence": 0.95,
    "duration": "1.2s"
  },
  "requestId": "req_456def",
  "userId": "[REDACTED]"
}
```

### Log Retention Policy
- **Error Logs**: 90 days (immediate investigation)
- **Access Logs**: 7 years (HIPAA requirement)
- **Audit Logs**: 7 years (regulatory compliance)
- **Debug Logs**: 30 days (troubleshooting)
- **Performance Logs**: 1 year (capacity planning)

## Monitoring Stack

### Prometheus Configuration
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "healthcare_alerts.yml"
  - "slo_alerts.yml"

scrape_configs:
  - job_name: 'chai-vc-backend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['localhost:9187']
```

### Grafana Dashboards
- **SLO Dashboard**: Real-time SLO compliance and error budgets
- **Infrastructure Dashboard**: System resources and capacity
- **Application Dashboard**: Business metrics and user journeys
- **Security Dashboard**: Threat detection and compliance

## Owners
- **Platform Monitoring**: @sre-team
- **Application Metrics**: @backend-team
- **Security Monitoring**: @security-team
- **Business Analytics**: @product-team