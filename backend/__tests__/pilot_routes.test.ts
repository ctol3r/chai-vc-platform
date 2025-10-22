import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pilotRoutes } from '../src/pilot/routes';

// Create test app without listening
const app = express();
app.use(express.json());
app.use(pilotRoutes());

describe('Pilot Routes', () => {
  beforeEach(() => {
    // Clear store before each test
    // Note: In a real implementation, you'd want to reset the Map
    // For now, we'll work with the existing state
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toEqual({
        ok: true,
        service: 'backend',
      });
    });
  });

  describe('POST /issuer/credential', () => {
    it('should issue a credential successfully', async () => {
      const credentialData = {
        subject: {
          id: 'did:example:test123',
          name: 'Dr. Test',
          licenseNumber: 'MD-12345',
        },
      };

      const response = await request(app)
        .post('/issuer/credential')
        .send(credentialData)
        .expect(200);

      expect(response.body).toHaveProperty('credentialId');
      expect(response.body).toHaveProperty('jwt');
      expect(response.body).toHaveProperty('auditRef');
      expect(response.body.credentialId).toMatch(/^cred-\d+$/);
    });

    it('should handle missing subject gracefully', async () => {
      const response = await request(app).post('/issuer/credential').send({}).expect(200);

      expect(response.body).toHaveProperty('credentialId');
      expect(response.body).toHaveProperty('jwt');
    });
  });

  describe('POST /issuer/revoke', () => {
    it('should revoke a credential successfully', async () => {
      // First issue a credential
      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send({ subject: { id: 'did:example:test123' } });

      const credentialId = issueResponse.body.credentialId;

      // Then revoke it
      const response = await request(app).post('/issuer/revoke').send({ credentialId }).expect(200);

      expect(response.body).toEqual({
        ok: true,
        credentialId,
        auditRef: expect.any(String),
      });
    });

    it('should return 400 for missing credentialId', async () => {
      const response = await request(app).post('/issuer/revoke').send({}).expect(400);

      expect(response.body).toEqual({
        ok: false,
        error: 'missing_credentialId',
      });
    });
  });

  describe('POST /verifier/presentation', () => {
    let validJwt: string;
    let credentialId: string;

    beforeEach(async () => {
      // Issue a credential for testing
      const issueResponse = await request(app)
        .post('/issuer/credential')
        .send({ subject: { id: 'did:example:test123' } });

      validJwt = issueResponse.body.jwt;
      credentialId = issueResponse.body.credentialId;
    });

    it('should verify a valid credential', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt: validJwt })
        .expect(200);

      expect(response.body).toEqual({
        valid: true,
        auditRef: expect.any(String),
        credentialId,
      });
    });

    it('should return 400 for missing jwt', async () => {
      const response = await request(app).post('/verifier/presentation').send({}).expect(400);

      expect(response.body).toEqual({
        valid: false,
        reason: 'missing_jwt',
        auditRef: expect.any(String),
      });
    });

    it('should return unknown_credential for malformed JWT', async () => {
      const response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt: 'invalid.jwt.token' })
        .expect(200);

      expect(response.body).toEqual({
        valid: false,
        reason: 'unknown_credential',
        auditRef: expect.any(String),
      });
    });

    it('should return false for revoked credential', async () => {
      // First revoke the credential
      await request(app).post('/issuer/revoke').send({ credentialId });

      // Then try to verify it
      const response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt: validJwt })
        .expect(200);

      expect(response.body).toEqual({
        valid: false,
        reason: 'revoked',
        auditRef: expect.any(String),
        credentialId,
      });
    });

    it('should return false for non-existent credential', async () => {
      // Create a JWT for a non-existent credential
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          credentialId: 'cred-nonexistent',
          sub: 'did:example:test',
          iat: Date.now(),
        }),
      ).toString('base64url');
      const fakeJwt = `${header}.${payload}.`;

      const response = await request(app)
        .post('/verifier/presentation')
        .send({ jwt: fakeJwt })
        .expect(200);

      expect(response.body).toEqual({
        valid: false,
        reason: 'expired', // Non-existent credentials return EXPIRED status
        auditRef: expect.any(String),
        credentialId: 'cred-nonexistent',
      });
    });
  });

  describe('POST /lookup/npi/:npi', () => {
    it('should return 400 for invalid NPI format', async () => {
      const response = await request(app).post('/lookup/npi/123').expect(400);

      expect(response.body).toEqual({
        ok: false,
        error: 'invalid_npi_format',
        message: 'NPI must be exactly 10 digits',
      });
    });

    it('should handle NPI lookup timeout gracefully', async () => {
      // Mock fetch to simulate timeout
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('timeout')), 100);
          }),
      );

      const response = await request(app).post('/lookup/npi/1234567890').expect(500);

      expect(response.body).toHaveProperty('ok', false);
      expect(response.body).toHaveProperty('error');

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('GET /fhir/Practitioner/:id', () => {
    beforeEach(async () => {
      // Issue some credentials for a practitioner
      await request(app)
        .post('/issuer/credential')
        .send({ subject: { id: 'practitioner123' } });

      await request(app)
        .post('/issuer/credential')
        .send({ subject: { id: 'practitioner123' } });
    });

    it('should return FHIR Practitioner resource', async () => {
      const response = await request(app).get('/fhir/Practitioner/practitioner123').expect(200);

      expect(response.body).toEqual({
        resourceType: 'Practitioner',
        id: 'practitioner123',
        identifier: [
          {
            use: 'official',
            value: 'practitioner123',
          },
        ],
        qualification: expect.arrayContaining([
          expect.objectContaining({
            identifier: [
              {
                use: 'official',
                value: expect.stringMatching(/^cred-\d+$/),
              },
            ],
            code: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                  code: 'VC',
                  display: 'Verifiable Credential',
                },
              ],
            },
            status: 'active',
          }),
        ]),
      });
    });

    it('should return empty qualifications for non-existent practitioner', async () => {
      const response = await request(app).get('/fhir/Practitioner/nonexistent').expect(200);

      expect(response.body).toEqual({
        resourceType: 'Practitioner',
        id: 'nonexistent',
        identifier: [
          {
            use: 'official',
            value: 'nonexistent',
          },
        ],
        qualification: [],
      });
    });
  });
});
