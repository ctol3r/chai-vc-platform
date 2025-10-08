import request from 'supertest';
import app from '../src/app';
import { preAuthorizedCodeService } from '../src/services/preAuthorizedCodeService';

describe('OIDC4VCI issuer endpoints', () => {
  beforeEach(() => {
    preAuthorizedCodeService.clear();
  });

  it('returns issuer metadata', async () => {
    const res = await request(app).get('/.well-known/openid-credential-issuer');
    expect(res.status).toBe(200);
    expect(res.body.credential_issuer).toBeDefined();
    expect(res.body.credentials_supported).toBeInstanceOf(Array);
  });

  it('validates required fields when issuing pre-authorized code', async () => {
    const res = await request(app).post('/oidc4vci/pre-authorized-code').send({ client_id: 'wallet' });
    expect(res.status).toBe(400);
  });

  it('issues and redeems a pre-authorized code with nonce binding', async () => {
    const issue = await request(app)
      .post('/oidc4vci/pre-authorized-code')
      .send({ client_id: 'wallet', wallet_nonce: 'nonce-1' });
    expect(issue.status).toBe(200);
    expect(issue.body.pre_authorized_code).toBeDefined();
    const code = issue.body.pre_authorized_code as string;

    const redeem = await request(app)
      .post('/oidc4vci/token')
      .send({ pre_authorized_code: code, wallet_nonce: 'nonce-1' });
    expect(redeem.status).toBe(200);
    expect(redeem.body.access_token).toContain(code);

    const replay = await request(app)
      .post('/oidc4vci/token')
      .send({ pre_authorized_code: code, wallet_nonce: 'nonce-1' });
    expect(replay.status).toBe(400);
    expect(replay.body.error).toBe('pre_authorized_code_already_used');
  });

  it('rejects nonce mismatches on redemption', async () => {
    const issue = await request(app)
      .post('/oidc4vci/pre-authorized-code')
      .send({ client_id: 'wallet', wallet_nonce: 'nonce-2' });
    const code = issue.body.pre_authorized_code;
    const redeem = await request(app)
      .post('/oidc4vci/token')
      .send({ pre_authorized_code: code, wallet_nonce: 'different' });
    expect(redeem.status).toBe(400);
    expect(redeem.body.error).toBe('nonce_mismatch');
  });
});
