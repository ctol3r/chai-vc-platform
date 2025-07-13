import { CredentialStatusList, CredentialState } from './credential_status_list';

/**
 * PolkadotService simulates interaction with an on-chain registry for
 * credential status. In a real implementation this would interact with a
 * Polkadot smart contract or pallet. Here we simply delegate to an in-memory
 * CredentialStatusList instance.
 */
export class PolkadotService {
  private statusList = new CredentialStatusList();

  /** Register a credential on-chain with ACTIVE status. */
  registerCredential(id: string) {
    this.statusList.addCredential(id);
  }

  /** Revoke a credential on-chain. */
  revokeCredential(id: string) {
    this.statusList.revokeCredential(id);
  }

  /**
   * Retrieve the current state for a credential.
   */
  getCredentialState(id: string): CredentialState | undefined {
    return this.statusList.getStatus(id);
  }

  /**
   * Convenience method to check if credential is active.
   */
  isCredentialActive(id: string): boolean {
    return this.statusList.isActive(id);
  }
}
