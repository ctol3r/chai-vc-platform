import express, { NextFunction, Request, Response } from 'express';
import healthRouter from './routes/health';
import proveRouter from './routes/prove';
import verifyRouter from './routes/verify';
import keyinfoRouter from './routes/keyinfo';

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/prove', proveRouter);
  app.use('/verify', verifyRouter);
  app.use('/keyinfo', keyinfoRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    res.status(500).json({ error: message });
  });

  return app;
};

export type App = ReturnType<typeof createApp>;
