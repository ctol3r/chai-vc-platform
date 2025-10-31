import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from './middleware/validateRequest';
import { errorHandler } from './middleware/errorHandler';
import { metricsHandler } from './instrumentation/metrics';

const app = express();

app.use(express.json());

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

app.use('/api/command', require('./controllers/commandController').default);
app.use('/api/ai', require('./controllers/aiController').default);
app.use('/api', require('./routes/claim').default);

app.get('/metrics', metricsHandler);

app.use(errorHandler);

export default app;
