import { PolkadotService } from '../src/blockchain/polkadot_service';

describe('PolkadotService mock', () => {
  const service = new PolkadotService();

  it('returns deterministic tx hash for issueCredential', async () => {
    const hash = '0xdeadbeefcafebabe1234';
    const { txHash, status } = await service.issueCredential(hash);

    expect(txHash).toBe('0xdeadbeefcafebabe');
    expect(status).toBe('mock-finalized');

    const repeat = await service.issueCredential(hash);
    expect(repeat.txHash).toBe(txHash);
  });

  it('returns deterministic tx hash for revokeCredential', async () => {
    const hash = '0xfeedface12345678';
    const { txHash, status } = await service.revokeCredential(hash, 'expired');

    expect(txHash).toBe('0xfeedface12345678');
    expect(status).toBe('mock-finalized');

    const repeat = await service.revokeCredential(hash, 'expired');
    expect(repeat.txHash).toBe(txHash);
  });
});
