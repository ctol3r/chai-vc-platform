import { PolkadotService } from './polkadot_service';
import { CredentialState } from './credential_status_list';

/**
 * BlockchainIntegration provides a higher level API that the rest of the
 * backend can use to interact with the underlying blockchain service.
 */
export class BlockchainIntegration {
  private service = new PolkadotService();

  /**
   * Register a credential and return its active state.
   */
  async registerCredential(id: string): Promise<CredentialState> {
    this.service.registerCredential(id);
    return this.service.getCredentialState(id)!;
  }

  /**
   * Revoke a credential.
   */
  async revokeCredential(id: string): Promise<CredentialState> {
    this.service.revokeCredential(id);
    return this.service.getCredentialState(id)!;
  }

  /**
   * Check if a credential is active.
   */
  async isCredentialActive(id: string): Promise<boolean> {
    return this.service.isCredentialActive(id);
  }
}
