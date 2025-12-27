import { PrismaClient } from '@prisma/client';
import { PolkadotService } from '../../blockchain/polkadot_service';
import { issueStatusProof } from '../../blockchain/acaPy';
const assertIssuer = (context: IssuanceContext) => {
  if (!context.user?.roles?.includes('issuer')) {
    throw new Error('Unauthorized: issuer role required');
  }
};

const polkadotService = new PolkadotService();

type IssuanceContext = {
  prisma: PrismaClient;
  user?: {
    roles?: string[];
  };
};

const normalizeId = (value: string | number): number => {
  const parsed = typeof value === 'number' ? value : parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error('Invalid credential id');
  }
  return parsed;
};

export async function issueCredential(
  _parent: unknown,
  args: { id: string | number; hash: string; shareStatusOnly?: boolean },
  context: IssuanceContext
) {
  assertIssuer(context);
  const { txHash, status } = await polkadotService.issueCredential(args.hash);
  const update = await context.prisma.credential.update({
    where: { id: normalizeId(args.id) },
    data: { chainTxId: txHash, chainStatus: status },
  });

  if (args.shareStatusOnly) {
    const proof = await issueStatusProof(args.hash);
    return {
      ...update,
      proofToken: proof.proofToken,
    };
  }

  return update;
}

export async function revokeCredential(
  _parent: unknown,
  args: { id: string | number; hash: string; reason?: string },
  context: IssuanceContext
) {
  assertIssuer(context);
  const { txHash, status } = await polkadotService.revokeCredential(args.hash, args.reason);
  return context.prisma.credential.update({
    where: { id: normalizeId(args.id) },
    data: { chainTxId: txHash, chainStatus: status },
  });
}

export const IssuanceMutation = {
  issueCredential,
  revokeCredential,
};
