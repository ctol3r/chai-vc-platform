import request from 'supertest';
import app from '../src/app';

describe('GET /credentials', () => {
  it('responds with issued and received arrays', async () => {
    const res = await request(app).get('/credentials');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.issued)).toBe(true);
    expect(Array.isArray(res.body.received)).toBe(true);
  });
});
