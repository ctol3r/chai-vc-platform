# Kubernetes Manifests

This directory provides Helm charts and Kustomize overlays for deploying
`chai-vc-platform` services.

- `charts/` contains minimal Helm charts for the backend and the
  `ai-matcher-service`.
- `base/` is a Kustomize base that renders these charts using the default
  values.
- `overlays/` provides environment-specific configuration for `dev`,
  `staging`, and `prod` environments. Each overlay overrides image tags
  and replica counts via `valuesInline`.

To render manifests for a given environment you can run:

```bash
kustomize build k8s/overlays/<env>
```

Replace `<env>` with `dev`, `staging`, or `prod`.
