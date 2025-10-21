/**
 * Pilot P0 Backend Server
 * REST API for VitalCV credential issuance, verification, and revocation
 */

import express, { Request, Response } from 'express';
import issuerRoutes from './routes/issuer_routes';
import verifierRoutes from './routes/verifier_routes';
import npiRoutes from './routes/npi_routes';
import fhirRoutes from './routes/fhir_routes';

const app = express();

// JSON body parser - MUST come before routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'vitalcv-backend',
    timestamp: new Date().toISOString(),
  });
});

// Mount routers
app.use('/issuer', issuerRoutes);
app.use('/verifier', verifierRoutes);
app.use('/lookup', npiRoutes);
app.use('/fhir', fhirRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'VitalCV Pilot P0 Backend',
    version: '1.0.0',
    endpoints: [
      'POST /issuer/credential',
      'POST /issuer/revoke',
      'POST /verifier/presentation',
      'POST /lookup/npi/:npi',
      'GET /fhir/Practitioner/:id',
      'GET /health',
    ],
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[SERVER_ERROR]', { message: err?.message, stack: err?.stack });
  res.status(500).json({
    error: 'internal_error',
    message: 'An unexpected error occurred',
  });
});

// Start server only if not in test mode
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`[SERVER] Listening on port ${port}`);
    console.log(`[SERVER] Health check: http://localhost:${port}/health`);
  });
}

// Export for testing
export default app;
