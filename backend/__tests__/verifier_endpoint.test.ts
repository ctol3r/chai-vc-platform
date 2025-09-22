import { getCredentialStatus } from '../src/controllers/verifier_controller';

describe('verifier credential status endpoint', () => {
  it('returns a credential status', async () => {
    const status = await getCredentialStatus('123');
    expect(status).toBe('valid');
  });
});
