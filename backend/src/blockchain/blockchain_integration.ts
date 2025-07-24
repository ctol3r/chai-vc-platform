import { PolkadotService } from './polkadot_service';
import { ChainEvent } from './cross_chain_event_listener';

/**
 * BlockchainIntegration initializes services for the supported chains and
 * provides a single interface for the rest of the application to consume
 * realtime status updates.
 */
export class BlockchainIntegration {
  private polkadotService = new PolkadotService();

  async init(): Promise<void> {
    await this.polkadotService.initialize();
  }

  onStatusChange(cb: (event: ChainEvent) => void): void {
    this.polkadotService.onStatusChange(cb);
  }
}
