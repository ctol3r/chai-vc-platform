import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { redactLogs } from './middleware/redact';
import { validateRequest } from './middleware/validateRequest';
import { errorHandler } from './middleware/errorHandler';
import metricsRoutes from './routes/metrics_routes';
import { router as verifierRoutes } from './routes/verifier_routes';
import { router as issuerRoutes } from './routes/issuer_routes';
import { router as statusRoutes } from './routes/status_routes';
import healthRoutes from './routes/health_routes';

const app = express();

app.use(express.json({ limit: '512kb' }));
app.use(redactLogs);

app.post(
  '/credentials',
  body('name').isString().withMessage('name must be a string'),
  body('issuer').isString().withMessage('issuer must be a string'),
  validateRequest,
  (req: Request, res: Response) => {
    // Placeholder for credential creation logic
    res.json({ message: 'Credential created' });
  }
);

// Route registration
app.use('/api', metricsRoutes);
app.use('/api', verifierRoutes);
app.use('/api', issuerRoutes);
app.use('/api', statusRoutes);
app.use('/', healthRoutes);

app.use(errorHandler);

export default app;
