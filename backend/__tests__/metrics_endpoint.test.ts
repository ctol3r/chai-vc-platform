import request from 'supertest';
import app from '../src/app';

describe('metrics endpoint', () => {
  it('serves Prometheus metrics', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/proof_verification_attempts_total/);
  });
});
