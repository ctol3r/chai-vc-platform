/**
 * In-memory credential store for Pilot P0.
 * Replaceable by DB persistence in future phases.
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
  private store: Map<string, CredentialRecord> = new Map();

  setIssued(
    id: string,
    data: {
      jwt: string;
      subjectId: string;
      validFrom?: string;
      validUntil?: string;
    }
  ): void {
    this.store.set(id, {
      status: 'ACTIVE',
      jwt: data.jwt,
      subjectId: data.subjectId,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
    });
  }

  setStatus(id: string, status: Status): void {
    const record = this.store.get(id);
    if (record) {
      record.status = status;
    } else {
      // Create minimal record if not exists
      this.store.set(id, { status });
    }
  }

  async getStatus(id: string): Promise<Status> {
    const record = this.store.get(id);
    if (!record) {
      return 'EXPIRED'; // treat unknown as expired
    }
    
    // Check time-based expiration
    if (record.validUntil) {
      const expiry = new Date(record.validUntil);
      if (expiry < new Date()) {
        record.status = 'EXPIRED';
      }
    }
    
    return record.status;
  }

  async findBySubject(
    subjectId: string
  ): Promise<Array<{ credentialId: string; status: Status }>> {
    const results: Array<{ credentialId: string; status: Status }> = [];
    
    for (const [credentialId, record] of this.store.entries()) {
      if (record.subjectId === subjectId) {
        results.push({
          credentialId,
          status: await this.getStatus(credentialId),
        });
      }
    }
    
    return results;
  }

  // Utility for testing/debugging
  clear(): void {
    this.store.clear();
  }
}

// Singleton instance
export const credentialStore = new CredentialStore();
