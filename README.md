# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Deploying with ArgoCD

This repository includes Kubernetes manifests under `k8s/` that are organized for GitOps. Environments are defined using [Kustomize](https://kustomize.io/) overlays:

```
./k8s/overlays/staging
./k8s/overlays/perf
./k8s/overlays/prod
```

An ArgoCD instance can monitor these overlays using the `argocd-applications.yaml` file. Each Application will deploy the associated environment and automatically promote changes through staging → perf → production.
