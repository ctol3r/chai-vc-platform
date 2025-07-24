import request from 'supertest';
import { createServer } from '../src/hub';

describe('adapter hub', () => {
  it('adapts credential using example adapter', async () => {
    const app = await createServer();
    const res = await request(app).post('/adapt').send({
      network: 'example',
      credential: { id: '123' }
    });
    expect(res.status).toBe(200);
    expect(res.body.adapted).toEqual({ id: '123', adaptedFor: 'example' });
  });

  it('returns 404 for missing adapter', async () => {
    const app = await createServer();
    const res = await request(app).post('/adapt').send({
      network: 'missing',
      credential: { id: '123' }
    });
    expect(res.status).toBe(404);
  });
});
