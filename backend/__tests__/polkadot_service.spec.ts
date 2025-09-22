import { ApiPromise } from '@polkadot/api';
import { PolkadotService } from '../src/blockchain/polkadot_service';

const mockSignAndSend = jest.fn(
  (_signer: unknown, cb?: (result: any) => void) => {
    if (cb) {
      cb({
        status: { isInBlock: false, isFinalized: true },
        dispatchError: undefined,
        txHash: { toHex: () => '0xabc' },
      });
    }
    return Promise.resolve(() => {});
  }
);

const mockExtrinsic = {
  hash: { toHex: () => '0xabc' },
  signAndSend: mockSignAndSend,
};

const mockApi = {
  tx: {
    credentialPallet: {
      issueCredential: jest.fn(() => mockExtrinsic),
      revokeCredential: jest.fn(() => mockExtrinsic),
      authorizeIssuer: jest.fn(() => mockExtrinsic),
      deauthorizeIssuer: jest.fn(() => mockExtrinsic),
    },
  },
  registry: {
    findMetaError: jest.fn(() => ({ section: 'mock', name: 'error' })),
  },
};

jest.mock('@polkadot/api', () => ({
  ApiPromise: {
    create: jest.fn(async () => mockApi),
  },
  WsProvider: jest.fn().mockImplementation(() => ({})),
  SubmittableResult: jest.fn(),
}));

jest.mock('@polkadot/keyring', () => ({
  Keyring: jest.fn().mockImplementation(() => ({
    addFromUri: jest.fn(() => ({ address: 'keyring-address' })),
  })),
}));

describe('PolkadotService', () => {
  const originalEnv = process.env.SKIP_REAL_POLKADOT;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.SKIP_REAL_POLKADOT = originalEnv;
  });

  it('returns deterministic mock results when skipping real integration', async () => {
    process.env.SKIP_REAL_POLKADOT = 'true';
    const service = new PolkadotService();
    const result = await service.issueCredential('demo-hash');

    expect(result.status).toBe('FINALIZED');
    expect(result.txHash).toMatch(/^0xmock-/);
    expect(mockSignAndSend).not.toHaveBeenCalled();
  });

  it('delegates to polkadot-js when integration is enabled', async () => {
    process.env.SKIP_REAL_POLKADOT = 'false';
    const service = new PolkadotService();
    const result = await service.issueCredential('0xfeed');

    expect(mockSignAndSend).toHaveBeenCalled();
    expect(mockApi.tx.credentialPallet.issueCredential).toHaveBeenCalledWith('0xfeed');
    expect(ApiPromise.create).toHaveBeenCalled();
    expect(result).toEqual({ txHash: '0xabc', status: 'FINALIZED' });
  });

  it('reuses issue flow when anchoring proof data', async () => {
    process.env.SKIP_REAL_POLKADOT = 'false';
    const service = new PolkadotService();
    await service.anchorProof('0xfeed');
    expect(mockApi.tx.credentialPallet.issueCredential).toHaveBeenCalledWith('0xfeed');
  });
});
