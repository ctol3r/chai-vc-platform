import express from 'express';
import issuerRoutes from './routes/issuer_routes';
import verifierRoutes from './routes/verifier_routes';
import npiRoutes from './routes/npi_routes';
import fhirRoutes from './routes/fhir_routes';

const app = express();

// Middleware - JSON parser BEFORE routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'backend' });
});

// Mount routes
app.use(issuerRoutes);
app.use(verifierRoutes);
app.use(npiRoutes);
app.use(fhirRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    valid: false,
    reason: 'server_error'
  });
});

// Start server
const PORT = process.env.PORT || 4000;

// Export app for testing without starting server
export default app;

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`VitalCV Pilot P0 Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}