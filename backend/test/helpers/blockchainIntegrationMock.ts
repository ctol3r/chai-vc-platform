import type { CredentialStatus } from '../../src/blockchain/blockchain_integration';

type MockedCheckStatus = jest.Mock<Promise<CredentialStatus>, [unknown?]>;

type BlockchainIntegrationMock = {
  factory: () => {
    __esModule: true;
    checkCredentialStatus: MockedCheckStatus;
    default: { checkCredentialStatus: MockedCheckStatus };
  };
  checkCredentialStatus: MockedCheckStatus;
  setDefaultStatus: (status: CredentialStatus) => void;
  setStatusForCredential: (credentialId: string, status: CredentialStatus) => void;
  clearOverrides: () => void;
  reset: (status?: CredentialStatus) => void;
};

const normalizeId = (credentialId: unknown): string => {
  if (typeof credentialId === 'string') return credentialId.trim().toLowerCase();
  return String(credentialId ?? '').trim().toLowerCase();
};

export const createBlockchainIntegrationMock = (
  initialStatus: CredentialStatus = 'valid'
): BlockchainIntegrationMock => {
  let defaultStatus: CredentialStatus = initialStatus;
  const overrides = new Map<string, CredentialStatus>();

  const computeStatus = (credentialId: unknown): CredentialStatus => {
    const normalized = normalizeId(credentialId);
    return overrides.get(normalized) ?? defaultStatus;
  };

  const checkCredentialStatus: MockedCheckStatus = jest.fn(async (credentialId: unknown) => computeStatus(credentialId));

  const refreshImplementation = () => {
    checkCredentialStatus.mockImplementation(async (credentialId: unknown) => computeStatus(credentialId));
  };

  refreshImplementation();

  return {
    factory: () => ({
      __esModule: true as const,
      checkCredentialStatus,
      default: { checkCredentialStatus },
    }),
    checkCredentialStatus,
    setDefaultStatus: (status: CredentialStatus) => {
      defaultStatus = status;
      refreshImplementation();
    },
    setStatusForCredential: (credentialId: string, status: CredentialStatus) => {
      overrides.set(normalizeId(credentialId), status);
      refreshImplementation();
    },
    clearOverrides: () => {
      overrides.clear();
      refreshImplementation();
    },
    reset: (status: CredentialStatus = initialStatus) => {
      defaultStatus = status;
      overrides.clear();
      checkCredentialStatus.mockClear();
      refreshImplementation();
    },
  };
};

export type { BlockchainIntegrationMock };
