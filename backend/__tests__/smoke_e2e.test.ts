/**
 * @smoke-e2e
 * Seeds minimal data and hits verifier routes in-process.
 */
import request from 'supertest';
// IMPORTANT: import the express app without starting a listener
import app from '../src/app'; // adjust if app export differs

describe('@smoke-e2e', () => {
  it('verifier status GET returns 200', async () => {
    const res = await request(app).get('/api/verifier/credential/seed-1/status');
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('credentialId');
  });
});
