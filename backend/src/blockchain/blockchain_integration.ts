// blockchain_integration.ts - bridge integration for credential validation

import { EthereumBridgeService } from './ethereum_bridge_service';

export class BlockchainIntegration {
  private bridge = new EthereumBridgeService();

  /**
   * Validate a credential hash through the Ethereum bridge.
   */
  async validateCredential(hash: string): Promise<boolean> {
    return this.bridge.validate(hash);
  }
}
