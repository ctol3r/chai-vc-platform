import { PolkadotService } from './polkadot_service';

export interface DecisionMetadata {
  [key: string]: any;
}

export class BlockchainIntegration {
  private service: PolkadotService;

  constructor(service = new PolkadotService()) {
    this.service = service;
  }

  /**
   * Log a human or AI driven decision to the blockchain.
   * The log entry is immutable once appended to the chain.
   */
  async logDecision(decision: string, metadata: DecisionMetadata = {}): Promise<void> {
    const entry = {
      decision,
      metadata,
      timestamp: new Date().toISOString(),
    };
    await this.service.appendLog(JSON.stringify(entry));
  }
}
