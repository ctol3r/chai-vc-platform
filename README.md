# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## GraphQL-to-REST Adapter

This repository now includes a simple adapter that exposes GraphQL operations through REST endpoints.  The adapter can be found in `backend/src/graphql/graphql_rest_adapter.ts` and can be used to integrate the GraphQL API with legacy systems that only support REST.

Example usage:

```ts
import express from 'express';
import { createGraphQLToRestAdapter } from './backend/src/graphql/graphql_rest_adapter';

const app = express();

const adapter = createGraphQLToRestAdapter('https://your-graphql-server.com/graphql', [
  {
    method: 'get',
    path: '/legacy/user/:id',
    gql: 'query ($id: ID!) { user(id: $id) { id name } }',
  },
]);

app.use(adapter);
app.listen(3000);
```
