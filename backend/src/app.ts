import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { redactLogs } from './middleware/redact';
import { validateRequest } from './middleware/validateRequest';
import { errorHandler } from './middleware/errorHandler';
import metricsRoutes from './routes/metrics_routes';
import { router as verifierRoutes } from './routes/verifier_routes';

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

app.use(errorHandler);

export default app;
