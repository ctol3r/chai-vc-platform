import { PolkadotService } from '../src/blockchain/polkadot_service';

describe('PolkadotService mock fallback', () => {
  const originalEnv = process.env.SKIP_REAL_POLKADOT;
  let service: PolkadotService;

  beforeAll(() => {
    process.env.SKIP_REAL_POLKADOT = 'true';
    service = new PolkadotService();
  });

  afterAll(() => {
    if (typeof originalEnv === 'undefined') {
      delete process.env.SKIP_REAL_POLKADOT;
    } else {
      process.env.SKIP_REAL_POLKADOT = originalEnv;
    }
  });

  it('returns deterministic tx hash for issueCredential', async () => {
    const hash = '0xdeadbeefcafebabe1234';
    const { txHash, status } = await service.issueCredential(hash);

    expect(txHash).toBe('0xmock-0xdeadbeefca');
    expect(status).toBe('FINALIZED');

    const repeat = await service.issueCredential(hash);
    expect(repeat.txHash).toBe(txHash);
  });

  it('returns deterministic tx hash for revokeCredential', async () => {
    const hash = '0xfeedface12345678';
    const { txHash, status } = await service.revokeCredential(hash, 'expired');

    expect(txHash).toBe('0xmock-0xfeedface12');
    expect(status).toBe('FINALIZED');

    const repeat = await service.revokeCredential(hash, 'expired');
    expect(repeat.txHash).toBe(txHash);
  });
});
