import { PolkadotService } from '../../blockchain/polkadot_service';

type TrustRegistryContext = {
  user?: {
    roles?: string[];
  };
};

const polkadotService = new PolkadotService();

function assertAdmin(ctx: TrustRegistryContext) {
  if (!ctx.user?.roles?.includes('admin')) {
    throw new Error('Unauthorized: admin role required');
  }
}

export const Mutation = {
  async authorizeIssuer(
    _parent: unknown,
    { account }: { account: string },
    ctx: TrustRegistryContext
  ) {
    assertAdmin(ctx);
    await polkadotService.authorizeIssuer(account);
    return true;
  },
  async deauthorizeIssuer(
    _parent: unknown,
    { account }: { account: string },
    ctx: TrustRegistryContext
  ) {
    assertAdmin(ctx);
    await polkadotService.deauthorizeIssuer(account);
    return true;
  },
};

export default { Mutation };
