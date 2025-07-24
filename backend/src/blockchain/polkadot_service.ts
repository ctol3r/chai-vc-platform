import { CrossChainEventListener, ChainEvent } from './cross_chain_event_listener';

/**
 * PolkadotService wires the CrossChainEventListener to the Polkadot network. It
 * demonstrates how the listener could be used to keep the application state in
 * sync with on-chain events in realtime.
 */
export class PolkadotService {
  private listener: CrossChainEventListener;

  constructor() {
    // In a full implementation more chains could be added here
    this.listener = new CrossChainEventListener(['polkadot']);
  }

  async initialize(): Promise<void> {
    await this.listener.connect();
    this.listener.startListening();
  }

  onStatusChange(cb: (event: ChainEvent) => void): void {
    this.listener.on('statusChanged', cb);
  }
}
