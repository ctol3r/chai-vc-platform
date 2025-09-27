/**
 * test/helpers/blockchainIntegrationMock.ts
 *
 * Lightweight test mock used by multiple test files.
 * Exports:
 *  - createBlockchainIntegrationMock(): factory returning an object with jest.fn() methods
 *  - type BlockchainIntegrationMock
 *  - named export checkCredentialStatus (async)
 *  - default export { checkCredentialStatus }
 *
 * This file intentionally returns 'valid' by default so existing tests expecting that
 * value continue to pass. Tests can override the mock.fn behavior in their setup.
 */

export type CredentialStatus = 'valid' | 'revoked' | 'unknown';

export type BlockchainIntegrationMock = {
  checkCredentialStatus: jest.Mock<Promise<CredentialStatus>, [string]>;
};

export function createBlockchainIntegrationMock(): BlockchainIntegrationMock {
  const mock: BlockchainIntegrationMock = {
    checkCredentialStatus: jest.fn(async (_id: string) => 'valid'),
  };
  return mock;
}

// Provide a simple named function export so code that imports checkCredentialStatus directly works
export const checkCredentialStatus = async (_id: string): Promise<CredentialStatus> => 'valid';

// Provide a default object export shape (commonjs/esm compatibility)
const defaultExport = { checkCredentialStatus };
export default defaultExport;
