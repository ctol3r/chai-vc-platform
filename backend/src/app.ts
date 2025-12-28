import express from 'express';
import credentialRouter from './controllers/credential_controller';

// Create an Express application and register routes.
const app = express();

// Mount the credential router at the root path.
app.use('/', credentialRouter);

export default app;
