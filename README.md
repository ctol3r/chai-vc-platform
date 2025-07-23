# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Docker Image Signing

This repository includes a script for signing Docker images with [cosign](https://docs.sigstore.dev/cosign/overview/). After building an image, run:

```bash
./scripts/cosign-sign.sh <your-image>
```

The script expects `COSIGN_KEY` to reference your signing key. The resulting signature can be verified by Kubernetes using the policy controller.

## Admission Policy

A sample `ClusterImagePolicy` is provided in `k8s/cosign-policy.yaml`. Apply it to your cluster to reject unsigned images:

```bash
kubectl apply -f k8s/cosign-policy.yaml
```

Make sure the corresponding public key is stored in the `cosign-public-key` secret.
