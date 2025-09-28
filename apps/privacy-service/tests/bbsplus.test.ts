import {
  issueCredential,
  verifyCredential,
  createDisclosureProof,
  verifyDisclosureProof,
} from '../src/lib/bbsplus';

describe('bbsplus shim', () => {
  const baseClaims = { credential: 'nursing-license', level: 'RN', expires: '2026-01-01' };

  it('issues and verifies a credential', () => {
    const credential = issueCredential({ subjectId: 'did:example:123', claims: baseClaims });
    expect(credential.signature).toMatch(/^[a-f0-9]+$/);
    expect(verifyCredential(credential)).toBe(true);
  });

  it('creates and verifies selective disclosure proof', () => {
    const credential = issueCredential({ subjectId: 'did:example:123', claims: baseClaims });
    const proof = createDisclosureProof({ credential, revealFields: ['credential', 'expires'] });

    expect(proof.disclosureType).toBe('selective');
    expect(proof.revealedFields).toEqual(['credential', 'expires']);
    expect(proof.revealedClaims).toEqual({ credential: 'nursing-license', expires: '2026-01-01' });

    const result = verifyDisclosureProof(proof, credential);
    expect(result.valid).toBe(true);
  });

  it('rejects tampered disclosure', () => {
    const credential = issueCredential({ subjectId: 'did:example:123', claims: baseClaims });
    const proof = createDisclosureProof({ credential, revealFields: ['credential'] });

    proof.revealedClaims.credential = 'fake';

    const result = verifyDisclosureProof(proof, credential);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalid-proof');
  });
});
