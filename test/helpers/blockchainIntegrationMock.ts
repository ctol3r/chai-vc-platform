/**
 * test/helpers/blockchainIntegrationMock.ts
 * Canonical helper used by tests. Exports a small default and named shape.
 */
export type CredentialStatus = 'valid' | 'revoked' | 'unknown';

export type BlockchainIntegrationMock = {
  checkCredentialStatus: jest.Mock<Promise<CredentialStatus>, [string]>;
};

export function createBlockchainIntegrationMock(): BlockchainIntegrationMock {
  return {
    checkCredentialStatus: jest.fn(async (_id: string) => 'valid'),
  };
}

export const checkCredentialStatus = async (_id: string): Promise<CredentialStatus> => 'valid';

export default { checkCredentialStatus };
