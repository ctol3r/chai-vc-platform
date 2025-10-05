import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { validateRequest } from './middleware/validateRequest';
import { errorHandler } from './middleware/errorHandler';
import { router as verifierRouter } from './routes/verifier_routes';

const app = express();

app.use(express.json());

// Serve static files from the 'public' directory, which will make index.html available at /developers
app.use('/developers', express.static(path.join(__dirname, '../public')));

// Route to serve the OpenAPI spec
app.get('/developers/openapi.yaml', (_req: Request, res: Response) => {
  const openapiPath = path.resolve(__dirname, '../../../docs/developer-portal/openapi.yaml');
  try {
    const yamlFile = fs.readFileSync(openapiPath, 'utf8');
    res.setHeader('Content-Type', 'text/yaml');
    res.send(yamlFile);
  } catch (error) {
    console.error('Failed to read openapi.yaml:', error);
    res.status(500).send('Error: Could not read openapi.yaml file.');
  }
});

// Use the existing application routes
app.use(verifierRouter);

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

app.use(errorHandler);

export default app;
