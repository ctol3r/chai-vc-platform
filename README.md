# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Logging and Monitoring

The `k8s/logging` directory contains a sample Loki stack deployment. It runs Loki,
Promtail and Grafana inside a `logging` namespace. Grafana is preconfigured with
a Loki data source and an alert rule that triggers if more than 2% of backend
logs contain the word `error` over a five minute window. Apply the manifest with:

```bash
kubectl apply -f k8s/logging/loki-stack.yaml
```

Grafana is exposed via a `NodePort` on port `3000`. Sign in (default credentials
`admin`/`admin`) and navigate to **Alerting** to view the rule.
