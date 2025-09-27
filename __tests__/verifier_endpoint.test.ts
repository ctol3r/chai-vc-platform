import { createBlockchainIntegrationMock, type BlockchainIntegrationMock } from '../../test/helpers/blockchainIntegrationMock';
import request from 'supertest';
import express from 'express';
import { getCredentialStatus } from '../src/controllers/verifier_controller';

type GlobalWithBlockchainMock = typeof globalThis & {
  __blockchainIntegrationMock__?: BlockchainIntegrationMock;
};

function registerBlockchainIntegrationMock() {
  const mock = createBlockchainIntegrationMock();
  (globalThis as GlobalWithBlockchainMock).__blockchainIntegrationMock__ = mock;
  return mock.factory();
}

jest.mock('../src/blockchain/blockchain_integration', registerBlockchainIntegrationMock);

const getBlockchainIntegrationMock = (): BlockchainIntegrationMock => {
  const globalWithMock = globalThis as GlobalWithBlockchainMock;
  const mock = globalWithMock.__blockchainIntegrationMock__;
  if (!mock) {
    throw new Error('blockchain integration mock was not initialised');
  }
  return mock;
};

const app = express();
app.get('/api/verifier/credential/:credentialId/status', async (req, res) => {
  try {
    const status = await getCredentialStatus(req.params.credentialId);
    res.json({ credentialId: req.params.credentialId, status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Unable to fetch credential status' });
  }
});

describe('verifier credential status endpoint (legacy app wiring)', () => {
  beforeEach(() => {
    getBlockchainIntegrationMock().reset();
  });

  it('returns a credential status', async () => {
    const res = await request(app).get('/api/verifier/credential/123/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ credentialId: '123', status: 'valid' });
  });

  it('allows per-credential overrides', async () => {
    getBlockchainIntegrationMock().setStatusForCredential('credential-789', 'unknown');

    const res = await request(app).get('/api/verifier/credential/credential-789/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ credentialId: 'credential-789', status: 'unknown' });
  });
});
