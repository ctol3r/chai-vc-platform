/**
 * Singleton in-memory store for Pilot P0
 * Replaceable by DB later
 */

export type Status = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface CredentialRecord {
  status: Status;
  jwt?: string;
  subjectId?: string;
  validFrom?: string;
  validUntil?: string;
}

class CredentialStore {
  private store = new Map<string, CredentialRecord>();

  setIssued(
    id: string,
    record: {
      jwt: string;
      subjectId: string;
      validFrom?: string;
      validUntil?: string;
    }
  ): void {
    this.store.set(id, {
      status: 'ACTIVE',
      jwt: record.jwt,
      subjectId: record.subjectId,
      validFrom: record.validFrom,
      validUntil: record.validUntil,
    });
  }

  setStatus(id: string, status: Status): void {
    const existing = this.store.get(id);
    if (existing) {
      this.store.set(id, { ...existing, status });
    }
  }

  async getStatus(id: string): Promise<Status> {
    const record = this.store.get(id);
    if (!record) {
      return 'EXPIRED'; // Default for unknown credentials
    }

    // Check expiration
    if (record.validUntil) {
      const now = new Date();
      const until = new Date(record.validUntil);
      if (now > until) {
        this.setStatus(id, 'EXPIRED');
        return 'EXPIRED';
      }
    }

    return record.status;
  }

  async findBySubject(subjectId: string): Promise<Array<{ credentialId: string; status: Status }>> {
    const results: Array<{ credentialId: string; status: Status }> = [];
    
    for (const [credentialId, record] of this.store.entries()) {
      if (record.subjectId === subjectId) {
        const status = await this.getStatus(credentialId);
        results.push({ credentialId, status });
      }
    }
    
    return results;
  }

  // Helper method for testing/debugging
  getRecord(id: string): CredentialRecord | undefined {
    return this.store.get(id);
  }

  // Helper method to clear store (for testing)
  clear(): void {
    this.store.clear();
  }
}

// Singleton instance
export const credentialStore = new CredentialStore();