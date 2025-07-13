export enum CredentialState {
  ACTIVE = 'active',
  REVOKED = 'revoked'
}

export interface CredentialStatus {
  id: string;
  state: CredentialState;
}

/**
 * CredentialStatusList simulates an on-chain registry of credential states.
 * For the purposes of this codebase it is an in-memory list that could be
 * backed by an actual blockchain in a real implementation.
 */
export class CredentialStatusList {
  private statuses: Map<string, CredentialState> = new Map();

  /**
   * Add a credential to the list with ACTIVE state.
   * If the credential already exists it will be overwritten.
   */
  addCredential(id: string) {
    this.statuses.set(id, CredentialState.ACTIVE);
  }

  /**
   * Revoke a credential, setting its state to REVOKED.
   */
  revokeCredential(id: string) {
    if (!this.statuses.has(id)) {
      throw new Error(`Credential ${id} not found`);
    }
    this.statuses.set(id, CredentialState.REVOKED);
  }

  /**
   * Get the state of a credential, or undefined if not present.
   */
  getStatus(id: string): CredentialState | undefined {
    return this.statuses.get(id);
  }

  /**
   * Determine if a credential is active.
   */
  isActive(id: string): boolean {
    return this.statuses.get(id) === CredentialState.ACTIVE;
  }
}
