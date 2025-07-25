import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema, rootValue } from './graphql/graphql_api_scaffold';

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount the GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue,
  graphiql: true,
}));

export default app;

// If this module is executed directly, start the server
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
