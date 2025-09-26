#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT/backend"
echo "[smoke] install (skip if cached)"; npm ci --legacy-peer-deps >/dev/null || true
echo "[smoke] build"; npm run build
echo "[smoke] run e2e smoke (jest tag)"
npx jest -t "@smoke-e2e" --runInBand --config=jest.config.cjs
