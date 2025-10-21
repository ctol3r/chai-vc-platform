/**
 * Unit tests for Pilot P0 API
 * Tests issue → verify → revoke flow
 */

import request from 'supertest';
import app from '../src/server';
import { store } from '../src/services/store';
import { AuditScrapbook } from '../src/services/audit';

// Clear stores before each test
beforeEach(() => {
  store.clear();
  AuditScrapbook.clear();
});

describe('Pilot P0 API Tests', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toEqual({
        ok: true,
        service: 'backend'
      });
    });
  });

  describe('Issue → Verify → Revoke Flow', () => {
    let credentialId: string;
    let jwt: string;

    describe('Case A: Issue and verify active credential', () => {
      it('should issue a credential successfully', async () => {
        const response = await request(app)
          .post('/issuer/credential')
          .send({
            subject: {
              id: 'practitioner-123',
              name: 'Dr. Jane Smith',
              licenseNumber: 'MED123456',
              licenseState: 'CA'
            },
            validity: {
              from: new Date().toISOString(),
              until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            }
          })
          .expect(200);

        expect(response.body).toHaveProperty('credentialId');
        expect(response.body).toHaveProperty('jwt');
        expect(response.body).toHaveProperty('auditRef');
        expect(response.body.credentialId).toMatch(/^cred-/);
        
        // Store for next tests
        credentialId = response.body.credentialId;
        jwt = response.body.jwt;
      });

      it('should verify the issued credential as valid', async () => {
        // First issue a credential
        const issueResponse = await request(app)
          .post('/issuer/credential')
          .send({
            subject: {
              id: 'practitioner-456',
              name: 'Dr. John Doe'
            }
          });
        
        const { jwt } = issueResponse.body;

        // Now verify it
        const verifyResponse = await request(app)
          .post('/verifier/presentation')
          .send({ jwt })
          .expect(200);

        expect(verifyResponse.body).toMatchObject({
          valid: true,
          credentialId: issueResponse.body.credentialId,
        });
        expect(verifyResponse.body).toHaveProperty('auditRef');
        expect(verifyResponse.body.reason).toBeUndefined();
      });
    });

    describe('Case B: Revoke and verify shows revoked', () => {
      it('should revoke a credential and then verify as invalid', async () => {
        // Issue a credential first
        const issueResponse = await request(app)
          .post('/issuer/credential')
          .send({
            subject: {
              id: 'practitioner-789',
              name: 'Dr. Alice Johnson'
            }
          });
        
        const { credentialId, jwt } = issueResponse.body;

        // Revoke the credential
        const revokeResponse = await request(app)
          .post('/issuer/revoke')
          .send({ credentialId })
          .expect(200);

        expect(revokeResponse.body).toMatchObject({
          ok: true,
          credentialId
        });
        expect(revokeResponse.body).toHaveProperty('auditRef');

        // Now verify the revoked credential
        const verifyResponse = await request(app)
          .post('/verifier/presentation')
          .send({ jwt })
          .expect(200);

        expect(verifyResponse.body).toMatchObject({
          valid: false,
          reason: 'revoked',
          credentialId
        });
        expect(verifyResponse.body).toHaveProperty('auditRef');
      });
    });

    describe('Case C: Missing JWT returns 400', () => {
      it('should return 400 for missing JWT', async () => {
        const response = await request(app)
          .post('/verifier/presentation')
          .send({})
          .expect(400);

        expect(response.body).toMatchObject({
          valid: false,
          reason: 'missing_jwt'
        });
      });

      it('should return 400 for null JWT', async () => {
        const response = await request(app)
          .post('/verifier/presentation')
          .send({ jwt: null })
          .expect(400);

        expect(response.body).toMatchObject({
          valid: false,
          reason: 'missing_jwt'
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle invalid JWT format', async () => {
        const response = await request(app)
          .post('/verifier/presentation')
          .send({ jwt: 'invalid-jwt-format' })
          .expect(200);

        expect(response.body).toMatchObject({
          valid: false,
          reason: 'bad_signature'
        });
      });

      it('should handle missing subject.id in credential issuance', async () => {
        const response = await request(app)
          .post('/issuer/credential')
          .send({
            subject: {
              name: 'Dr. No ID'
            }
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Missing subject.id');
      });

      it('should handle missing credentialId in revocation', async () => {
        const response = await request(app)
          .post('/issuer/revoke')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Missing credentialId');
      });

      it('should handle unknown credential in verification', async () => {
        // Create a fake JWT with unknown credential ID
        const fakeJwt = Buffer.from(JSON.stringify({
          alg: 'HS256',
          typ: 'JWT'
        })).toString('base64url') + '.' +
        Buffer.from(JSON.stringify({
          credentialId: 'unknown-cred-999',
          sub: 'test'
        })).toString('base64url') + '.' +
        'fake-signature';

        const response = await request(app)
          .post('/verifier/presentation')
          .send({ jwt: fakeJwt })
          .expect(200);

        expect(response.body.valid).toBe(false);
      });
    });
  });

  describe('FHIR Practitioner Endpoint', () => {
    it('should return FHIR Practitioner with qualifications', async () => {
      // Issue a credential first
      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send({
          subject: {
            id: 'practitioner-fhir-test',
            name: 'Dr. FHIR Test'
          }
        });

      // Get FHIR Practitioner
      const fhirResponse = await request(app)
        .get('/fhir/Practitioner/practitioner-fhir-test')
        .expect(200);

      expect(fhirResponse.body).toMatchObject({
        resourceType: 'Practitioner',
        id: 'practitioner-fhir-test',
        active: true
      });
      expect(fhirResponse.body.qualification).toHaveLength(1);
      expect(fhirResponse.body.qualification[0]).toHaveProperty('identifier');
    });

    it('should return empty qualifications for unknown practitioner', async () => {
      const response = await request(app)
        .get('/fhir/Practitioner/unknown-practitioner')
        .expect(200);

      expect(response.body).toMatchObject({
        resourceType: 'Practitioner',
        id: 'unknown-practitioner',
        active: false,
        qualification: []
      });
    });
  });

  describe('NPI Lookup', () => {
    it('should validate NPI format', async () => {
      const response = await request(app)
        .post('/lookup/npi/123') // Invalid - not 10 digits
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid NPI format');
    });

    it('should accept valid 10-digit NPI', async () => {
      // This will actually try to fetch from NPPES (or timeout)
      // For unit tests, we're just checking the format validation
      const response = await request(app)
        .post('/lookup/npi/1234567890')
        .timeout(6000); // Allow for timeout

      // Either gets data or timeouts - both are valid for the test
      expect(response.status).toBeLessThanOrEqual(200);
    });
  });
});