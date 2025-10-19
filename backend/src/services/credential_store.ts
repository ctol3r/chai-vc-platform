interface StoredCredential {
  credentialId: string;
  jwt: string;
  status: 'active' | 'revoked' | 'expired' | 'suspended';
  subjectId: string;
  issuedAt: string;
  credential: any;
}

class CredentialStore {
  private credentials: Map<string, StoredCredential> = new Map();
  private subjectIndex: Map<string, string[]> = new Map();

  async store(credentialId: string, jwt: string, credential: any): Promise<void> {
    const stored: StoredCredential = {
      credentialId,
      jwt,
      status: 'active',
      subjectId: credential.credentialSubject?.id || '',
      issuedAt: credential.issuanceDate || new Date().toISOString(),
      credential,
    };

    this.credentials.set(credentialId, stored);

    if (stored.subjectId) {
      const existing = this.subjectIndex.get(stored.subjectId) || [];
      existing.push(credentialId);
      this.subjectIndex.set(stored.subjectId, existing);
    }
  }

  async setStatus(credentialId: string, status: StoredCredential['status']): Promise<boolean> {
    const cred = this.credentials.get(credentialId);
    if (!cred) return false;
    cred.status = status;
    return true;
  }

  async getStatus(credentialId: string): Promise<StoredCredential['status'] | null> {
    return this.credentials.get(credentialId)?.status || null;
  }

  async findBySubject(subjectId: string): Promise<StoredCredential[]> {
    const ids = this.subjectIndex.get(subjectId) || [];
    return ids
      .map(id => this.credentials.get(id))
      .filter((c): c is StoredCredential => c !== undefined);
  }

  async get(credentialId: string): Promise<StoredCredential | null> {
    return this.credentials.get(credentialId) || null;
  }
}

export const store = new CredentialStore();
