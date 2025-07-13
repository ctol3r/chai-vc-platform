import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import credentialRouter from './controllers/credential_controller';
import { typeDefs, resolvers } from './graphql/graphql_api_scaffold';

async function startServer() {
  const app = express();
  app.use(express.json());

  // REST endpoint
  app.use('/api/issuer/credentials', credentialRouter);

  // GraphQL schema and resolvers are imported from scaffold

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
