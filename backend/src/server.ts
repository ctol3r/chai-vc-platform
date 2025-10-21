/**
 * VitalCV Pilot P0 Backend Server
 * Express app with REST API for issue→verify→revoke flow
 */

import express from 'express';
import { issuerRoutes } from './routes/issuer_routes';
import { verifierRoutes } from './routes/verifier_routes';
import { npiRoutes } from './routes/npi_routes';
import { fhirRoutes } from './routes/fhir_routes';

const app = express();

// JSON parser middleware - BEFORE mounting routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'backend',
    timestamp: new Date().toISOString()
  });
});

// Mount route handlers
app.use('/issuer', issuerRoutes);
app.use('/verifier', verifierRoutes);
app.use('/lookup', npiRoutes);
app.use('/fhir', fhirRoutes);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER] Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] Unhandled promise rejection:', reason);
});

// Start server only if this file is run directly (not imported)
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 VitalCV Pilot P0 Backend ready at http://localhost:${port}`);
    console.log(`📋 Health check: http://localhost:${port}/health`);
  });
}

export default app;
