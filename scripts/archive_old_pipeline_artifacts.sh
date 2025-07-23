#!/bin/bash
# Script to configure S3 lifecycle policy to archive pipeline artifacts older than 30 days to Glacier
# Usage: ./archive_old_pipeline_artifacts.sh <bucket-name>
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <bucket-name>" >&2
  exit 1
fi

BUCKET="$1"

echo "Configuring lifecycle policy for bucket $BUCKET..."
aws s3api put-bucket-lifecycle-configuration --bucket "$BUCKET" --lifecycle-configuration '{
  "Rules": [
    {
      "ID": "ArchivePipelineArtifacts",
      "Filter": {"Prefix": ""},
      "Status": "Enabled",
      "Transitions": [
        {"Days": 30, "StorageClass": "GLACIER"}
      ]
    }
  ]
}'

echo "Lifecycle policy applied."
