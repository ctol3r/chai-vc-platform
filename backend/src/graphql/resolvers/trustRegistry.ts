import { getPolkadotApi, getSigner } from "@/blockchain/api";

export const Mutation = {
  async authorizeIssuer(_: any, { account }: { account: string }, ctx: any) {
    const api = await getPolkadotApi(); const signer = await getSigner(ctx);
    const unsub = await api.tx.credentialPallet.authorizeIssuer(account)
      .signAndSend(signer, ({ status }) => { if (status.isInBlock || status.isFinalized) unsub(); });
    return true;
  },
  async deauthorizeIssuer(_: any, { account }: { account: string }, ctx: any) {
    const api = await getPolkadotApi(); const signer = await getSigner(ctx);
    const unsub = await api.tx.credentialPallet.deauthorizeIssuer(account)
      .signAndSend(signer, ({ status }) => { if (status.isInBlock || status.isFinalized) unsub(); });
    return true;
  },
};
export default { Mutation };
