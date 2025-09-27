import express from 'express';
import request from 'supertest';
import { router as verifierRouter } from '../src/routes/verifier_routes';

type GlobalMocks = typeof globalThis & {
  __blockchainIntegrationMock__?: {
    setStatusForCredential: (id: string, status: 'valid' | 'revoked' | 'unknown') => void;
  };
  __privacyClientMock__?: {
    verifyProof: jest.Mock;
  };
};

const getBlockchainIntegrationMock = () => {
  const globalWithMock = globalThis as GlobalMocks;
  const mock = globalWithMock.__blockchainIntegrationMock__;
  if (!mock) {
    throw new Error('blockchain integration mock not initialised');
  }
  return mock;
};

const getPrivacyClientMock = () => {
  const globalWithMock = globalThis as GlobalMocks;
  const mock = globalWithMock.__privacyClientMock__;
  if (!mock) {
    throw new Error('privacy client mock not initialised');
  }
  return mock;
};

const app = express();
app.use(express.json());
app.use('/api', verifierRouter);

describe('verifier credential status endpoint', () => {
  it('returns a credential status via fallback blockchain integration', async () => {
    const res = await request(app).get('/api/verifier/credential/123/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ credentialId: '123', status: 'valid' });
  });

  it('allows overriding default status in fallback mode', async () => {
    getBlockchainIntegrationMock().setStatusForCredential('credential-789', 'unknown');
    const res = await request(app).get('/api/verifier/credential/credential-789/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ credentialId: 'credential-789', status: 'unknown' });
  });

  it('verifies proof payload by calling privacy service', async () => {
    const credential = { credentialId: 'cred-1', signature: 'sig', claims: { role: 'nurse' } };
    const proof = { proofId: 'proof-1', disclosureType: 'full' };

    getPrivacyClientMock().verifyProof.mockResolvedValue({
      valid: true,
      checkedAt: '2025-02-01T00:00:00.000Z',
      details: { disclosureType: 'full' },
    });

    const res = await request(app)
      .post('/api/verifier/credential/cred-1/status')
      .send({ credential, proof });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      credentialId: 'cred-1',
      status: 'valid',
      details: { disclosureType: 'full' },
    });
  });

  it('returns unknown status when privacy service reports invalid proof', async () => {
    const credential = { credentialId: 'cred-2', signature: 'sig', claims: {} };
    const proof = { proofId: 'proof-2', disclosureType: 'selective' };

    getPrivacyClientMock().verifyProof.mockResolvedValue({
      valid: false,
      checkedAt: '2025-02-01T01:00:00.000Z',
      reason: 'invalid-proof',
      details: { disclosureType: 'selective' },
    });

    const res = await request(app)
      .post('/api/verifier/credential/cred-2/status')
      .send({ credential, proof });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      credentialId: 'cred-2',
      status: 'unknown',
      details: {
        reason: 'invalid-proof',
        disclosureType: 'selective',
      },
    });
  });

  it('handles privacy service errors gracefully', async () => {
    const credential = { credentialId: 'cred-3', signature: 'sig', claims: {} };
    const proof = { proofId: 'proof-3', disclosureType: 'full' };

    getPrivacyClientMock().verifyProof.mockRejectedValue(new Error('privacy-service-timeout'));

    const res = await request(app)
      .post('/api/verifier/credential/cred-3/status')
      .send({ credential, proof });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      credentialId: 'cred-3',
      status: 'unknown',
      details: { error: 'privacy-service-timeout' },
    });
  });
});
