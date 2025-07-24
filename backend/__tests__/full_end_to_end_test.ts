import { WalletProofService } from '../src/crypto/wallet_proof_service';

describe('WalletProofService', () => {
  it('generates a mocked BBS+ proof', async () => {
    const service = new WalletProofService();
    const result = await service.generateProof({
      did: 'did:example:456',
      proofRequest: { selective: ['foo'] },
    });
    expect(result.proof).toBe('bbs+_proof_for_did:example:456');
  });
});
