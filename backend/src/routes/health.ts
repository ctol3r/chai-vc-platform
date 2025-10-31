import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint for deployment checks
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };
    
    res.status(200).json(healthStatus);
  } catch (err) {
    console.error('Error in health check:', err);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

export default router;
