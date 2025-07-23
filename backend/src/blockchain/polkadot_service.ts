import { ApiPromise, WsProvider } from '@polkadot/api';

export class PolkadotService {
  private api?: ApiPromise;

  async connect(endpoint: string): Promise<ApiPromise> {
    if (!this.api) {
      const provider = new WsProvider(endpoint);
      this.api = await ApiPromise.create({ provider });
      await this.api.isReady;
    }
    return this.api;
  }
}
