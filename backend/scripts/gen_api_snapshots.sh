#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"
echo "[gen] emitting OpenAPI (static stub) and GraphQL SDL (if available)"
# (OpenAPI is static for now)
if node -e "process.exit(0)"; then
  if [ -f backend/dist/graphql/schema.js ]; then
    node -e "const fs=require('fs');const s=require('./backend/dist/graphql/schema.js');fs.writeFileSync('docs/api/graphql_schema.gql', s?.schema?.toString?.()||'')"
  fi
fi
echo "[gen] docs/api/* updated"
