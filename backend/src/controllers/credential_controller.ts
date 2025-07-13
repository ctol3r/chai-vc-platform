import { PolkadotService } from '../blockchain/polkadot_service';

/**
 * Issuer API controller for credential operations.
 */
export class CredentialController {
  private polkadot: PolkadotService;

  constructor() {
    this.polkadot = new PolkadotService();
  }

  /**
   * Update the on-chain revocation registry to revoke a credential.
   * @param credentialId Identifier of the credential to revoke.
   */
  async revokeCredential(credentialId: string): Promise<void> {
    // Delegate to the blockchain service. Errors would be propagated
    // to the caller so they can be handled by the API layer.
    await this.polkadot.updateRevocationRegistry(credentialId);
  }
}
