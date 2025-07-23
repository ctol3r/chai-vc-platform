#!/bin/bash
# Simple script to sign a Docker image using cosign.
# Usage: ./cosign-sign.sh <image>
set -euo pipefail
IMAGE="$1"
cosign sign --key "${COSIGN_KEY:-cosign.key}" "$IMAGE"
