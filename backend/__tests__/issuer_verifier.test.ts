/**
 * Unit tests for issuer/verifier flow
 * Tests the complete issue -> verify -> revoke -> verify cycle
 */

import request from 'supertest';
import app from '../src/server';
import store from '../src/services/store';

describe('Issuer/Verifier Flow', () => {
  beforeEach(() => {
    // Clear store before each test
    store.clear();
  });

  describe('POST /issuer/credential', () => {
    it('should issue a credential successfully', async () => {
      const credentialData = {
        subject: {
          id: 'test-subject-123',
          name: 'Dr. Test User',
          licenseNumber: 'MD123456',
          licenseState: 'CA'
        },
        validity: {
          from: '2024-01-01T00:00:00Z',
          until: '2025-01-01T00:00:00Z'
        }
      };

      const response = await request(app)
        .post('/issuer/credential')
        .send(credentialData)
        .expect(200);

      expect(response.body).toHaveProperty('credentialId');
      expect(response.body).toHaveProperty('jwt');
      expect(response.body).toHaveProperty('auditRef');
      expect(response.body.credentialId).toMatch(/^cred-/);
    });

    it('should reject request with missing subject ID', async () => {
      const credentialData = {
        subject: {
          name: 'Dr. Test User'
        }
      };

      const response = await request(app)
        .post('/issuer/credential')
        .send(credentialData)
        .expect(400);

      expect(response.body).toEqual({
        valid: false,
        reason: 'missing_subject_id'
      });
    });
  });

  describe('POST /verifier/presentation', () => {
    it('should verify a valid credential', async () => {
      // First issue a credential
      const credentialData = {
        subject: {
          id: 'test-subject-456',
          name: 'Dr. Valid User'
        }
      };

      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send(credentialData)
        .expect(200);

      const { jwt } = issueResponse.body;

      // Then verify it
      const verifyResponse = await request(app)
        .post('/verifier/presentation')
        .send({ jwt })
        .expect(200);

      expect(verifyResponse.body).toEqual({
        valid: true,
        auditRef: expect.any(String),
        credentialId: expect.any(String)
      });
    });

    it('should reject missing JWT', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        valid: false,
        reason: 'missing_jwt'
      });
    });

    it('should reject invalid JWT', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt: 'invalid.jwt.token' })
        .expect(400);

      expect(response.body).toEqual({
        valid: false,
        reason: 'bad_signature'
      });
    });
  });

  describe('POST /issuer/revoke', () => {
    it('should revoke a credential successfully', async () => {
      // First issue a credential
      const credentialData = {
        subject: {
          id: 'test-subject-789',
          name: 'Dr. Revokable User'
        }
      };

      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send(credentialData)
        .expect(200);

      const { credentialId } = issueResponse.body;

      // Then revoke it
      const revokeResponse = await request(app)
        .post('/issuer/revoke')
        .send({ credentialId })
        .expect(200);

      expect(revokeResponse.body).toEqual({
        ok: true,
        credentialId,
        auditRef: expect.any(String)
      });
    });

    it('should reject missing credential ID', async () => {
      const response = await request(app)
        .post('/issuer/revoke')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        valid: false,
        reason: 'missing_credential_id'
      });
    });

    it('should reject non-existent credential', async () => {
      const response = await request(app)
        .post('/issuer/revoke')
        .send({ credentialId: 'non-existent-cred' })
        .expect(404);

      expect(response.body).toEqual({
        valid: false,
        reason: 'credential_not_found'
      });
    });
  });

  describe('Complete Flow: Issue -> Verify -> Revoke -> Verify', () => {
    it('should complete the full cycle successfully', async () => {
      // Step 1: Issue credential
      const credentialData = {
        subject: {
          id: 'test-subject-complete',
          name: 'Dr. Complete Test'
        }
      };

      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send(credentialData)
        .expect(200);

      const { credentialId, jwt } = issueResponse.body;

      // Step 2: Verify credential (should be valid)
      const verifyResponse1 = await request(app)
        .post('/verifier/presentation')
        .send({ jwt })
        .expect(200);

      expect(verifyResponse1.body.valid).toBe(true);

      // Step 3: Revoke credential
      const revokeResponse = await request(app)
        .post('/issuer/revoke')
        .send({ credentialId })
        .expect(200);

      expect(revokeResponse.body.ok).toBe(true);

      // Step 4: Verify credential again (should be invalid)
      const verifyResponse2 = await request(app)
        .post('/verifier/presentation')
        .send({ jwt })
        .expect(200);

      expect(verifyResponse2.body.valid).toBe(false);
      expect(verifyResponse2.body.reason).toBe('revoked');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        ok: true,
        service: 'backend'
      });
    });
  });
});