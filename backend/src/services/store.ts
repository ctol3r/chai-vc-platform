/**
 * In-memory store for Pilot P0
 * SINGLETON pattern - replaceable by DB later
 */

export type Status = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

interface CredentialRecord {
  status: Status;
  jwt?: string;
  subjectId?: string;
  validFrom?: string;
  validUntil?: string;
}

class CredentialStore {
  private static instance: CredentialStore;
  private credentials: Map<string, CredentialRecord>;

  private constructor() {
    this.credentials = new Map();
  }

  static getInstance(): CredentialStore {
    if (!CredentialStore.instance) {
      CredentialStore.instance = new CredentialStore();
    }
    return CredentialStore.instance;
  }

  /**
   * Store issued credential with metadata
   */
  async setIssued(
    credentialId: string,
    data: {
      jwt?: string;
      subjectId?: string;
      validFrom?: string;
      validUntil?: string;
    }
  ): Promise<void> {
    this.credentials.set(credentialId, {
      status: 'ACTIVE',
      jwt: data.jwt,
      subjectId: data.subjectId,
      validFrom: data.validFrom,
      validUntil: data.validUntil
    });

    // Check expiry if validUntil is provided
    if (data.validUntil) {
      const expiryTime = new Date(data.validUntil).getTime();
      if (expiryTime < Date.now()) {
        this.credentials.set(credentialId, {
          ...this.credentials.get(credentialId)!,
          status: 'EXPIRED'
        });
      }
    }
  }

  /**
   * Update credential status
   */
  async setStatus(credentialId: string, status: Status): Promise<void> {
    const record = this.credentials.get(credentialId);
    if (record) {
      record.status = status;
    } else {
      // Create minimal record if not exists
      this.credentials.set(credentialId, { status });
    }
  }

  /**
   * Get credential status
   */
  async getStatus(credentialId: string): Promise<Status> {
    const record = this.credentials.get(credentialId);
    
    if (!record) {
      // Unknown credentials are considered revoked for safety
      return 'REVOKED';
    }

    // Check expiry dynamically
    if (record.validUntil) {
      const expiryTime = new Date(record.validUntil).getTime();
      if (expiryTime < Date.now()) {
        record.status = 'EXPIRED';
      }
    }

    return record.status;
  }

  /**
   * Find credentials by subject ID
   */
  async findBySubject(subjectId: string): Promise<Array<{ credentialId: string; status: Status }>> {
    const results: Array<{ credentialId: string; status: Status }> = [];
    
    this.credentials.forEach((record, credentialId) => {
      if (record.subjectId === subjectId) {
        // Check expiry dynamically
        if (record.validUntil) {
          const expiryTime = new Date(record.validUntil).getTime();
          if (expiryTime < Date.now()) {
            record.status = 'EXPIRED';
          }
        }
        
        results.push({ credentialId, status: record.status });
      }
    });
    
    return results;
  }

  /**
   * Get full credential record (for internal use)
   */
  async getCredential(credentialId: string): Promise<CredentialRecord | undefined> {
    return this.credentials.get(credentialId);
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.credentials.clear();
  }
}

// Export singleton instance
export const store = CredentialStore.getInstance();