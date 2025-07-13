export type CredentialStatus = 'provisional' | 'official';

export interface Credential {
  id: string;
  data: unknown;
  status: CredentialStatus;
}

/**
 * Simple in-memory controller to manage credentials. In a real
 * implementation this would use a persistent store.
 */
export class CredentialService {
  private credentials = new Map<string, Credential>();

  /**
   * Create a credential marked as provisional.
   */
  createProvisional(id: string, data: unknown): Credential {
    const credential: Credential = { id, data, status: 'provisional' };
    this.credentials.set(id, credential);
    return credential;
  }

  /**
   * Mark an existing credential as officially issued.
   */
  markOfficial(id: string): Credential | undefined {
    const credential = this.credentials.get(id);
    if (credential) {
      credential.status = 'official';
    }
    return credential;
  }

  getCredential(id: string): Credential | undefined {
    return this.credentials.get(id);
  }

  listProvisional(): Credential[] {
    return Array.from(this.credentials.values()).filter(c => c.status === 'provisional');
  }
}

export const credentialService = new CredentialService();
