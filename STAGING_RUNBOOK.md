# Staging Environment Runbook

## Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 4000, 5432, 8020, 8021, 9933, 9944 available

## Step 1: Start Services
```bash
# From repo root
docker compose up --build -d
```

## Step 2: Wait for Health Checks
```bash
# Monitor service health (wait ~2-3 minutes for all services)
docker compose ps

# Check logs if needed
docker compose logs substrate-node
docker compose logs backend
docker compose logs frontend
docker compose logs aca-py
docker compose logs postgres
```

## Step 3: Run Smoke Test
```bash
# Make script executable (if not already)
chmod +x scripts/smoke-test.sh

# Run end-to-end smoke test
./scripts/smoke-test.sh
```

## Expected Results
✅ All services show "healthy" status
✅ Smoke test passes with "Smoke test PASSED! Full credential lifecycle working."

## Cleanup
```bash
# Stop and remove all containers
docker compose down -v
```

## Service Endpoints
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Substrate RPC: http://localhost:9933
- Substrate WebSocket: ws://localhost:9944
- ACA-Py Admin: http://localhost:8021
- ACA-Py Agent: http://localhost:8020
- PostgreSQL: localhost:5432

## Troubleshooting
- If services fail to start, check port conflicts
- If health checks fail, review service logs
- Database issues: check PostgreSQL connectivity and init script
- ACA-Py issues: verify Indy genesis URL accessibility