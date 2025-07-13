# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Auto Recovery Scripts

Two utility scripts in the `scripts` directory help maintain cluster health by automatically removing failed resources so Kubernetes can respawn them.

- `auto_recover_failed_pods.sh` watches for pods in a failed or crashing state and deletes them.
- `auto_recover_nodes.sh` checks for nodes marked `NotReady` and deletes them so the cluster can recreate them.

Run the scripts with executable permission:

```bash
./scripts/auto_recover_failed_pods.sh [namespace] [interval]
./scripts/auto_recover_nodes.sh [interval]
```

Each script loops indefinitely and should be run as a background process or managed by a supervisor.
