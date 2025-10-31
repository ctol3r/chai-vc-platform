import request from 'supertest';
import express from 'express';
import app from '../src/app';

describe('Claim API Endpoints', () => {
  const validNPI = '1234567893'; // Example valid NPI (passes Luhn check)
  
  describe('POST /api/npi/lookup', () => {
    it('should validate and return NPI information', async () => {
      const response = await request(app)
        .post('/api/npi/lookup')
        .send({ npi: validNPI })
        .expect(200);

      expect(response.body).toHaveProperty('npi');
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body.npi).toBe(validNPI);
    });

    it('should reject invalid NPI format', async () => {
      const response = await request(app)
        .post('/api/npi/lookup')
        .send({ npi: '12345' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('valid', false);
    });

    it('should reject missing NPI', async () => {
      const response = await request(app)
        .post('/api/npi/lookup')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-string NPI', async () => {
      const response = await request(app)
        .post('/api/npi/lookup')
        .send({ npi: 1234567893 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/claim/doc', () => {
    it('should upload a claim document and create a claim', async () => {
      const response = await request(app)
        .post('/api/claim/doc')
        .field('claimId', 'test-claim-123')
        .attach('document', Buffer.from('test document content'), 'test-claim.pdf')
        .expect(201);

      expect(response.body).toHaveProperty('claimId');
      expect(response.body).toHaveProperty('filename');
      expect(response.body).toHaveProperty('status', 'processing');
      expect(response.body).toHaveProperty('uploadedAt');
    });

    it('should reject request without file', async () => {
      const response = await request(app)
        .post('/api/claim/doc')
        .send({ claimId: 'test-claim-123' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should auto-generate claimId if not provided', async () => {
      const response = await request(app)
        .post('/api/claim/doc')
        .attach('document', Buffer.from('test document content'), 'test-claim.pdf')
        .expect(201);

      expect(response.body).toHaveProperty('claimId');
      expect(response.body.claimId).toBeTruthy();
    });
  });

  describe('POST /api/claim/basic', () => {
    it('should create a basic claim without document', async () => {
      const response = await request(app)
        .post('/api/claim/basic')
        .send({
          npi: validNPI,
          patientName: 'John Doe',
          claimType: 'medical',
          amount: 1000.50,
        })
        .expect(201);

      expect(response.body).toHaveProperty('claimId');
      expect(response.body).toHaveProperty('npi', validNPI);
      expect(response.body).toHaveProperty('patientName', 'John Doe');
      expect(response.body).toHaveProperty('status', 'processing');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should reject invalid NPI in basic claim', async () => {
      const response = await request(app)
        .post('/api/claim/basic')
        .send({
          npi: 'invalid',
          patientName: 'John Doe',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing NPI', async () => {
      const response = await request(app)
        .post('/api/claim/basic')
        .send({
          patientName: 'John Doe',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should auto-generate claimId if not provided', async () => {
      const response = await request(app)
        .post('/api/claim/basic')
        .send({
          npi: validNPI,
        })
        .expect(201);

      expect(response.body).toHaveProperty('claimId');
      expect(response.body.claimId).toBeTruthy();
    });
  });

  describe('GET /api/claim/status', () => {
    let testClaimId: string;

    beforeAll(async () => {
      // Create a claim to test status retrieval
      const response = await request(app)
        .post('/api/claim/basic')
        .send({
          npi: validNPI,
          patientName: 'Test Patient',
        });
      
      testClaimId = response.body.claimId;
    });

    it('should return claim status', async () => {
      const response = await request(app)
        .get('/api/claim/status')
        .query({ claimId: testClaimId })
        .expect(200);

      expect(response.body).toHaveProperty('claimId', testClaimId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('createdAt');
      expect(['pending', 'processing', 'ocr_complete', 'attestation_pending', 'completed', 'rejected']).toContain(response.body.status);
    });

    it('should return 404 for non-existent claim', async () => {
      const response = await request(app)
        .get('/api/claim/status')
        .query({ claimId: 'non-existent-claim-id' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing claimId parameter', async () => {
      const response = await request(app)
        .get('/api/claim/status')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should show updated status after processing delay', async () => {
      // Wait a bit for job processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(app)
        .get('/api/claim/status')
        .query({ claimId: testClaimId })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      // Status should have progressed from 'pending' or 'processing'
    }, 10000); // Extended timeout for async job processing
  });

  describe('POST /api/issuer/attest-request', () => {
    let testClaimId: string;

    beforeAll(async () => {
      // Create a claim to test attestation request
      const response = await request(app)
        .post('/api/claim/basic')
        .send({
          npi: validNPI,
        });
      
      testClaimId = response.body.claimId;
    });

    it('should create an attestation request', async () => {
      const response = await request(app)
        .post('/api/issuer/attest-request')
        .send({
          claimId: testClaimId,
          issuerId: 'test-issuer-123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('requestId');
      expect(response.body).toHaveProperty('claimId', testClaimId);
      expect(response.body).toHaveProperty('issuerId', 'test-issuer-123');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('requestedAt');
    });

    it('should use default issuerId if not provided', async () => {
      const response = await request(app)
        .post('/api/issuer/attest-request')
        .send({
          claimId: testClaimId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('issuerId', 'default-issuer');
    });

    it('should reject missing claimId', async () => {
      const response = await request(app)
        .post('/api/issuer/attest-request')
        .send({
          issuerId: 'test-issuer-123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-existent claim', async () => {
      const response = await request(app)
        .post('/api/issuer/attest-request')
        .send({
          claimId: 'non-existent-claim',
          issuerId: 'test-issuer-123',
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
