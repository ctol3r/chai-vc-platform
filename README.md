# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Monitoring Stack

A lightweight monitoring setup is provided under `monitoring/`. It uses Prometheus
and Grafana to visualise backend metrics such as block time and API latency.

### Running the Backend

```
cd backend
npm install
npm start
```

By default the backend exposes metrics on `http://localhost:3000/metrics`.

### Running Grafana and Prometheus

```
docker compose -f monitoring/docker-compose.monitoring.yml up
```

Prometheus will be available on `http://localhost:9090` and Grafana on
`http://localhost:3000` (default credentials: `admin`/`admin`). The stack expects
the backend to expose Prometheus metrics at `http://backend:3000/metrics`.

The Grafana dashboard located at
`monitoring/grafana/dashboards/blocktime_api_latency.json` will be automatically
loaded.
