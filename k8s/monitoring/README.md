# Cluster Monitoring

This directory contains a minimal Helm configuration for deploying
[kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
which provides Prometheus, Grafana and Alertmanager.

## Prerequisites

- A running Kubernetes cluster
- Helm v3 installed

## Installation

Add the Prometheus Community Helm repository and install the chart:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  -f prometheus-grafana-values.yaml
```

By default the services are exposed as `NodePort`. Adjust the values in
`prometheus-grafana-values.yaml` for your environment.
