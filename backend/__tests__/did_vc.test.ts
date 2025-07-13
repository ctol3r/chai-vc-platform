import { generateDID, issueVC } from '../src/did_vc';

describe('DID generation & VC issuance flow', () => {
  test('generateDID returns did:example identifier', () => {
    const did = generateDID();
    expect(did).toMatch(/^did:example:[0-9a-f]+$/);
  });

  test('issueVC returns credential with issuer and subject', () => {
    const did = 'did:example:123';
    const cred = issueVC(did, { name: 'Alice' });
    expect(cred.issuer).toBe(did);
    expect(cred.credentialSubject).toEqual({ name: 'Alice' });
    expect(cred.id).toMatch(/^urn:uuid:/);
    expect(new Date(cred.issuanceDate).toString()).not.toBe('Invalid Date');
  });

  test('end-to-end DID generation then VC issuance', () => {
    const did = generateDID();
    const credentialSubject = { role: 'nurse' };
    const vc = issueVC(did, credentialSubject);
    expect(vc.issuer).toBe(did);
    expect(vc.credentialSubject).toEqual(credentialSubject);
  });
});
