#!/usr/bin/env bash
set -euo pipefail

# Ensure we are running from the repository root (git top-level if available)
ensure_repo_root() {
  if git_root=$(git rev-parse --show-toplevel 2>/dev/null); then
    cd "$git_root" || true
    return 0
  fi

  # fallback: walk up until we find package.json or .git
  curr="$(pwd)"
  while [ "$curr" != "/" ]; do
    if [ -f "$curr/package.json" ] || [ -d "$curr/.git" ]; then
      cd "$curr" || true
      return 0
    fi
    curr="$(dirname "$curr")"
  done

  echo "[ensure_repo_root] Warning: repo root not found; continuing from $(pwd)" >&2
  return 1
}

ensure_repo_root
echo "[ensure_repo_root] Current working directory: $(pwd)"
