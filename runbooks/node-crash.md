# Node Crash

This runbook describes how to recover from a crashed node.

1. **Identify the issue**
   - Check monitoring alerts for node status.
   - Verify whether the node is unreachable via SSH or Kubernetes.
2. **Drain and cordon**
   - If using Kubernetes, cordon the node to prevent new pods from scheduling:
     ```bash
     kubectl cordon <node-name>
     ```
   - Drain running workloads if possible:
     ```bash
     kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
     ```
3. **Restart or replace**
   - Attempt to reboot the node via the cloud provider console or infrastructure tools.
   - If the node does not come back, provision a new node and remove the old one from the cluster.
4. **Restore services**
   - Verify pods reschedule to healthy nodes.
   - Monitor application logs to ensure normal operation resumes.
