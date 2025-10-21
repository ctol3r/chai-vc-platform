/**
 * In-memory store for Pilot P0 API
 * Singleton pattern for credential management
 */

export type Status = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface CredentialRecord {
  status: Status;
  jwt?: string;
  subjectId?: string;
  validFrom?: string;
  validUntil?: string;
}

export interface SubjectCredential {
  credentialId: string;
  status: Status;
}

class InMemoryStore {
  private credentials: Map<string, CredentialRecord> = new Map();

  /**
   * Store a newly issued credential
   */
  setIssued(
    credentialId: string,
    record: {
      jwt: string;
      subjectId: string;
      validFrom?: string;
      validUntil?: string;
    }
  ): void {
    this.credentials.set(credentialId, {
      status: 'ACTIVE',
      jwt: record.jwt,
      subjectId: record.subjectId,
      validFrom: record.validFrom,
      validUntil: record.validUntil,
    });
  }

  /**
   * Update the status of a credential
   */
  setStatus(credentialId: string, status: Status): void {
    const existing = this.credentials.get(credentialId);
    if (existing) {
      this.credentials.set(credentialId, {
        ...existing,
        status,
      });
    }
  }

  /**
   * Get the status of a credential
   */
  async getStatus(credentialId: string): Promise<Status | null> {
    const record = this.credentials.get(credentialId);
    return record?.status || null;
  }

  /**
   * Find all credentials for a subject
   */
  async findBySubject(subjectId: string): Promise<SubjectCredential[]> {
    const results: SubjectCredential[] = [];
    
    for (const [credentialId, record] of this.credentials.entries()) {
      if (record.subjectId === subjectId) {
        results.push({
          credentialId,
          status: record.status,
        });
      }
    }
    
    return results;
  }

  /**
   * Get full credential record
   */
  getCredential(credentialId: string): CredentialRecord | null {
    return this.credentials.get(credentialId) || null;
  }

  /**
   * Check if credential exists
   */
  hasCredential(credentialId: string): boolean {
    return this.credentials.has(credentialId);
  }

  /**
   * Get all credentials (for debugging)
   */
  getAllCredentials(): Map<string, CredentialRecord> {
    return new Map(this.credentials);
  }

  /**
   * Clear all credentials (for testing)
   */
  clear(): void {
    this.credentials.clear();
  }
}

// Singleton instance
const store = new InMemoryStore();

export default store;