import { ApiPromise, WsProvider } from '@polkadot/api';

export class PolkadotService {
  api: any;

  async connect(endpoint: string): Promise<void> {
    const provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({ provider } as any);
  }

  async anchorData(payload: any, signer?: any): Promise<any> {
    if (!this.api) throw new Error('Not connected');
    const tx = this.api.tx?.myModule?.anchor ? this.api.tx.myModule.anchor(payload) : null;
    if (!tx) throw new Error('anchor tx not available on runtime');
    return (await tx.signAndSend(signer)) as any;
  }

  async submitBatch(batchTx: any, signer?: any): Promise<any> {
    const batch = this.api?.tx?.utility?.batchAll ? this.api.tx.utility.batchAll(batchTx) : null;
    if (!batch) throw new Error('batch API not available');
    return (await batch.signAndSend(signer)) as any;
  }
}
