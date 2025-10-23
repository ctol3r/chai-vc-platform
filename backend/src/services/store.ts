// store.ts - Service for managing credential records
// This file implements proper error handling for credential record operations

export interface CredentialRecord {
  id: string;
  jwt: string;
  subjectId: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// In-memory store for demonstration purposes
// In production, this would be replaced with a database
const credentialStore = new Map<string, CredentialRecord>();

/**
 * Sets the status of a credential record by ID.
 * Throws an error if the credential record is not found instead of creating incomplete objects.
 * 
 * @param id - The unique identifier of the credential record
 * @param status - The new status to set
 * @returns The updated credential record
 * @throws Error if the credential record is not found
 */
export function setStatus(id: string, status: string): CredentialRecord {
  const credential = credentialStore.get(id);
  
  if (!credential) {
    throw new Error(`Credential record with ID '${id}' not found`);
  }
  
  // Update the status and timestamp
  credential.status = status;
  credential.updatedAt = new Date();
  
  return credential;
}

/**
 * Creates a new credential record with all required fields.
 * 
 * @param id - The unique identifier for the credential record
 * @param jwt - The JWT token
 * @param subjectId - The subject ID
 * @param status - The initial status
 * @returns The created credential record
 */
export function createCredentialRecord(
  id: string, 
  jwt: string, 
  subjectId: string, 
  status: string = 'pending'
): CredentialRecord {
  const credential: CredentialRecord = {
    id,
    jwt,
    subjectId,
    status,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  credentialStore.set(id, credential);
  return credential;
}

/**
 * Retrieves a credential record by ID.
 * 
 * @param id - The unique identifier of the credential record
 * @returns The credential record or undefined if not found
 */
export function getCredentialRecord(id: string): CredentialRecord | undefined {
  return credentialStore.get(id);
}

/**
 * Lists all credential records.
 * 
 * @returns Array of all credential records
 */
export function getAllCredentialRecords(): CredentialRecord[] {
  return Array.from(credentialStore.values());
}

/**
 * Deletes a credential record by ID.
 * 
 * @param id - The unique identifier of the credential record
 * @returns True if the record was deleted, false if not found
 */
export function deleteCredentialRecord(id: string): boolean {
  return credentialStore.delete(id);
}