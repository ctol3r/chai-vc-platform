#!/usr/bin/env bash
set -euo pipefail

# restore-db.sh - Restore a PostgreSQL backup from a .sql or .sql.gpg file
# Usage: restore-db.sh <backup_file>
# Env vars:
#   DATABASE_URL or (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)

FILE=${1:-}
if [[ -z "$FILE" ]]; then
  echo "Usage: $0 <backup_file.sql|backup_file.sql.gpg>" >&2
  exit 1
fi

TMPFILE="$FILE"
if [[ "$FILE" == *.gpg ]]; then
  echo "[restore] decrypting $FILE"
  TMPFILE=$(mktemp)
  gpg --decrypt "$FILE" > "$TMPFILE"
fi

echo "[restore] restoring from $FILE"
if [[ -n "${DATABASE_URL:-}" ]]; then
  psql "$DATABASE_URL" < "$TMPFILE"
else
  : "${PGHOST:?PGHOST required if DATABASE_URL not set}"
  : "${PGUSER:?PGUSER required if DATABASE_URL not set}"
  : "${PGDATABASE:?PGDATABASE required if DATABASE_URL not set}"
  psql < "$TMPFILE"
fi

if [[ "$FILE" == *.gpg ]]; then
  rm -f "$TMPFILE"
fi

echo "[restore] done"

