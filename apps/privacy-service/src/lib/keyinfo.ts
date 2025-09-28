export interface KeyInfo {
  keyId: string;
  algorithm: string;
  publicKeyJwk: Record<string, unknown>;
  expiresAt: string | null;
}

const signingKey: KeyInfo = {
  keyId: 'did:example:issuer#bbs-key-1',
  algorithm: 'BBS+',
  publicKeyJwk: {
    kty: 'EC',
    crv: 'BLS12381_G2',
    x: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  expiresAt: null,
};

export function listKeys(): KeyInfo[] {
  return [signingKey];
}
