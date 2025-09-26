# Unified Dev Stack Script — February 2025

## Intent
Provide a single entry point to launch the backend API, frontend Next.js app, and an optional ACA-Py privacy stub so contributors can run the end-to-end stack locally without juggling multiple terminals.

## Context
Developers previously started services manually (`npm run dev` in separate shells). With stricter linting and upcoming cryptographic flows, faster iteration loops are essential. The script complements the existing Makefile targets without adding new runtime dependencies.

## Assumptions
- Backend and frontend dependencies are installed via `npm ci`; Python 3.11+ is available if the ACA stub is enabled.
- The stub uses `python -m http.server` on port 8051 to simulate an ACA-Py admin interface until the real agent is containerised.
- Postgres (docker-compose override) can be started separately; the script does not manage containers by default.

## Risks & Mitigations
- **Port collisions**: If ports 3000, 4000, or 8051 are busy the script exits; contributors should export `PORT`/`NEXT_PORT` before running or stop conflicting services.
- **Background processes**: The script traps `SIGINT`/`EXIT` to ensure child processes are killed, reducing orphaned dev servers.
- **Environment drift**: Script intentionally avoids running `npm install` to prevent unintended dependency changes—documentation stresses installing beforehand.

## UX / DevX Notes
- Usage: `./scripts/dev.sh [--backend-only|--frontend-only|--with-aca]`.
- Output is prefixed with `[dev-stack]` to keep logs readable; each component runs in the background until Ctrl+C.
- Future enhancements (e.g., dockerised Postgres) can be added with new flags without breaking the default workflow.

## Acceptance Tests
1. `./scripts/dev.sh --backend-only` starts ts-node dev server on :4000 and terminates cleanly with Ctrl+C.
2. `./scripts/dev.sh --frontend-only` starts Next.js dev server on :3000.
3. `./scripts/dev.sh --with-aca` additionally spawns a simple HTTP stub on :8051 for local credential callbacks.

## Deliverables
- `scripts/dev.sh` (executable) orchestrating backend, frontend, and optional ACA stub processes.
- Documentation (this file) for inclusion in developer runbooks.
