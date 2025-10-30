# Instrumentation

Prometheus metrics for observability.

## Metrics Exported

### Command Execution Metrics

- **`vitalcv_command_execute_total`**: Counter of command executions
  - Labels: `command`, `status` (ok/error), `user_role`
- **`vitalcv_command_latency_seconds`**: Histogram of command execution latency
  - Labels: `command`, `user_role`
  - Buckets: [0.01, 0.05, 0.2, 0.5, 1, 2, 5] seconds

### NPI Lookup Metrics

- **`vitalcv_npi_lookup_total`**: Counter of NPI lookups
  - Labels: `result` (cache_hit, cache_miss, success, error)

### Default Metrics

The module also collects default Node.js metrics (CPU, memory, event loop, etc.) via `prom-client`'s default metrics collection.

## Usage

### Exposing Metrics Endpoint

The metrics are automatically exposed via the `/metrics` endpoint in `app.ts`:

```typescript
import { metricsHandler } from './instrumentation/metrics';
app.get('/metrics', metricsHandler);
```

### Querying Metrics

Prometheus scraping example:

```yaml
scrape_configs:
  - job_name: 'vitalcv-backend'
    static_configs:
      - targets: ['localhost:4000']
```

### Example Queries

**Command execution rate:**
```
rate(vitalcv_command_execute_total[5m])
```

**Command error rate:**
```
rate(vitalcv_command_execute_total{status="error"}[5m])
```

**NPI cache hit ratio:**
```
sum(rate(vitalcv_npi_lookup_total{result="cache_hit"}[5m])) / 
sum(rate(vitalcv_npi_lookup_total[5m]))
```

**P95 command latency:**
```
histogram_quantile(0.95, rate(vitalcv_command_latency_seconds_bucket[5m]))
```
