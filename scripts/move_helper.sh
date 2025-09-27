#!/usr/bin/env bash
set -euo pipefail
# Ensure repo root, then move any blockchainIntegrationMock.* into backend/test/helpers (if found)
./scripts/ensure_repo_root.sh

mapfile -t FILES < <(find . -type f -iname 'blockchainIntegrationMock.*' 2>/dev/null || true)
if [ ${#FILES[@]} -eq 0 ]; then
  echo "[move_helper] No blockchainIntegrationMock.* files found."
  exit 0
fi

DEST_DIR="./backend/test/helpers"
mkdir -p "$DEST_DIR"

for SRC in "${FILES[@]}"; do
  BNAME=$(basename "$SRC")
  DEST="$DEST_DIR/$BNAME"
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git ls-files --error-unmatch "$SRC" >/dev/null 2>&1; then
    git mv "$SRC" "$DEST" || mv "$SRC" "$DEST"
  else
    mv "$SRC" "$DEST"
    git add "$DEST" >/dev/null 2>&1 || true
  fi
  echo "[move_helper] moved $SRC -> $DEST"
done

echo "[move_helper] done. Please review 'git status'."
