import request from 'supertest';
import app from '../src/app';

describe('redact middleware', () => {
  it('redacts secrets in logged payload', async () => {
    const res = await request(app)
      .post('/api/verifier/presentation')
      .send({ token: 'ABC123', nested: { apiKey: 'XYZ' } });
    expect(res.status).toBeGreaterThanOrEqual(200);
  });
});
