import { ApolloServer, gql } from 'apollo-server-express';
import { Express } from 'express';
import { PrismaClient, CredentialStatus } from '@prisma/client';

// Focused GraphQL schema for Credentials and DID Documents
export const typeDefs = gql`
  enum CredentialStatus {
    REQUESTED
    VERIFIED
    REVOKED
  }

  type Credential {
    id: ID!
    name: String!
    issuer: String!
    issuedAt: String!
    status: CredentialStatus!
  }

  type DIDDocument {
    id: ID!
    did: String!
    controller: String!
    keys: String
    services: String
    deactivated: Boolean!
  }

  type Query {
    listCredentials: [Credential!]!
    getCredential(id: ID!): Credential
    listDIDs: [DIDDocument!]!
    getDID(did: String!): DIDDocument
  }

  type Mutation {
    createCredential(name: String!, issuer: String!): Credential!
    verifyCredential(id: ID!): Credential!
    revokeCredential(id: ID!): Credential!

    createDID(did: String!, controller: String!, keys: String, services: String): DIDDocument!
  }
`;

export const resolvers = {
  Query: {
    listCredentials: async (_p: unknown, _a: unknown, ctx: { prisma: PrismaClient }) =>
      ctx.prisma.credential.findMany({ orderBy: { id: 'desc' } }),
    getCredential: async (_p: unknown, args: { id: string }, ctx: { prisma: PrismaClient }) => {
      const found = await ctx.prisma.credential.findUnique({ where: { id: Number(args.id) } });
      if (!found) throw new Error('Credential not found');
      return found;
    },

    listDIDs: async (_p: unknown, _a: unknown, ctx: { prisma: PrismaClient }) =>
      ctx.prisma.didDocument.findMany({ orderBy: { id: 'desc' } }),
    getDID: async (_p: unknown, args: { did: string }, ctx: { prisma: PrismaClient }) =>
      ctx.prisma.didDocument.findUnique({ where: { did: args.did } }),
  },
  Mutation: {
    createCredential: async (
      _p: unknown,
      args: { name: string; issuer: string },
      ctx: { prisma: PrismaClient }
    ) =>
      ctx.prisma.credential.create({
        data: { name: args.name, issuer: args.issuer, status: CredentialStatus.REQUESTED },
      }),

    verifyCredential: async (_p: unknown, args: { id: string }, ctx: { prisma: PrismaClient }) => {
      const id = Number(args.id);
      const exists = await ctx.prisma.credential.findUnique({ where: { id } });
      if (!exists) throw new Error('Credential not found');
      return ctx.prisma.credential.update({ where: { id }, data: { status: CredentialStatus.VERIFIED } });
    },

    revokeCredential: async (_p: unknown, args: { id: string }, ctx: { prisma: PrismaClient }) => {
      const id = Number(args.id);
      const exists = await ctx.prisma.credential.findUnique({ where: { id } });
      if (!exists) throw new Error('Credential not found');
      return ctx.prisma.credential.update({ where: { id }, data: { status: CredentialStatus.REVOKED } });
    },

    createDID: async (
      _p: unknown,
      args: { did: string; controller: string; keys?: string | null; services?: string | null },
      ctx: { prisma: PrismaClient }
    ) =>
      ctx.prisma.didDocument.create({
        data: {
          did: args.did,
          controller: args.controller,
          keys: args.keys ?? undefined,
          services: args.services ?? undefined,
        },
      }),
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
