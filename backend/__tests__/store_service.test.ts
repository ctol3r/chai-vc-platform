// store_service.test.ts - Tests for the store service
import { 
  setStatus, 
  createCredentialRecord, 
  getCredentialRecord, 
  getAllCredentialRecords,
  deleteCredentialRecord,
  CredentialRecord 
} from '../src/services/store';

describe('Store Service', () => {
  beforeEach(() => {
    // Clear the store before each test
    const allRecords = getAllCredentialRecords();
    allRecords.forEach(record => deleteCredentialRecord(record.id));
  });

  describe('setStatus', () => {
    it('should update the status of an existing credential record', async () => {
      // Create a test credential record
      const credential = createCredentialRecord('test-id', 'jwt-token', 'subject-123', 'pending');
      
      // Add a small delay to ensure timestamps are different
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Update the status
      const updatedCredential = setStatus('test-id', 'verified');
      
      // Verify the status was updated
      expect(updatedCredential.status).toBe('verified');
      expect(updatedCredential.updatedAt).toBeDefined();
      expect(updatedCredential.updatedAt).not.toEqual(credential.createdAt);
    });

    it('should throw an error when trying to update a non-existent credential record', () => {
      // Attempt to update a non-existent credential
      expect(() => {
        setStatus('non-existent-id', 'verified');
      }).toThrow("Credential record with ID 'non-existent-id' not found");
    });

    it('should not create incomplete CredentialRecord objects when ID is not found', () => {
      // Verify that no incomplete records are created
      const initialCount = getAllCredentialRecords().length;
      
      expect(() => {
        setStatus('non-existent-id', 'verified');
      }).toThrow();
      
      // Verify no new records were created
      expect(getAllCredentialRecords().length).toBe(initialCount);
    });
  });

  describe('createCredentialRecord', () => {
    it('should create a complete credential record with all required fields', () => {
      const credential = createCredentialRecord('test-id', 'jwt-token', 'subject-123', 'pending');
      
      expect(credential.id).toBe('test-id');
      expect(credential.jwt).toBe('jwt-token');
      expect(credential.subjectId).toBe('subject-123');
      expect(credential.status).toBe('pending');
      expect(credential.createdAt).toBeDefined();
      expect(credential.updatedAt).toBeDefined();
    });

    it('should use default status when not provided', () => {
      const credential = createCredentialRecord('test-id', 'jwt-token', 'subject-123');
      
      expect(credential.status).toBe('pending');
    });
  });

  describe('getCredentialRecord', () => {
    it('should return the credential record when it exists', () => {
      const credential = createCredentialRecord('test-id', 'jwt-token', 'subject-123');
      
      const retrieved = getCredentialRecord('test-id');
      expect(retrieved).toEqual(credential);
    });

    it('should return undefined when credential record does not exist', () => {
      const retrieved = getCredentialRecord('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllCredentialRecords', () => {
    it('should return all credential records', () => {
      const credential1 = createCredentialRecord('id1', 'jwt1', 'subject1');
      const credential2 = createCredentialRecord('id2', 'jwt2', 'subject2');
      
      const allRecords = getAllCredentialRecords();
      expect(allRecords).toHaveLength(2);
      expect(allRecords).toContain(credential1);
      expect(allRecords).toContain(credential2);
    });

    it('should return empty array when no records exist', () => {
      const allRecords = getAllCredentialRecords();
      expect(allRecords).toHaveLength(0);
    });
  });

  describe('deleteCredentialRecord', () => {
    it('should delete an existing credential record', () => {
      createCredentialRecord('test-id', 'jwt-token', 'subject-123');
      
      const deleted = deleteCredentialRecord('test-id');
      expect(deleted).toBe(true);
      expect(getCredentialRecord('test-id')).toBeUndefined();
    });

    it('should return false when trying to delete non-existent record', () => {
      const deleted = deleteCredentialRecord('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('CredentialRecord interface compliance', () => {
    it('should ensure all created records comply with the CredentialRecord interface', () => {
      const credential = createCredentialRecord('test-id', 'jwt-token', 'subject-123', 'verified');
      
      // Verify all required properties exist and are not empty strings
      expect(credential.id).toBeTruthy();
      expect(credential.jwt).toBeTruthy();
      expect(credential.subjectId).toBeTruthy();
      expect(credential.status).toBeTruthy();
      
      // Verify types
      expect(typeof credential.id).toBe('string');
      expect(typeof credential.jwt).toBe('string');
      expect(typeof credential.subjectId).toBe('string');
      expect(typeof credential.status).toBe('string');
    });
  });
});