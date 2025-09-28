import type { ProofPayload } from '../src/controllers/verifier_controller';

const noopPrivacyMock = () => ({
  privacyClient: { verifyProof: jest.fn() },
  PrivacyClient: jest.fn(),
});

describe('getCredentialStatus export resolution', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const importController = async (moduleImpl: unknown) => {
    jest.doMock('../src/blockchain/blockchain_integration', () => moduleImpl);
    jest.doMock('../src/lib/privacyClient', noopPrivacyMock);
    const mod = await import('../src/controllers/verifier_controller');
    return mod;
  };

  it('supports named export', async () => {
    const statusFn = jest.fn(async () => 'revoked' as const);
    const { getCredentialStatus } = await importController({
      __esModule: true,
      checkCredentialStatus: statusFn,
    });

    const result = await getCredentialStatus('cred-1');
    expect(statusFn).toHaveBeenCalledWith('cred-1');
    expect(result).toEqual({ status: 'revoked' });
  });

  it('supports default object export', async () => {
    const statusFn = jest.fn(async () => 'unknown' as const);
    const { getCredentialStatus } = await importController({
      __esModule: true,
      default: {
        checkCredentialStatus: statusFn,
      },
    });

    const result = await getCredentialStatus('cred-2');
    expect(statusFn).toHaveBeenCalledWith('cred-2');
    expect(result).toEqual({ status: 'unknown' });
  });

  it('supports default function export', async () => {
    const statusFn = jest.fn(async () => 'valid' as const);
    const { getCredentialStatus } = await importController({
      __esModule: true,
      default: statusFn,
    });

    const result = await getCredentialStatus('cred-3');
    expect(statusFn).toHaveBeenCalledWith('cred-3');
    expect(result).toEqual({ status: 'valid' });
  });

  it('supports CommonJS export function', async () => {
    const statusFn = jest.fn(async () => 'revoked' as const);
    const { getCredentialStatus } = await importController(statusFn);

    const result = await getCredentialStatus('cred-4');
    expect(statusFn).toHaveBeenCalledWith('cred-4');
    expect(result).toEqual({ status: 'revoked' });
  });

  it('normalizes non-string credential ids', async () => {
    const statusFn = jest.fn(async (id: string) => {
      expect(id).toBe('789');
      return 'valid' as const;
    });
    const { getCredentialStatus } = await importController({
      __esModule: true,
      checkCredentialStatus: statusFn,
    });

    const result = await getCredentialStatus(789 as unknown as string);
    expect(result).toEqual({ status: 'valid' });
  });

  it('falls back to privacy proof when provided', async () => {
    const verifyProof = jest.fn(async () => ({ valid: true, checkedAt: 'now' }));
    jest.doMock('../src/blockchain/blockchain_integration', () => ({
      __esModule: true,
      checkCredentialStatus: jest.fn(async () => 'unknown' as const),
    }));
    jest.doMock('../src/lib/privacyClient', () => ({
      privacyClient: { verifyProof },
      PrivacyClient: jest.fn(),
    }));

    const { getCredentialStatus } = await import('../src/controllers/verifier_controller');

    const proof: ProofPayload = { credential: { id: 'cred-5' }, proof: { proofId: 'proof-5' } };
    const result = await getCredentialStatus('cred-5', proof);

    expect(verifyProof).toHaveBeenCalledWith(proof);
    expect(result.status).toBe('valid');
  });
});
