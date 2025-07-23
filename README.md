# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Self-Healing Node CronJob

The file `k8s/self-healing-cronjob.yaml` defines a Kubernetes `CronJob` that
periodically checks the timestamp of the latest block produced by the node. If
the age of the last block exceeds five minutes, the CronJob deletes the node
pod so Kubernetes can restart it. This helps recover from stalled Aura slots.
