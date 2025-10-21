/**
 * Unit tests for Pilot P0 API
 * Tests issue→verify→revoke flow using supertest
 */

import request from 'supertest';
import app from '../src/server';
import { credentialStore } from '../src/services/store';

describe('Pilot P0 API - Issue/Verify/Revoke Flow', () => {
  beforeEach(() => {
    // Clear store before each test
    credentialStore.clear();
  });

  describe('Issue → Verify → Revoke Flow', () => {
    it('should complete the full happy path flow', async () => {
      // Step 1: Issue a credential
      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            id: 'test-practitioner-123',
            name: 'Dr. Test Practitioner',
            licenseNumber: 'MD123456',
            licenseState: 'CA'
          },
          validity: {
            from: new Date().toISOString(),
            until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
          }
        })
        .expect(200);

      expect(issueResponse.body).toHaveProperty('credentialId');
      expect(issueResponse.body).toHaveProperty('jwt');
      expect(issueResponse.body).toHaveProperty('auditRef');
      expect(issueResponse.body.credentialId).toMatch(/^cred-/);

      const { credentialId, jwt } = issueResponse.body;

      // Step 2: Verify the credential (should be valid)
      const verifyResponse1 = await request(app)
        .post('/verifier/presentation')
        .send({ jwt })
        .expect(200);

      expect(verifyResponse1.body).toEqual({
        valid: true,
        reason: undefined,
        auditRef: expect.any(String),
        credentialId
      });

      // Step 3: Revoke the credential
      const revokeResponse = await request(app)
        .post('/issuer/revoke')
        .send({ credentialId })
        .expect(200);

      expect(revokeResponse.body).toEqual({
        ok: true,
        credentialId,
        auditRef: expect.any(String)
      });

      // Step 4: Verify the credential again (should be invalid/revoked)
      const verifyResponse2 = await request(app)
        .post('/verifier/presentation')
        .send({ jwt })
        .expect(200);

      expect(verifyResponse2.body).toEqual({
        valid: false,
        reason: 'revoked',
        auditRef: expect.any(String),
        credentialId
      });
    });

    it('should handle missing JWT in verification', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        valid: false,
        reason: 'missing_jwt'
      });
    });

    it('should handle invalid JWT format', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt: 'invalid.jwt.format.extra' })
        .expect(200);

      expect(response.body.valid).toBe(false);
      expect(response.body.reason).toBe('bad_signature');
      expect(response.body).toHaveProperty('auditRef');
    });

    it('should handle malformed JWT', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt: 'not-a-jwt-at-all' })
        .expect(200);

      expect(response.body.valid).toBe(false);
      expect(response.body.reason).toBe('bad_signature');
      expect(response.body).toHaveProperty('auditRef');
    });
  });

  describe('Credential Issuance', () => {
    it('should require subject.id', async () => {
      const response = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            name: 'Dr. Test'
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('subject.id');
    });

    it('should issue credential with minimal data', async () => {
      const response = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            id: 'minimal-test-123'
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('credentialId');
      expect(response.body).toHaveProperty('jwt');
      expect(response.body).toHaveProperty('auditRef');
    });
  });

  describe('Credential Revocation', () => {
    it('should require credentialId', async () => {
      const response = await request(app)
        .post('/issuer/revoke')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('credentialId');
    });

    it('should revoke non-existent credential without error', async () => {
      const response = await request(app)
        .post('/issuer/revoke')
        .send({ credentialId: 'non-existent-cred' })
        .expect(200);

      expect(response.body).toEqual({
        ok: true,
        credentialId: 'non-existent-cred',
        auditRef: expect.any(String)
      });
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        ok: true,
        service: 'backend',
        timestamp: expect.any(String)
      });
    });
  });

  describe('FHIR Practitioner', () => {
    it('should return FHIR Practitioner resource', async () => {
      // First issue a credential
      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            id: 'fhir-test-practitioner',
            name: 'Dr. FHIR Test',
            licenseNumber: 'FHIR123',
            licenseState: 'NY'
          }
        })
        .expect(200);

      // Then get the FHIR resource
      const fhirResponse = await request(app)
        .get('/fhir/Practitioner/fhir-test-practitioner')
        .expect(200);

      expect(fhirResponse.body).toMatchObject({
        resourceType: 'Practitioner',
        id: 'fhir-test-practitioner',
        active: true,
        qualification: expect.arrayContaining([
          expect.objectContaining({
            identifier: expect.arrayContaining([
              expect.objectContaining({
                value: issueResponse.body.credentialId
              })
            ])
          })
        ])
      });
    });

    it('should return inactive practitioner with no credentials', async () => {
      const response = await request(app)
        .get('/fhir/Practitioner/no-credentials-practitioner')
        .expect(200);

      expect(response.body).toMatchObject({
        resourceType: 'Practitioner',
        id: 'no-credentials-practitioner',
        active: false,
        qualification: []
      });
    });
  });
});