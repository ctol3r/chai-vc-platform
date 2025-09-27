import request from 'supertest';
import app from '../src/app';

describe('MVP Endpoints @smoke-e2e', () => {
  describe('Verifier Presentation', () => {
    it('should accept valid presentation request', async () => {
      const response = await request(app)
        .post('/api/verifier/presentation')
        .send({
          credentialId: 'cred_test_123',
          vpToken: 'valid_vp_token',
          nonce: 'unique_nonce_12345678',
          audience: 'chai-vc-platform'
        })
        .expect(200);

      expect(response.body).toHaveProperty('credentialId', 'cred_test_123');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('details');
    });

    it('should reject invalid presentation request', async () => {
      const response = await request(app)
        .post('/api/verifier/presentation')
        .send({
          credentialId: 'cred_test_123',
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid request format');
    });

    it('should detect replay attacks', async () => {
      const nonce = 'replay_nonce_12345678';

      // First request should succeed
      await request(app)
        .post('/api/verifier/presentation')
        .send({
          credentialId: 'cred_test_123',
          vpToken: 'valid_vp_token',
          nonce,
          audience: 'chai-vc-platform'
        })
        .expect(200);

      // Second request with same nonce should fail
      const response = await request(app)
        .post('/api/verifier/presentation')
        .send({
          credentialId: 'cred_test_123',
          vpToken: 'valid_vp_token',
          nonce, // Same nonce
          audience: 'chai-vc-platform'
        })
        .expect(200);

      expect(response.body.details).toHaveProperty('error', 'Nonce already used (replay attack)');
    });
  });

  describe('Issuer Credential', () => {
    it('should issue credential with valid request', async () => {
      const response = await request(app)
        .post('/api/issuer/credential')
        .send({
          subjectId: 'did:example:doctor123',
          type: 'MedicalLicense'
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('vc');
      expect(response.body.id).toMatch(/^cred_/);
      expect(typeof response.body.vc).toBe('string');
    });

    it('should reject invalid credential request', async () => {
      const response = await request(app)
        .post('/api/issuer/credential')
        .send({
          // Missing required fields
          type: 'MedicalLicense'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid request format');
    });
  });

  describe('Status Endpoints', () => {
    it('should return active status for valid credential', async () => {
      const response = await request(app)
        .get('/api/status/cred_test_123')
        .expect(200);

      expect(response.body).toHaveProperty('credentialId', 'cred_test_123');
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('issuedAt');
      expect(response.body).toHaveProperty('expiresAt');
    });

    it('should return expired status for expired credential', async () => {
      const response = await request(app)
        .get('/api/status/cred_expired_456')
        .expect(200);

      expect(response.body).toHaveProperty('credentialId', 'cred_expired_456');
      expect(response.body).toHaveProperty('status', 'expired');
    });

    it('should return unknown status for non-existent credential', async () => {
      const response = await request(app)
        .get('/api/status/cred_nonexistent')
        .expect(200);

      expect(response.body).toHaveProperty('credentialId', 'cred_nonexistent');
      expect(response.body).toHaveProperty('status', 'unknown');
    });

    it('should revoke credential successfully', async () => {
      const response = await request(app)
        .post('/api/status/revoke')
        .send({
          credentialId: 'cred_test_123',
          reason: 'Test revocation'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('credentialId', 'cred_test_123');
      expect(response.body).toHaveProperty('revokedAt');

      // Verify credential is now revoked
      const statusResponse = await request(app)
        .get('/api/status/cred_test_123')
        .expect(200);

      expect(statusResponse.body).toHaveProperty('status', 'revoked');
    });
  });

  describe('Health Endpoints', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'chai-vc-backend');
    });

    it('should return ready status', async () => {
      const response = await request(app)
        .get('/readyz')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database', 'connected');
    });
  });

  describe('Metrics Endpoint', () => {
    it('should return metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.text).toContain('TYPE');
      expect(response.headers['content-type']).toMatch(/text\/plain/);
    });
  });
});