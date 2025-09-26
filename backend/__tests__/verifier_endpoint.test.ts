import { createBlockchainIntegrationMock, type BlockchainIntegrationMock } from './helpers/blockchainIntegrationMock';
import request from 'supertest';
import express from 'express';
import { router as verifierRouter } from '../src/routes/verifier_routes';

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
app.use('/api', verifierRouter);

describe('verifier credential status endpoint', () => {
  beforeEach(() => {
    getBlockchainIntegrationMock().reset();
  });

  it('returns a credential status', async () => {
    const res = await request(app).get('/api/verifier/credential/123/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ credentialId: '123', status: 'valid' });
    expect(getBlockchainIntegrationMock().checkCredentialStatus).toHaveBeenCalledWith('123');
  });

  it('supports overriding default status', async () => {
    const blockchainIntegrationMock = getBlockchainIntegrationMock();
    blockchainIntegrationMock.setDefaultStatus('revoked');

    const res = await request(app).get('/api/verifier/credential/456/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ credentialId: '456', status: 'revoked' });
  });
});
