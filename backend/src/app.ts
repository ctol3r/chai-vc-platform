import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { body } from 'express-validator';
import { validateRequest } from './middleware/validateRequest';
import { errorHandler } from './middleware/errorHandler';
import claimRoutes from './routes/claim';
import healthRoutes from './routes/health';
import metricsRoutes from './routes/metrics';
import { router as verifierRoutes } from './routes/verifier_routes';

const app = express();

// Request logging middleware
app.use(morgan('combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// API routes
app.use('/api', claimRoutes);
app.use('/api', healthRoutes);
app.use('/api', metricsRoutes);
app.use('/api', verifierRoutes);

app.use(errorHandler);

export default app;
