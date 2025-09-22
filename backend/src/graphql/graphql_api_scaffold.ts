import { ApolloServer, gql } from 'apollo-server-express';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuditScrapbook } from '../blockchain/audit_scrapbook';
import { PolkadotService } from '../blockchain/polkadot_service';

// Comprehensive GraphQL schema integrating Express Apollo Server with Prisma
const typeDefs = gql`
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
    authorizeIssuer(account: String!): Boolean!
    deauthorizeIssuer(account: String!): Boolean!
  }
`;

const polkadotService = new PolkadotService();
const auditScrapbook = new AuditScrapbook(polkadotService);

async function handleTrustRegistryMutation(
  action: 'authorize' | 'deauthorize',
  account: string
): Promise<boolean> {
  const trimmed = account.trim();
  if (!trimmed) {
    return false;
  }

  const auditAction = `${action.toUpperCase()}_ISSUER:${trimmed}`;

  try {
    if (action === 'authorize') {
      await polkadotService.authorizeIssuer(trimmed);
    } else {
      await polkadotService.deauthorizeIssuer(trimmed);
    }
    await auditScrapbook.recordIdentityAction('trust-registry-admin', auditAction);
    return true;
  } catch (error) {
    console.error(`Failed to ${action} issuer`, error);
    await auditScrapbook.recordIdentityAction(
      'trust-registry-admin',
      `FAILED_${auditAction}`
    );
    return false;
  }
}

const resolvers = {
  Query: {
    credentials: async (_parent: unknown, _args: unknown, ctx: { prisma: PrismaClient }) => {
      return ctx.prisma.credential.findMany();
    },
  },
  Mutation: {
    authorizeIssuer: async (
      _parent: unknown,
      args: { account: string }
    ): Promise<boolean> => handleTrustRegistryMutation('authorize', args.account),
    deauthorizeIssuer: async (
      _parent: unknown,
      args: { account: string }
    ): Promise<boolean> => handleTrustRegistryMutation('deauthorize', args.account),
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
