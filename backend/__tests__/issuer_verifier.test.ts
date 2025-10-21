/**
 * Pilot P0 Integration Tests
 * Tests for issue -> verify -> revoke flow
 */

import request from 'supertest';
import app from '../src/server';
import { credentialStore } from '../src/services/store';

describe('Pilot P0: Issue/Verify/Revoke Flow', () => {
  beforeEach(() => {
    // Clear store before each test
    credentialStore.clear();
  });

  describe('POST /issuer/credential', () => {
    it('should issue a new credential', async () => {
      const response = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            id: 'practitioner-123',
            name: 'Dr. Jane Smith',
            licenseNumber: 'MD12345',
            licenseState: 'CA',
          },
          validity: {
            from: new Date().toISOString(),
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('credentialId');
      expect(response.body).toHaveProperty('jwt');
      expect(response.body).toHaveProperty('auditRef');
      expect(response.body.credentialId).toMatch(/^cred-/);
      expect(response.body.auditRef).toMatch(/^issue-/);
    });

    it('should reject request without subject', async () => {
      const response = await request(app)
        .post('/issuer/credential')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'missing_subject');
    });
  });

  describe('POST /verifier/presentation', () => {
    it('should verify a valid credential (Case A)', async () => {
      // First issue a credential
      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            id: 'practitioner-456',
            name: 'Dr. John Doe',
            licenseNumber: 'MD67890',
            licenseState: 'NY',
          },
        });

      expect(issueResponse.status).toBe(200);
      const { jwt, credentialId } = issueResponse.body;

      // Now verify it
      const verifyResponse = await request(app)
        .post('/verifier/presentation')
        .send({ jwt });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body).toMatchObject({
        valid: true,
        credentialId,
      });
      expect(verifyResponse.body).toHaveProperty('auditRef');
      expect(verifyResponse.body.reason).toBeUndefined();
    });

    it('should reject missing JWT (Case C)', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        valid: false,
        reason: 'missing_jwt',
      });
    });

    it('should reject malformed JWT', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt: 'invalid.jwt.token' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        valid: false,
        reason: 'bad_signature',
      });
    });
  });

  describe('POST /issuer/revoke', () => {
    it('should revoke a credential', async () => {
      // First issue a credential
      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            id: 'practitioner-789',
            name: 'Dr. Alice Brown',
          },
        });

      const { credentialId } = issueResponse.body;

      // Now revoke it
      const revokeResponse = await request(app)
        .post('/issuer/revoke')
        .send({ credentialId });

      expect(revokeResponse.status).toBe(200);
      expect(revokeResponse.body).toMatchObject({
        ok: true,
        credentialId,
      });
      expect(revokeResponse.body).toHaveProperty('auditRef');
      expect(revokeResponse.body.auditRef).toMatch(/^revoke-/);
    });

    it('should reject request without credentialId', async () => {
      const response = await request(app)
        .post('/issuer/revoke')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'missing_credential_id');
    });
  });

  describe('Issue -> Verify -> Revoke -> Verify Flow (Case B)', () => {
    it('should show valid=true then valid=false after revocation', async () => {
      // Step 1: Issue credential
      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            id: 'practitioner-999',
            name: 'Dr. Bob Johnson',
          },
        });

      expect(issueResponse.status).toBe(200);
      const { jwt, credentialId } = issueResponse.body;

      // Step 2: Verify (should be valid)
      const verify1Response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt });

      expect(verify1Response.status).toBe(200);
      expect(verify1Response.body).toMatchObject({
        valid: true,
        credentialId,
      });

      // Step 3: Revoke
      const revokeResponse = await request(app)
        .post('/issuer/revoke')
        .send({ credentialId });

      expect(revokeResponse.status).toBe(200);
      expect(revokeResponse.body).toMatchObject({
        ok: true,
        credentialId,
      });

      // Step 4: Verify again (should be invalid)
      const verify2Response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt });

      expect(verify2Response.status).toBe(200);
      expect(verify2Response.body).toMatchObject({
        valid: false,
        reason: 'revoked',
        credentialId,
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        service: 'vitalcv-backend',
      });
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
