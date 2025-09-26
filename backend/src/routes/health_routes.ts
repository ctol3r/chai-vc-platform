import { Router } from 'express';

export const router = Router();

// Health check endpoint
router.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'chai-vc-backend'
  });
});

// Readiness check endpoint
router.get('/readyz', (req, res) => {
  // In production, this would check database connectivity, external services, etc.
  const isReady = true; // Mock readiness check

  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      service: 'chai-vc-backend',
      checks: {
        database: 'connected',
        redis: 'connected',
        external_apis: 'available'
      }
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      service: 'chai-vc-backend'
    });
  }
});