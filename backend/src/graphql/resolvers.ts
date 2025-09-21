import { PrismaClient } from '@prisma/client';
import { AuditScrapbook } from '../blockchain/audit_scrapbook';
import { PolkadotService } from '../blockchain/polkadot_service';
import { assertAdmin } from '../auth/roles';
import { IssuanceMutation } from './resolvers/issuance';
import { VerifierMutation } from './resolvers/verifier';

type Context = {
  prisma: PrismaClient;
  user?: {
    roles?: string[];
  };
};

const polkadotService = new PolkadotService();
const auditScrapbook = new AuditScrapbook(polkadotService);

async function handleTrustRegistryMutation(
  action: 'authorize' | 'deauthorize',
  account: string
): Promise<boolean> {
  const normalized = account.trim();
  if (!normalized) {
    return false;
  }

  const auditAction = `${action.toUpperCase()}_ISSUER:${normalized}`;

  try {
    if (action === 'authorize') {
      await polkadotService.authorizeIssuer(normalized);
    } else {
      await polkadotService.deauthorizeIssuer(normalized);
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

export const resolvers = {
  Query: {
    credentials: (_parent: unknown, _args: unknown, context: Context) => context.prisma.credential.findMany(),
    credential: (_parent: unknown, args: { id: string }, context: Context) =>
      context.prisma.credential.findUnique({ where: { id: args.id } }),
  },
  Mutation: {
    createCredential: (_parent: unknown, args: { name: string; issuer: string }, context: Context) =>
      context.prisma.credential.create({
        data: {
          name: args.name,
          issuer: args.issuer,
          issuedAt: new Date().toISOString(),
        },
      }),

    updateCredential: (
      _parent: unknown,
      args: { id: string; name?: string; issuer?: string },
      context: Context
    ) =>
      context.prisma.credential.update({
        where: { id: args.id },
        data: {
          name: args.name,
          issuer: args.issuer,
        },
      }),

    deleteCredential: (_parent: unknown, args: { id: string }, context: Context) =>
      context.prisma.credential.delete({ where: { id: args.id } }),
    issueCredential: (parent: unknown, args: unknown, context: Context) =>
      IssuanceMutation.issueCredential(parent, args as any, context),
    revokeCredential: (parent: unknown, args: unknown, context: Context) =>
      IssuanceMutation.revokeCredential(parent, args as any, context),
    verifyProof: (parent: unknown, args: unknown) =>
      VerifierMutation.verifyProof(parent, args as any),
    authorizeIssuer: async (
      _parent: unknown,
      args: { account: string },
      context: Context & { user?: { roles?: string[] } }
    ) => {
      assertAdmin(context);
      return handleTrustRegistryMutation('authorize', args.account);
    },
    deauthorizeIssuer: async (
      _parent: unknown,
      args: { account: string },
      context: Context & { user?: { roles?: string[] } }
    ) => {
      assertAdmin(context);
      return handleTrustRegistryMutation('deauthorize', args.account);
    },
  },
};
