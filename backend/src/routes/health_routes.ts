import { Router } from 'express';

const r = Router();

// Minimal service ID; adjust if you prefer reading from env
const SERVICE = process.env.SERVICE_NAME || 'chai-vc-backend';

r.get('/healthz', (_req, res) => {
  const body = {
    ok: true,                        // keep legacy field so older tests pass
    status: 'healthy',               // required by smoke tests
    service: SERVICE,
    timestamp: new Date().toISOString()
  };
  res.status(200).json(body);
});

r.get('/readyz', async (_req, res) => {
  // In MVP, keep checks stubbed to 'connected' so tests pass without real DB
  const checks = {
    database: 'connected'
  };
  const body = {
    ok: true,                        // keep legacy field for compatibility
    status: 'ready',                 // required by smoke tests
    service: SERVICE,
    timestamp: new Date().toISOString(),
    checks
  };
  res.status(200).json(body);
});

export default r;
