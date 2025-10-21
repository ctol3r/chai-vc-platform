import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import issuerRoutes from './routes/issuer_routes';
import verifierRoutes from './routes/verifier_routes';
import npiRoutes from './routes/npi_routes';
import fhirRoutes from './routes/fhir_routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './services/logger';
import { openApiSpec } from './docs/openapi';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: { error: 'Too many requests', details: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3005',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(10000, () => {
    res.status(408).json({ error: 'Request timeout', details: 'Request took too long' });
  });
  next();
});

// Apply rate limiting to sensitive endpoints
app.use('/issuer', limiter);
app.use('/verifier', limiter);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', async (req, res) => {
  try {
    // Basic readiness check - store is always ready in pilot
    res.json({
      ready: true,
      service: 'backend',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: 'Service not ready',
      timestamp: new Date().toISOString()
    });
  }
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'VitalCV Pilot P0 API'
}));

// Mount routes
app.use('/issuer', issuerRoutes);
app.use('/verifier', verifierRoutes);
app.use('/lookup', npiRoutes);
app.use('/fhir', fhirRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    details: `Path ${req.originalUrl} not found`
  });
});

// Only start server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    logger.info(`VitalCV Pilot P0 API ready at http://localhost:${port}`);
    logger.info(`Health check: http://localhost:${port}/health`);
    logger.info(`API docs: http://localhost:${port}/api-docs`);
  });
}

export default app;
