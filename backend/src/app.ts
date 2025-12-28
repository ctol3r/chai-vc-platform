import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from './middleware/validateRequest';
import { errorHandler } from './middleware/errorHandler';
import { register } from './metrics';

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

app.get('/metrics', async (_: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.use(errorHandler);

export default app;
