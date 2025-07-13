import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

export class PolkadotService {
  private api: ApiPromise | null = null;

  async connect(endpoint: string): Promise<void> {
    const provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({ provider });
    await this.api.isReady;
  }

  async updateCredentialStatus(id: string, status: string): Promise<void> {
    if (!this.api) throw new Error('API not initialized');

    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromUri(process.env.POLKADOT_SEED || '//Alice');

    // In a real implementation, credentials pallet would expose setStatus
    const tx = (this.api.tx as any).credentials?.setStatus(id, status);
    if (!tx) {
      throw new Error('credentials.setStatus extrinsic not available');
    }

    await tx.signAndSend(account);
  }
}
