import express from 'express';
import issuerRoutes from './routes/issuer_routes';
import verifierRoutes from './routes/verifier_routes';
import npiRoutes from './routes/npi_routes';
import fhirRoutes from './routes/fhir_routes';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'backend'
  });
});

// Mount routes
app.use('/issuer', issuerRoutes);
app.use('/verifier', verifierRoutes);
app.use('/lookup', npiRoutes);
app.use('/fhir', fhirRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    valid: false,
    reason: 'internal_error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    valid: false,
    reason: 'endpoint_not_found'
  });
});

const port = process.env.PORT || 4000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`VitalCV Pilot P0 API ready at http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });
}

export default app;
