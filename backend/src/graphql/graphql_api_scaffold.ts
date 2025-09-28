import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json, type Express } from 'express';
import type { PrismaClient } from '@prisma/client';

type GraphQLContext = { prisma: PrismaClient };

// Comprehensive GraphQL schema integrating Express Apollo Server with Prisma
const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    credentials: [Credential!]
    jobs: [Job!]
  }

  type Credential {
    id: ID!
    name: String!
    issuer: String!
    issuedAt: String!
    expiresAt: String
    user: User
  }

  type Job {
    id: ID!
    title: String!
    description: String
    postedBy: User
    applicants: [User!]
  }

  type Query {
    users: [User!]
    user(id: ID!): User
    credentials: [Credential!]!
    credential(id: ID!): Credential
    jobs: [Job!]
    job(id: ID!): Job
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    createCredential(name: String!, issuer: String!): Credential!
    updateCredential(id: ID!, name: String, issuer: String): Credential!
    deleteCredential(id: ID!): Credential!
    issueCredential(
      userId: ID!
      name: String!
      issuer: String!
      issuedAt: String
      expiresAt: String
    ): Credential
    postJob(title: String!, description: String, postedBy: ID!): Job
    applyForJob(jobId: ID!, userId: ID!): Job
  }
`;

const resolvers = {
  Query: {
    credentials: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.credential.findMany();
    },
  },
};

export async function startApolloServer(app: Express, prisma: PrismaClient): Promise<void> {
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    json(),
    expressMiddleware(server, {
      context: async (): Promise<GraphQLContext> => ({ prisma }),
    }),
  );
}
