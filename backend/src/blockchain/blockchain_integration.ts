import { DilithiumCrypto, DilithiumKeyPair } from './dilithium_crypto';

/**
 * Simple blockchain integration example that demonstrates
 * how Dilithium-based signatures could be used.
 */
export class BlockchainIntegration {
  private crypto = new DilithiumCrypto();
  private keys?: DilithiumKeyPair;

  /**
   * Initialize the integration by generating a fresh key pair.
   */
  async init(): Promise<void> {
    this.keys = await this.crypto.generateKeyPair();
  }

  /**
   * Sign arbitrary data for submission to the blockchain.
   */
  async signData(data: Uint8Array): Promise<Uint8Array> {
    if (!this.keys) {
      throw new Error('Integration not initialized');
    }
    return await this.crypto.signMessage(data, this.keys.privateKey);
  }

  /**
   * Verify signed blockchain data.
   */
  async verifyData(signature: Uint8Array, data: Uint8Array): Promise<boolean> {
    if (!this.keys) {
      throw new Error('Integration not initialized');
    }
    return await this.crypto.verifySignature(signature, data, this.keys.publicKey);
  }
}
