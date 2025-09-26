#!/usr/bin/env bash
set -euo pipefail

# repo root
if [ -x ./scripts/ensure_repo_root.sh ]; then
  ./scripts/ensure_repo_root.sh
else
  ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
  if [ -n "$ROOT" ]; then cd "$ROOT"; else while [ ! -f package.json ] && [ "$PWD" != "/" ]; do cd ..; done; fi
fi
echo "[GATE] repo root: $(pwd)  node: $(node -v)  npm: $(npm -v)"

# install/build
npm ci || npm install
( cd backend && npm ci || npm install )
( cd backend && npm run build )

# focused tests (all supertest against exported app)
echo "[GATE] verifier endpoint"
( cd backend && npx jest --config=jest.config.cjs -t "verifier credential status endpoint" --runInBand -i )

echo "[GATE] metrics endpoint"
( cd backend && npx jest --config=jest.config.cjs -t "metrics endpoint" --runInBand -i )

echo "[GATE] smoke e2e"
( cd backend && npx jest --config=jest.config.cjs -t "@smoke-e2e" --runInBand -i )

# optional: health/ready checks (if you added those tests)
if rg -n "health endpoints" backend/__tests__ >/dev/null 2>&1; then
  echo "[GATE] health/ready"
  ( cd backend && npx jest --config=jest.config.cjs -t "health endpoints" --runInBand -i )
fi

echo "[PASS] MVP Gate checks (tests) passed"
