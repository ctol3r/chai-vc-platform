import request from 'supertest';
import app from '../src/app';
import { store } from '../src/services/store';

describe('Issue → Verify → Revoke flow', () => {
  beforeEach(() => {
    (store as any).store.clear();
    (store as any).subjectIndex.clear();
  });

  it('should issue credential and verify as valid', async () => {
    const issueRes = await request(app)
      .post('/issuer/credential')
      .send({
        credentialSubject: { id: 'did:example:123', name: 'Alice' },
        issuer: 'did:example:issuer',
      })
      .expect(200);

    expect(issueRes.body).toHaveProperty('credentialId');
    expect(issueRes.body).toHaveProperty('jwt');
    expect(issueRes.body).toHaveProperty('auditRef');

    const verifyRes = await request(app)
      .post('/verifier/presentation')
      .send({ jwt: issueRes.body.jwt })
      .expect(200);

    expect(verifyRes.body.valid).toBe(true);
    expect(verifyRes.body.credentialId).toBe(issueRes.body.credentialId);
    expect(verifyRes.body).toHaveProperty('auditRef');
  });

  it('should revoke credential and verify as invalid with reason:revoked', async () => {
    const issueRes = await request(app)
      .post('/issuer/credential')
      .send({
        credentialSubject: { id: 'did:example:456', name: 'Bob' },
        issuer: 'did:example:issuer',
      })
      .expect(200);

    const credentialId = issueRes.body.credentialId;
    const jwt = issueRes.body.jwt;

    const revokeRes = await request(app)
      .post('/issuer/revoke')
      .send({ credentialId })
      .expect(200);

    expect(revokeRes.body.ok).toBe(true);
    expect(revokeRes.body.credentialId).toBe(credentialId);
    expect(revokeRes.body).toHaveProperty('auditRef');

    const verifyRes = await request(app)
      .post('/verifier/presentation')
      .send({ jwt })
      .expect(200);

    expect(verifyRes.body.valid).toBe(false);
    expect(verifyRes.body.reason).toBe('revoked');
    expect(verifyRes.body.credentialId).toBe(credentialId);
    expect(verifyRes.body).toHaveProperty('auditRef');
  });
});
