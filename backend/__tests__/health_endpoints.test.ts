import request from 'supertest';
import app from '../src/app';

describe('health endpoints', () => {
  it('GET /api/healthz', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.status).toBe(200);
    // accept richer shape while ensuring legacy ok:true still present
    expect(res.body).toMatchObject({ ok: true, status: 'healthy' });
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('service');
  });

  it('GET /api/readyz', async () => {
    const res = await request(app).get('/api/readyz');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, status: 'ready' });
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('service');
    expect(res.body).toHaveProperty('checks');
    expect(res.body.checks).toHaveProperty('database', 'connected');
  });
});
