#!/usr/bin/env bash
set -euo pipefail

# backup-db.sh - Create a timestamped PostgreSQL backup, optionally encrypt, and store locally.
#
# Env vars:
#   DATABASE_URL or (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)
#   BACKUP_DIR (default: ./backups)
#   ENCRYPT_WITH_GPG (true|false, default: false)
#   GPG_RECIPIENT (email or key id, required if ENCRYPT_WITH_GPG=true)

BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TS=$(date +%Y%m%d-%H%M%S)
FILENAME="pg_backup_${TS}.sql"
mkdir -p "$BACKUP_DIR"

echo "[backup] starting backup to $BACKUP_DIR/$FILENAME"
if [[ -n "${DATABASE_URL:-}" ]]; then
  pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$FILENAME"
else
  : "${PGHOST:?PGHOST required if DATABASE_URL not set}"
  : "${PGUSER:?PGUSER required if DATABASE_URL not set}"
  : "${PGDATABASE:?PGDATABASE required if DATABASE_URL not set}"
  pg_dump > "$BACKUP_DIR/$FILENAME"
fi

if [[ "${ENCRYPT_WITH_GPG:-false}" == "true" ]]; then
  : "${GPG_RECIPIENT:?GPG_RECIPIENT must be set for encryption}"
  echo "[backup] encrypting with gpg recipient $GPG_RECIPIENT"
  gpg --yes --batch --output "$BACKUP_DIR/$FILENAME.gpg" --encrypt --recipient "$GPG_RECIPIENT" "$BACKUP_DIR/$FILENAME"
  rm -f "$BACKUP_DIR/$FILENAME"
  FILENAME="$FILENAME.gpg"
fi

echo "[backup] done: $BACKUP_DIR/$FILENAME"

