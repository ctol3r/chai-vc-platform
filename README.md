# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Security

All service-to-service communication now uses **mTLS**. Certificates are mounted
from Kubernetes secrets and referenced by the applications. An **OPA** sidecar
is injected into each deployment to enforce policies defined in `opa/policy.rego`.
