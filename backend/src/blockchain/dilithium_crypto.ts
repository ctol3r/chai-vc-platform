import { dilithium } from 'dilithium-crystals';

export interface DilithiumKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

/**
 * Dilithium-based cryptography helper functions.
 */
export class DilithiumCrypto {
  /**
   * Generate a new Dilithium key pair.
   */
  async generateKeyPair(): Promise<DilithiumKeyPair> {
    return await dilithium.keyPair();
  }

  /**
   * Sign a message using the provided private key and return the detached signature.
   */
  async signMessage(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
    return await dilithium.signDetached(message, privateKey);
  }

  /**
   * Verify a detached signature against the message and public key.
   */
  async verifySignature(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<boolean> {
    return await dilithium.verifyDetached(signature, message, publicKey);
  }
}
