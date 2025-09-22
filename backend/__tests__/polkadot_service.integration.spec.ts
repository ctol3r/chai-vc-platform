import { PolkadotService } from '../src/blockchain/polkadot_service';

describe('PolkadotService integration mock fallback', () => {
  const originalEnv = process.env.SKIP_REAL_POLKADOT;

  beforeAll(() => {
    process.env.SKIP_REAL_POLKADOT = 'true';
  });

  afterAll(() => {
    if (typeof originalEnv === 'undefined') {
      delete process.env.SKIP_REAL_POLKADOT;
    } else {
      process.env.SKIP_REAL_POLKADOT = originalEnv;
    }
  });

  it('returns deterministic mock transaction details when skipping real chain', async () => {
    const service = new PolkadotService();
    const result = await service.issueCredential('demo-hash');

    expect(result.status).toBe('FINALIZED');
    expect(result.txHash).toBe('0xmock-demohash0000');
  });
});
