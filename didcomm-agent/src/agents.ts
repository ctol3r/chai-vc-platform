import { DIDDoc, DIDResolver, Secret, SecretsResolver } from 'didcomm';

export const ALICE_DID = 'did:example:alice';
export const BOB_DID = 'did:example:bob';

export const ALICE_DID_DOC: DIDDoc = {
  id: ALICE_DID,
  keyAgreement: ['did:example:alice#key-x25519-1'],
  authentication: ['did:example:alice#key-1'],
  verificationMethod: [
    {
      id: 'did:example:alice#key-x25519-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:alice#key-x25519-1',
      publicKeyJwk: {
        crv: 'X25519',
        kty: 'OKP',
        x: 'avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs',
      },
    },
    {
      id: 'did:example:alice#key-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:alice#key-1',
      publicKeyJwk: {
        crv: 'Ed25519',
        kty: 'OKP',
        x: 'G-boxFB6vOZBu-wXkm-9Lh79I8nf9Z50cILaOgKKGww',
      },
    },
  ],
  service: [],
};

export const BOB_DID_DOC: DIDDoc = {
  id: BOB_DID,
  keyAgreement: ['did:example:bob#key-x25519-1'],
  authentication: [],
  verificationMethod: [
    {
      id: 'did:example:bob#key-x25519-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob#key-x25519-1',
      publicKeyJwk: {
        crv: 'X25519',
        kty: 'OKP',
        x: 'GDTrI66K0pFfO54tlCSvfjjNapIs44dzpneBgyx0S3E',
      },
    },
  ],
  service: [],
};

export const ALICE_SECRETS: Secret[] = [
  {
    id: 'did:example:alice#key-1',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      crv: 'Ed25519',
      d: 'pFRUKkyzx4kHdJtFSnlPA9WzqkDT1HWV0xZ5OYZd2SY',
      kty: 'OKP',
      x: 'G-boxFB6vOZBu-wXkm-9Lh79I8nf9Z50cILaOgKKGww',
    },
  },
  {
    id: 'did:example:alice#key-x25519-1',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      crv: 'X25519',
      d: 'r-jK2cO3taR8LQnJB1_ikLBTAnOtShJOsHXRUWT-aZA',
      kty: 'OKP',
      x: 'avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs',
    },
  },
];

export const BOB_SECRETS: Secret[] = [
  {
    id: 'did:example:bob#key-x25519-1',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      crv: 'X25519',
      d: 'b9NnuOCB0hm7YGNvaE9DMhwH_wjZA1-gWD6dA0JWdL0',
      kty: 'OKP',
      x: 'GDTrI66K0pFfO54tlCSvfjjNapIs44dzpneBgyx0S3E',
    },
  },
];

export class ExampleDIDResolver implements DIDResolver {
  constructor(private known: DIDDoc[]) {}
  async resolve(did: string): Promise<DIDDoc | null> {
    return this.known.find((d) => d.id === did) || null;
  }
}

export class ExampleSecretsResolver implements SecretsResolver {
  constructor(private known: Secret[]) {}
  async get_secret(id: string): Promise<Secret | null> {
    return this.known.find((s) => s.id === id) || null;
  }
  async find_secrets(ids: string[]): Promise<string[]> {
    return ids.filter((id) => this.known.find((s) => s.id === id));
  }
}
