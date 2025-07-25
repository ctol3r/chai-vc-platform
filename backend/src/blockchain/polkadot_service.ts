import { KeyRotationPolicy } from './key_rotation_policy';

/**
 * Simplified Polkadot service placeholder implementing key rotation logic.
 */
export class PolkadotService {
  private keyPolicy: KeyRotationPolicy;

  constructor(initialKey: string) {
    this.keyPolicy = new KeyRotationPolicy(initialKey);
  }

  /**
   * Schedule rotation of the signing key used for transactions.
   */
  scheduleKeyRotation(newKey: string, transitionTime: number): void {
    this.keyPolicy.scheduleRotation(newKey, transitionTime);
  }

  /**
   * Retrieve the key that should be used for signing at the given time.
   */
  getSigningKey(currentTime: number = Date.now()): string {
    return this.keyPolicy.getActiveKey(currentTime);
  }
}
