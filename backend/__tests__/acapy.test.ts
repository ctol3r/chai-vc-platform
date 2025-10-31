import { ACAPayStub } from '../src/lib/acapy';

describe('ACA-Py Client', () => {
  let client: ACAPayStub;

  beforeEach(() => {
    client = new ACAPayStub();
  });

  describe('getStatus', () => {
    it('should return agent status', async () => {
      const status = await client.getStatus();
      
      expect(status).toBeDefined();
      expect(status.version).toContain('stub');
      expect(status.label).toBe('VitalCV ACA-Py Stub');
    });
  });

  describe('issueCredential', () => {
    it('should issue a credential and return exchange record', async () => {
      const request = {
        connectionId: 'test-connection-123',
        credDefId: 'test-cred-def-456',
        attributes: [
          { name: 'name', value: 'Dr. Jane Smith' },
          { name: 'npi', value: '1234567893' },
        ],
        comment: 'Test credential',
      };

      const result = await client.issueCredential(request);

      expect(result).toBeDefined();
      expect(result.credentialExchangeId).toBeTruthy();
      expect(result.state).toBe('credential-issued');
      expect(result.connectionId).toBe(request.connectionId);
      expect(result.credDefId).toBe(request.credDefId);
      expect(result.threadId).toBeTruthy();
    });

    it('should transition credential state to done after delay', async (done) => {
      const request = {
        connectionId: 'test-connection-123',
        credDefId: 'test-cred-def-456',
        attributes: [{ name: 'test', value: 'value' }],
      };

      const result = await client.issueCredential(request);
      const credExId = result.credentialExchangeId;

      // Wait for state transition
      setTimeout(async () => {
        const updated = await client.getCredentialExchange(credExId);
        expect(updated.state).toBe('done');
        done();
      }, 2500);
    }, 5000);
  });

  describe('getCredentialExchange', () => {
    it('should retrieve a credential exchange record', async () => {
      const request = {
        connectionId: 'test-connection-123',
        credDefId: 'test-cred-def-456',
        attributes: [{ name: 'test', value: 'value' }],
      };

      const issued = await client.issueCredential(request);
      const retrieved = await client.getCredentialExchange(issued.credentialExchangeId);

      expect(retrieved.credentialExchangeId).toBe(issued.credentialExchangeId);
      expect(retrieved.connectionId).toBe(request.connectionId);
    });

    it('should throw error for non-existent credential exchange', async () => {
      await expect(
        client.getCredentialExchange('non-existent-id')
      ).rejects.toThrow('not found');
    });
  });

  describe('createInvitation', () => {
    it('should create a connection invitation', async () => {
      const invitation = await client.createInvitation('Test Holder');

      expect(invitation).toBeDefined();
      expect(invitation.connection_id).toBeTruthy();
      expect(invitation.invitation).toBeDefined();
      expect(invitation.invitation['@type']).toContain('invitation');
      expect(invitation.invitation_url).toBeTruthy();
    });

    it('should create invitation without alias', async () => {
      const invitation = await client.createInvitation();

      expect(invitation).toBeDefined();
      expect(invitation.connection_id).toBeTruthy();
    });
  });

  describe('getConnection', () => {
    it('should retrieve connection details', async () => {
      const connectionId = 'test-connection-123';
      const connection = await client.getConnection(connectionId);

      expect(connection).toBeDefined();
      expect(connection.connection_id).toBe(connectionId);
      expect(connection.state).toBe('active');
    });
  });

  describe('listCredentialDefinitions', () => {
    it('should list available credential definitions', async () => {
      const credDefs = await client.listCredentialDefinitions();

      expect(credDefs).toBeDefined();
      expect(Array.isArray(credDefs)).toBe(true);
      expect(credDefs.length).toBeGreaterThan(0);
      expect(credDefs[0]).toHaveProperty('credDefId');
      expect(credDefs[0]).toHaveProperty('schemaId');
      expect(credDefs[0]).toHaveProperty('tag');
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete full issuance workflow', async () => {
      // 1. Create connection invitation
      const invitation = await client.createInvitation('Provider Wallet');
      expect(invitation.connection_id).toBeTruthy();

      // 2. Get connection status
      const connection = await client.getConnection(invitation.connection_id);
      expect(connection.state).toBe('active');

      // 3. List credential definitions
      const credDefs = await client.listCredentialDefinitions();
      expect(credDefs.length).toBeGreaterThan(0);

      // 4. Issue credential
      const result = await client.issueCredential({
        connectionId: invitation.connection_id,
        credDefId: credDefs[0].credDefId,
        attributes: [
          { name: 'name', value: 'Dr. Jane Smith' },
          { name: 'license_number', value: 'CA-MD-12345' },
          { name: 'npi', value: '1234567893' },
        ],
      });

      expect(result.credentialExchangeId).toBeTruthy();
      expect(result.state).toBe('credential-issued');

      // 5. Check credential exchange status
      const exchange = await client.getCredentialExchange(
        result.credentialExchangeId
      );
      expect(exchange.credentialExchangeId).toBe(result.credentialExchangeId);
    });
  });
});
