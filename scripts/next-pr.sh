#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# Sync main
git checkout main >/dev/null 2>&1 || true
git pull --ff-only

# Pick the first open PR (edit if you want a specific ID)
NEXT="$(gh pr list --state open --json number --jq '.[0].number' || true)"
if [ -z "${NEXT:-}" ]; then echo "✅ No open PRs. All done."; exit 0; fi
echo "👉 Working PR #$NEXT"

# Checkout PR and merge main
gh pr checkout "$NEXT"
git fetch origin
git merge origin/main || true

# List conflicts (if any)
if git diff --name-only --diff-filter=U | grep . >/dev/null 2>&1; then
  echo "❗ Merge conflicts in:"
  git diff --name-only --diff-filter=U | sed 's/^/   - /'
  # Save a conflict list for Claude
  git diff --name-only --diff-filter=U > /tmp/conflicts.txt
else
  echo "✅ No merge conflicts."
fi

# Light local test pass (non-fatal)
make test || true

# Leave a small breadcrumb for Claude about what we did
echo "#$NEXT" > /tmp/current_pr.txt
