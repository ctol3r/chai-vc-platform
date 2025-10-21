export type Status = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface StoredCredential {
  status: Status;
  jwt?: string;
  subjectId?: string;
  validFrom?: string;
  validUntil?: string;
}

class InMemoryStore {
  private credentials: Map<string, StoredCredential> = new Map();

  async setIssued(
    credentialId: string,
    params: { jwt: string; subjectId: string; validFrom?: string; validUntil?: string }
  ): Promise<void> {
    this.credentials.set(credentialId, {
      status: 'ACTIVE',
      jwt: params.jwt,
      subjectId: params.subjectId,
      validFrom: params.validFrom,
      validUntil: params.validUntil,
    });
  }

  async setStatus(credentialId: string, status: Status): Promise<void> {
    const existing = this.credentials.get(credentialId);
    if (existing) {
      existing.status = status;
      this.credentials.set(credentialId, existing);
    } else {
      // Unknown credentials treated as record with just status
      this.credentials.set(credentialId, { status });
    }
  }

  async getStatus(credentialId: string): Promise<Status> {
    const record = this.credentials.get(credentialId);
    if (!record) return 'REVOKED';

    // honor expiry if present
    const nowMs = Date.now();
    if (record.validUntil) {
      const untilMs = Date.parse(record.validUntil);
      if (!Number.isNaN(untilMs) && nowMs > untilMs) {
        return 'EXPIRED';
      }
    }
    if (record.validFrom) {
      const fromMs = Date.parse(record.validFrom);
      if (!Number.isNaN(fromMs) && nowMs < fromMs) {
        return 'EXPIRED';
      }
    }

    return record.status;
  }

  async findBySubject(subjectId: string): Promise<Array<{ credentialId: string; status: Status }>> {
    const out: Array<{ credentialId: string; status: Status }> = [];
    for (const [credentialId, value] of this.credentials.entries()) {
      if (value.subjectId === subjectId) {
        out.push({ credentialId, status: await this.getStatus(credentialId) });
      }
    }
    return out;
  }
}

let singleton: InMemoryStore | null = null;

export function getStore(): InMemoryStore {
  if (!singleton) singleton = new InMemoryStore();
  return singleton;
}
