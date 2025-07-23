# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Kubernetes Network Policies

The `k8s/network-policies.yaml` manifest defines default isolation for the
`backend` and `ai-matcher-service` namespaces. Each policy restricts ingress and
egress traffic to pods within the same namespace, preventing unintended
communication between micro-services in different namespaces.

Apply the policies with:

```bash
kubectl apply -f k8s/network-policies.yaml
```

