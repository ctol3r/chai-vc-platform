export interface BlockchainIntegrationMock {
  factory: () => {
    __esModule: true;
    checkCredentialStatus: jest.Mock<Promise<'valid' | 'revoked' | 'unknown'>, [string]>;
    default: {
      checkCredentialStatus: jest.Mock<Promise<'valid' | 'revoked' | 'unknown'>, [string]>;
    };
  };
  checkCredentialStatus: jest.Mock<Promise<'valid' | 'revoked' | 'unknown'>, [string]>;
  setDefaultStatus: (status: 'valid' | 'revoked' | 'unknown') => void;
  setStatusForCredential: (id: string, status: 'valid' | 'revoked' | 'unknown') => void;
  reset: () => void;
}

export const createBlockchainIntegrationMock = (
  initialStatus: 'valid' | 'revoked' | 'unknown' = 'valid'
): BlockchainIntegrationMock => {
  let defaultStatus: 'valid' | 'revoked' | 'unknown' = initialStatus;
  const overrides = new Map<string, 'valid' | 'revoked' | 'unknown'>();

  const resolveStatus = async (credentialId: string): Promise<'valid' | 'revoked' | 'unknown'> => {
    const normalised = credentialId.toLowerCase();
    return overrides.get(normalised) ?? defaultStatus;
  };

  const checkCredentialStatus = jest.fn(resolveStatus);

  return {
    factory: () => ({
      __esModule: true as const,
      checkCredentialStatus,
      default: { checkCredentialStatus },
    }),
    checkCredentialStatus,
    setDefaultStatus: (status) => {
      defaultStatus = status;
    },
    setStatusForCredential: (id, status) => {
      overrides.set(id.toLowerCase(), status);
    },
    reset: () => {
      overrides.clear();
      defaultStatus = initialStatus;
      checkCredentialStatus.mockClear();
    },
  };
};
