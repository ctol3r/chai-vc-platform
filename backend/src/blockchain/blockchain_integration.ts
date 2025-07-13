import { PolkadotService } from './polkadot_service';

/**
 * High level blockchain integration used by the rest of the backend.
 * Currently only exposes a method to update the revocation registry
 * via the underlying Polkadot service.
 */
export class BlockchainIntegration {
  private polkadot: PolkadotService;

  constructor() {
    this.polkadot = new PolkadotService();
  }

  /**
   * Update the on-chain revocation registry for a credential.
   */
  async updateRevocationRegistry(credentialId: string): Promise<void> {
    await this.polkadot.updateRevocationRegistry(credentialId);
  }
}
