#!/usr/bin/env bash
set -euo pipefail

echo "[prisma] Validating schema..."
npx prisma validate

echo "[prisma] Deploying migrations (or pushing schema for SQLite)..."
npx prisma migrate deploy || npx prisma db push

echo "[prisma] Generating client..."
npx prisma generate

echo "[prisma] Done."

