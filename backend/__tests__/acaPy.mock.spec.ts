import { issueStatusProof, verifyStatusProof } from '../src/blockchain/acaPy';

describe('ACA-Py admin wrapper mock behavior', () => {
  const originalFetch = (global as unknown as { fetch?: unknown }).fetch;

  beforeEach(() => {
    (global as unknown as { fetch?: unknown }).fetch = jest
      .fn()
      .mockRejectedValue(new Error('offline'));
  });

  afterEach(() => {
    (global as unknown as { fetch?: unknown }).fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('returns a mock proof token on network failure', async () => {
    const hash = 'deadbeefcafebabe';
    const result = await issueStatusProof(hash);

    expect(result).toMatchObject({
      token: `MOCK-PROOF-${hash.slice(0, 8)}`,
      ok: true
    });
  });

  it('accepts mock tokens without calling the API', async () => {
    const result = await verifyStatusProof('MOCK-PROOF-12345678');

    expect(result).toEqual({ ok: true, reason: 'mock' });
    expect((global as unknown as { fetch: jest.Mock }).fetch).not.toHaveBeenCalled();
  });

  it('fails verification when the API request fails', async () => {
    const result = await verifyStatusProof('real-token');

    expect(result).toEqual({ ok: false, reason: 'verify-failed' });
    expect((global as unknown as { fetch: jest.Mock }).fetch).toHaveBeenCalled();
  });
});
