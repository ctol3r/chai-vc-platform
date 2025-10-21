type CredentialStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

interface CredentialEntry {
  status: CredentialStatus;
  jwt?: string;
  subjectId?: string;
}

class CredentialStore {
  private store: Map<string, CredentialEntry> = new Map();
  private subjectIndex: Map<string, string[]> = new Map();

  setIssued(id: string, entry: { jwt: string; subjectId?: string }): void {
    this.store.set(id, {
      status: 'ACTIVE',
      jwt: entry.jwt,
      subjectId: entry.subjectId,
    });

    if (entry.subjectId) {
      const existing = this.subjectIndex.get(entry.subjectId) || [];
      if (!existing.includes(id)) {
        existing.push(id);
        this.subjectIndex.set(entry.subjectId, existing);
      }
    }
  }

  setStatus(id: string, status: CredentialStatus): void {
    const entry = this.store.get(id);
    if (entry) {
      entry.status = status;
    } else {
      this.store.set(id, { status });
    }
  }

  getStatus(id: string): CredentialStatus | undefined {
    return this.store.get(id)?.status;
  }

  findBySubject(subjectId: string): CredentialEntry[] {
    const ids = this.subjectIndex.get(subjectId) || [];
    return ids
      .map(id => this.store.get(id))
      .filter((entry): entry is CredentialEntry => entry !== undefined);
  }

  get(id: string): CredentialEntry | undefined {
    return this.store.get(id);
  }
}

export const store = new CredentialStore();
