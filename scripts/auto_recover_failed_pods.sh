#!/usr/bin/env bash
# Simple auto-recovery script for Kubernetes pods
# Usage: ./auto_recover_failed_pods.sh [namespace] [check_interval_seconds]
# Default namespace: default
# Default interval: 30 seconds

NAMESPACE=${1:-default}
INTERVAL=${2:-30}

while true; do
  FAILED_PODS=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Failed -o jsonpath='{.items[*].metadata.name}')
  CRASHING_PODS=$(kubectl get pods -n "$NAMESPACE" | awk '/CrashLoopBackOff|Error/ {print $1}')

  for POD in $FAILED_PODS $CRASHING_PODS; do
    echo "Respawning failed pod: $POD"
    kubectl delete pod "$POD" -n "$NAMESPACE" --ignore-not-found
  done

  sleep "$INTERVAL"
done
