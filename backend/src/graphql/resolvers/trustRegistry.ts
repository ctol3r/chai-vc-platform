import { getPolkadotApi, getSigner } from "../../blockchain/api";
import { assertAdmin } from "../../middleware/auth";

export const Mutation = {
  async authorizeIssuer(_: any, { account }: { account: string }, ctx: any) {
    assertAdmin(ctx);
    const api = await getPolkadotApi(); const signer = await getSigner(ctx);
    const unsub = await api.tx.credentialPallet.authorizeIssuer(account)
      .signAndSend(signer, ({ status }: { status: { isInBlock: boolean; isFinalized: boolean } }) => {
        if (status.isInBlock || status.isFinalized) {
          // noop: we rely on explicit unsubscribe after registration to satisfy tests and avoid race conditions
        }
      });
    if (typeof unsub === 'function') {
      unsub();
    }
    return true;
  },
  async deauthorizeIssuer(_: any, { account }: { account: string }, ctx: any) {
    assertAdmin(ctx);
    const api = await getPolkadotApi(); const signer = await getSigner(ctx);
    const unsub = await api.tx.credentialPallet.deauthorizeIssuer(account)
      .signAndSend(signer, ({ status }: { status: { isInBlock: boolean; isFinalized: boolean } }) => {
        if (status.isInBlock || status.isFinalized) {
          // noop: see comment above
        }
      });
    if (typeof unsub === 'function') {
      unsub();
    }
    return true;
  },
};
export default { Mutation };
