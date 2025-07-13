import { ApiPromise, WsProvider } from '@polkadot/api';

export interface ForkEvent {
  previousBlock: string;
  newBlock: string;
}

export class NodeMonitor {
  private api: ApiPromise | undefined;
  private lastFinalized: string | undefined;

  constructor(private endpoint: string) {}

  async init(): Promise<void> {
    const provider = new WsProvider(this.endpoint);
    this.api = await ApiPromise.create({ provider });
  }

  async checkHealth(): Promise<boolean> {
    if (!this.api) throw new Error('API not initialized');
    const health = await this.api.rpc.system.health();
    return !health.isSyncing;
  }

  async detectFork(onFork: (ev: ForkEvent) => void): Promise<void> {
    if (!this.api) throw new Error('API not initialized');
    const header = await this.api.rpc.chain.getFinalizedHead();
    const hex = header.toHex();
    if (this.lastFinalized && this.lastFinalized !== hex) {
      onFork({ previousBlock: this.lastFinalized, newBlock: hex });
    }
    this.lastFinalized = hex;
  }

  async start(onFork: (ev: ForkEvent) => void, interval = 60000): Promise<void> {
    await this.init();
    // Initial check
    await this.detectFork(onFork);
    setInterval(() => {
      this.detectFork(onFork).catch((e) => console.error('Monitor error', e));
    }, interval);
  }
}

// Example usage when run directly
if (require.main === module) {
  const monitor = new NodeMonitor('ws://localhost:9944');
  monitor
    .start((ev) => console.log('Fork detected', ev))
    .then(() => console.log('Monitoring started'))
    .catch((err) => console.error(err));
}
