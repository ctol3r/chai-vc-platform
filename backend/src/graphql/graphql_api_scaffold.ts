import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';

const typeDefs = `#graphql
  type Credential {
    id: Int!
    title: String!
  }

  type Query {
    credentials: [Credential!]!
  }
`;

const resolvers = {
  Query: {
    credentials: async (_parent: unknown, _args: unknown, ctx: { prisma: PrismaClient }) => {
      return ctx.prisma.credential.findMany();
    },
  },
};

export async function startApolloServer(app: Express, prisma: PrismaClient) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ prisma }),
  });
  await server.start();
  server.applyMiddleware({ app });
}
