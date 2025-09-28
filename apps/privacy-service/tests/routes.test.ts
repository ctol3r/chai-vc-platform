import request from 'supertest';
import { createApp } from '../src/app';

describe('privacy-service routes', () => {
  const app = createApp();

  it('returns health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns key info', async () => {
    const res = await request(app).get('/keyinfo');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('keys');
    expect(Array.isArray(res.body.keys)).toBe(true);
  });

  it('issues a deterministic proof and verifies it', async () => {
    const proveResponse = await request(app)
      .post('/prove')
      .send({ subjectId: 'did:example:123', claims: { credential: 'nursing-license', level: 'RN' } });

    expect(proveResponse.status).toBe(200);
    expect(proveResponse.body).toMatchObject({
      proofId: expect.stringMatching(/^proof-/),
      credential: { credentialId: expect.stringMatching(/^cred-/) },
      proof: {
        disclosureType: 'full',
        revealedFields: ['credential', 'level'],
      },
    });

    const verifyResponse = await request(app)
      .post('/verify')
      .send({ credential: proveResponse.body.credential, proof: proveResponse.body.proof });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body).toMatchObject({
      valid: true,
      details: {
        strategy: 'bbs+v1-stub',
        disclosureType: 'full',
      },
    });
  });

  it('supports selective disclosure', async () => {
    const proveResponse = await request(app)
      .post('/prove')
      .send({
        subjectId: 'did:example:789',
        claims: { credential: 'pharmacy-license', level: 'PharmD', expires: '2025-12-31' },
        revealFields: ['credential', 'expires'],
      });

    expect(proveResponse.status).toBe(200);
    expect(proveResponse.body.proof.revealedFields).toEqual(['credential', 'expires']);
    expect(proveResponse.body.proof.disclosureType).toBe('selective');

    const verifyResponse = await request(app)
      .post('/verify')
      .send({ credential: proveResponse.body.credential, proof: proveResponse.body.proof });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.valid).toBe(true);
    expect(verifyResponse.body.details.disclosureType).toBe('selective');
  });
});
