import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import type { KeyringPair } from '@polkadot/keyring/types';

const SKIP_ENV = 'SKIP_REAL_POLKADOT';

const isSkipEnabled = () => {
  const raw = process.env[SKIP_ENV];
  if (typeof raw === 'undefined') {
    return true;
  }
  return raw.toLowerCase() === 'true';
};

const createMockResult = (label: string) => ({
  status: {
    isInBlock: true,
    isFinalized: true,
  },
  txHash: {
    toHex: () => `0xmock-${label}`,
  },
});

const createMockExtrinsic = (label: string) => ({
  async signAndSend(_signer: unknown, cb?: (res: any) => void) {
    if (typeof cb === 'function') {
      await Promise.resolve();
      cb(createMockResult(label));
    }
    return () => undefined;
  },
});

const mockApi = {
  tx: {
    credentialPallet: {
      authorizeIssuer: () => createMockExtrinsic('authorize'),
      deauthorizeIssuer: () => createMockExtrinsic('deauthorize'),
      issueCredential: () => createMockExtrinsic('issue'),
      revokeCredential: () => createMockExtrinsic('revoke'),
    },
  },
};

let apiPromise: ApiPromise | null = null;
let mockSigner: KeyringPair | null = null;

export async function getPolkadotApi(): Promise<typeof mockApi | ApiPromise> {
  if (isSkipEnabled()) {
    return mockApi;
  }

  if (apiPromise) {
    return apiPromise;
  }

  const endpoint = process.env.POLKADOT_WS_ENDPOINT || 'ws://127.0.0.1:9944';
  const provider = new WsProvider(endpoint);
  apiPromise = await ApiPromise.create({ provider });
  return apiPromise;
}

export async function getSigner(_ctx?: unknown): Promise<KeyringPair> {
  if (isSkipEnabled()) {
    if (!mockSigner) {
      mockSigner = {
        address: 'mock-admin',
      } as unknown as KeyringPair;
    }
    return mockSigner;
  }

  const keyring = new Keyring({ type: 'sr25519' });
  const seed = process.env.TRUST_REGISTRY_ADMIN_SEED || '//Alice';
  return keyring.addFromUri(seed);
}

export async function getApiAndSigner(ctx?: unknown) {
  const [api, signer] = await Promise.all([getPolkadotApi(), getSigner(ctx)]);
  return { api, signer };
}

export default {
  getPolkadotApi,
  getSigner,
  getApiAndSigner,
};
