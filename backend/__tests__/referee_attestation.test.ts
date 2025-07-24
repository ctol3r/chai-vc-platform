import { BlockchainIntegration } from '../src/blockchain/blockchain_integration';

const blockchain = new BlockchainIntegration();

describe('referee endorsement attestation', () => {
  it('creates a mock attestation hash', async () => {
    const id = await blockchain.recordRefereeEndorsement({
      credentialId: 'cred-1',
      refereeDid: 'did:example:referee',
      message: 'verified',
    });
    expect(id).toMatch(/^attest-/);
  });
});
