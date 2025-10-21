"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGraphQLRouter = buildGraphQLRouter;
exports.startApolloServer = startApolloServer;
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const audit_scrapbook_1 = require("../blockchain/audit_scrapbook");
const polkadot_service_1 = require("../blockchain/polkadot_service");
// Comprehensive GraphQL schema integrating Express Apollo Server with Prisma
const typeDefs = (0, apollo_server_express_1.gql) `
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
let polkadotService = null;
let auditScrapbook = null;
try {
    polkadotService = new polkadot_service_1.PolkadotService();
    auditScrapbook = new audit_scrapbook_1.AuditScrapbook(polkadotService);
}
catch (e) {
    console.warn('PolkadotService initialization skipped:', e);
}
async function handleTrustRegistryMutation(action, account) {
    const trimmed = account.trim();
    if (!trimmed || !polkadotService || !auditScrapbook) {
        return false;
    }
    const auditAction = `${action.toUpperCase()}_ISSUER:${trimmed}`;
    try {
        if (action === 'authorize') {
            await polkadotService.authorizeIssuer(trimmed);
        }
        else {
            await polkadotService.deauthorizeIssuer(trimmed);
        }
        await auditScrapbook.recordIdentityAction('trust-registry-admin', auditAction);
        return true;
    }
    catch (error) {
        console.error(`Failed to ${action} issuer`, error);
        await auditScrapbook.recordIdentityAction('trust-registry-admin', `FAILED_${auditAction}`);
        return false;
    }
}
const resolvers = {
    Query: {
        credentials: async (_parent, _args, ctx) => {
            return ctx.prisma.credential.findMany();
        },
    },
    Mutation: {
        authorizeIssuer: async (_parent, args) => handleTrustRegistryMutation('authorize', args.account),
        deauthorizeIssuer: async (_parent, args) => handleTrustRegistryMutation('deauthorize', args.account),
    },
};
async function buildGraphQLRouter(prisma) {
    const router = express_1.default.Router();
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs,
        resolvers,
        context: () => ({ prisma }),
    });
    await server.start();
    server.applyMiddleware({ app: router, path: '/' });
    router.get('/health', (_req, res) => res.json({ ok: true }));
    return router;
}
async function startApolloServer(app, prisma) {
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs,
        resolvers,
        context: () => ({ prisma }),
    });
    await server.start();
    server.applyMiddleware({ app });
}
