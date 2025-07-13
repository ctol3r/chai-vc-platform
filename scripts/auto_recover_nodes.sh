#!/usr/bin/env bash
# Auto recovery script for Kubernetes nodes
# Deletes NotReady nodes so that they can be recreated by the cluster
# Usage: ./auto_recover_nodes.sh [check_interval_seconds]
# Default interval: 60 seconds

INTERVAL=${1:-60}

while true; do
  NOT_READY_NODES=$(kubectl get nodes --no-headers | awk '$2 != "Ready" {print $1}')
  for NODE in $NOT_READY_NODES; do
    echo "Detected NotReady node: $NODE. Deleting to trigger recreation..."
    kubectl delete node "$NODE" --ignore-not-found
  done
  sleep "$INTERVAL"
done
