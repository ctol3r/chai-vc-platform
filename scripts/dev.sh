#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
START_BACKEND=1
START_FRONTEND=1
START_ACA=0
LOG_PREFIX="[dev-stack]"

usage() {
  cat <<USAGE
Usage: scripts/dev.sh [options]
  --backend-only        Run only the backend API
  --frontend-only       Run only the frontend app
  --with-aca            Start a lightweight aca_py_agent stub on :8051
  -h, --help            Show this help

The script assumes dependencies are installed (npm ci / pip install).
Press Ctrl+C to stop all processes.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend-only)
      START_FRONTEND=0
      START_ACA=0
      ;;
    --frontend-only)
      START_BACKEND=0
      START_ACA=0
      ;;
    --with-aca)
      START_ACA=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "$LOG_PREFIX Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

PIDS=()

stop_processes() {
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
}

trap stop_processes EXIT

run_backend() {
  echo "$LOG_PREFIX starting backend on http://localhost:4000"
  (cd "$ROOT_DIR/backend" && npm run dev)
}

run_frontend() {
  echo "$LOG_PREFIX starting frontend on http://localhost:3000"
  (cd "$ROOT_DIR/frontend" && npm run dev)
}

run_aca_stub() {
  echo "$LOG_PREFIX starting aca_py_agent stub on http://localhost:8051"
  (cd "$ROOT_DIR/aca_py_agent" && python -m http.server 8051)
}

start_component() {
  local name="$1"
  shift
  "$@" &
  local pid=$!
  PIDS+=("$pid")
  echo "$LOG_PREFIX $name pid=$pid"
}

[[ $START_BACKEND -eq 1 ]] && start_component "backend" run_backend
[[ $START_FRONTEND -eq 1 ]] && start_component "frontend" run_frontend
[[ $START_ACA -eq 1 ]] && start_component "aca_py_stub" run_aca_stub

if [[ ${#PIDS[@]} -eq 0 ]]; then
  echo "$LOG_PREFIX nothing to run" >&2
  exit 1
fi

while true; do
  if ! wait -n 2>/dev/null; then
    break
  fi
  echo "$LOG_PREFIX process exited, shutting down"
  break
done
