import express from 'express';
import { PrismaClient } from '@prisma/client';
import { buildGraphQLRouter } from './graphql/graphql_api_scaffold';
import issuerRoutes from './routes/issuer_routes';
import { router as verifierRoutes } from './routes/verifier_routes';
import { revokeRouter } from './routes/revoke';
import { npiRouter } from './routes/npi';
import { practitionerRouter } from './routes/fhir_practitioner';

const prisma = new PrismaClient();

async function main() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'backend' }));
  app.get('/version', (_req, res) => res.json({ 
    version: '1.0.0-pilot', 
    features: ['issue', 'verify', 'revoke', 'npi-lookup', 'fhir-r4'] 
  }));

  app.use(issuerRoutes);
  app.use(verifierRoutes);
  app.use(revokeRouter());
  app.use(npiRouter());
  app.use(practitionerRouter());

  const gql = await buildGraphQLRouter(prisma);
  app.use('/graphql', gql);

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`api listening on :${port}`));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
