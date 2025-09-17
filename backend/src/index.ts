import express from 'express';
import { PrismaClient } from '@prisma/client';
import { startApolloServer } from './graphql/graphql_api_scaffold';

const app = express();

// Minimal CORS to enable frontend dev
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
const prisma = new PrismaClient();

// Parse JSON request bodies
app.use(express.json());

export default app;

export async function startServer() {
  await startApolloServer(app, prisma);
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}/graphql`);
  });
}

// If this module is executed directly, start the server
if (require.main === module) {
  startServer();
}
