import express, { Request, Response, Router } from 'express';
import fetch from 'node-fetch';

/**
 * Mapping between a REST endpoint and a GraphQL operation.
 */
export interface RestGraphQLMapping {
  /** HTTP method for the REST endpoint. */
  method: 'get' | 'post' | 'put' | 'delete';
  /** Path for the REST endpoint. */
  path: string;
  /** GraphQL query or mutation string. */
  gql: string;
}

/**
 * Creates an Express router that proxies REST calls to a GraphQL endpoint.
 *
 * @param graphqlEndpoint URL of the GraphQL server.
 * @param mappings Array describing how REST endpoints map to GraphQL operations.
 */
export function createGraphQLToRestAdapter(
  graphqlEndpoint: string,
  mappings: RestGraphQLMapping[],
): Router {
  const router = Router();

  mappings.forEach(({ method, path, gql }) => {
    (router as any)[method](path, async (req: Request, res: Response) => {
      try {
        const variables = { ...req.params, ...req.query, ...req.body };
        const response = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: gql, variables }),
        });
        const data = await response.json();
        if (data.errors) {
          res.status(500).json(data);
        } else {
          res.json(data.data);
        }
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });
  });

  return router;
}
