export interface CredentialRecord {
  id: string;
  hashedVC: string;
  [key: string]: any;
}

// In-memory store simulating off-chain data storage
const credentialDB: Record<string, CredentialRecord> = {};

export function storeCredential(record: CredentialRecord): void {
  credentialDB[record.id] = { ...record };
}

/**
 * Removes off-chain data for the given credential while retaining the hashed VC.
 * This simulates a right-to-be-forgotten API where personal fields are wiped
 * from the database but the credential hash remains for audit purposes.
 */
export function forgetOffchainData(id: string): CredentialRecord | undefined {
  const record = credentialDB[id];
  if (!record) {
    return undefined;
  }
  const sanitized: CredentialRecord = { id, hashedVC: record.hashedVC };
  credentialDB[id] = sanitized;
  return sanitized;
}
