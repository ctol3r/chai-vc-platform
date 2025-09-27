#!/usr/bin/env bash
set -euo pipefail

# If inside a git repo, use git top-level
if git rev-parse --show-toplevel >/dev/null 2>&1; then
  REPO_ROOT="$(git rev-parse --show-toplevel)"
  cd "$REPO_ROOT"
  echo "[ensure_repo_root] Changed to git repo root: $REPO_ROOT"
  pwd
  exit 0
fi

# Otherwise, climb until we find package.json (common project root heuristic)
CUR="$PWD"
while [ "$CUR" != "/" ]; do
  if [ -f "$CUR/package.json" ] || [ -f "$CUR/pyproject.toml" ] || [ -f "$CUR/README.md" ]; then
    cd "$CUR"
    echo "[ensure_repo_root] Changed to detected project root: $CUR"
    pwd
    exit 0
  fi
  CUR="$(dirname "$CUR")"
done

# Fallback: stay where we are
echo "[ensure_repo_root] No git repo or package/project file found; staying in: $PWD"
pwd
