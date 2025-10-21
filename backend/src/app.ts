import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from './middleware/validateRequest';
import { errorHandler } from './middleware/errorHandler';
import oidc4vciRouter from './routes/oidc4vci';
import issuerRoutes from './routes/issuer_routes';
import { router as verifierRoutes } from './routes/verifier_routes';
import { redisHealth } from './controllers/health_controller';

const app = express();

app.use(express.json());

app.get('/health/redis', redisHealth);

app.post(
  '/credentials',
  body('name').isString().withMessage('name must be a string'),
  body('issuer').isString().withMessage('issuer must be a string'),
  validateRequest,
  (_req: Request, res: Response) => {
    res.json({ message: 'Credential created' });
  }
);

app.use(oidc4vciRouter);
app.use(issuerRoutes);
app.use(verifierRoutes);

app.use(errorHandler);

export default app;
