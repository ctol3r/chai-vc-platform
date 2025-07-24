import { EventEmitter } from 'events';

export interface ChainEvent {
  chain: string;
  status: string;
  txHash?: string;
}

/**
 * CrossChainEventListener establishes lightweight listeners for multiple chains
 * and emits a `statusChanged` event whenever an on-chain status update occurs.
 * This is a stub implementation meant to show how realtime sync could work.
 */
export class CrossChainEventListener extends EventEmitter {
  constructor(private chains: string[] = []) {
    super();
  }

  /**
   * Connects to the configured chains. In a real implementation this would
   * create API instances for each chain (e.g. using polkadot.js or ethers.js).
   */
  async connect(): Promise<void> {
    for (const chain of this.chains) {
      // placeholder for establishing connections
      this.emit('connected', chain);
    }
  }

  /**
   * Starts listening to status update events on all chains. The current logic
   * simply emits a mock event every second to illustrate how the listener would
   * notify consumers in realtime.
   */
  startListening(): void {
    setInterval(() => {
      const event: ChainEvent = {
        chain: this.chains[0] || 'unknown',
        status: 'UPDATED',
      };
      this.emit('statusChanged', event);
    }, 1000);
  }
}
