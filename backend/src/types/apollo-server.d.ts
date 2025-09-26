declare module '@apollo/server' {
  interface ApolloServerConfig<Context> {
    typeDefs: unknown;
    resolvers?: unknown;
    plugins?: unknown[];
  }

  export class ApolloServer<Context = Record<string, unknown>> {
    constructor(config: ApolloServerConfig<Context>);
    start(): Promise<void>;
    stop(): Promise<void>;
  }
}

declare module '@apollo/server/express4' {
  import type { ApolloServer } from '@apollo/server';
  import type { RequestHandler } from 'express';

  interface MiddlewareOptions<Context> {
    context?: () => Promise<Context> | Context;
  }

  export function expressMiddleware<Context = Record<string, unknown>>(
    server: ApolloServer<Context>,
    options?: MiddlewareOptions<Context>,
  ): RequestHandler;
}
