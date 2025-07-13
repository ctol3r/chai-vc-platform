import { BlockchainIntegration } from './blockchain_integration';

/**
 * Service class meant to interact with the Polkadot blockchain.
 * It demonstrates signing data with Dilithium before sending it off chain.
 */
export class PolkadotService {
  private integration = new BlockchainIntegration();

  async initialize(): Promise<void> {
    await this.integration.init();
  }

  /**
   * Example method that signs payloads prior to submission.
   */
  async submitPayload(payload: Uint8Array): Promise<Uint8Array> {
    return this.integration.signData(payload);
  }
}
