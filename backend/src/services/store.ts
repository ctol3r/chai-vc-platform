type Status = "ACTIVE" | "REVOKED" | "EXPIRED";

interface CredentialRecord {
  jwt: string;
  subjectId: string;
  status: Status;
}

const db = new Map<string, CredentialRecord>();

export const store = {
  async setIssued(id: string, record: { jwt: string; subjectId: string }) {
    db.set(id, { ...record, status: "ACTIVE" });
  },
  async setStatus(id: string, status: Status) {
    const cur = db.get(id) || { status: "ACTIVE" as Status, jwt: "", subjectId: "" };
    db.set(id, { ...cur, status });
  },
  async getStatus(id: string): Promise<Status> {
    return db.get(id)?.status ?? "EXPIRED";
  },
  async findBySubject(subjectId: string) {
    return [...db.entries()]
      .filter(([, v]) => v.subjectId === subjectId)
      .map(([credentialId, v]) => ({ credentialId, status: v.status }));
  },
  async getCredential(id: string): Promise<CredentialRecord | undefined> {
    return db.get(id);
  }
};
