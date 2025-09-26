/**
 * Important: the mock must be declared BEFORE any module that imports
 * blockchain_integration so jest will replace the implementation.
 */
jest.mock('../src/blockchain/blockchain_integration', () => ({
  __esModule: true,
  checkCredentialStatus: jest.fn(async (_id: string) => 'valid'),
}));

import request from 'supertest';
import express from 'express';
import { getCredentialStatus } from '../src/controllers/verifier_controller';

// minimal app to exercise route
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

test('verifier credential status endpoint', async () => {
  const res = await request(app).get('/api/verifier/credential/123/status');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ credentialId: '123', status: 'valid' });
});
