// Integration-lite test ensures credential chain service mocks behave for CI.
import { CredentialChainService } from '../src/blockchain/credentialChainService';

describe('CredentialChainService (mocked)', () => {
  test('issue -> revoke -> expire executes without chain', async () => {
    const service = new CredentialChainService();

    await expect(service.issue('0x1234', null)).resolves.toBeUndefined();
    await expect(service.revoke('0x1234', 'no longer valid', null)).resolves.toBeUndefined();
    await expect(service.expire('0x1234', null)).resolves.toBeUndefined();
  });
});
