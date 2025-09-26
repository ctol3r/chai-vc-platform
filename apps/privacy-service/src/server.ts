import { createServer } from 'http';
import { createApp } from './app';

const DEFAULT_PORT = 5050;

export const startServer = (port: number = Number(process.env.PORT) || DEFAULT_PORT) => {
  const app = createApp();
  const server = createServer(app);

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[privacy-service] listening on http://localhost:${port}`);
  });

  return server;
};
