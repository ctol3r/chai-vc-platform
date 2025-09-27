import type { PrivacyVerificationRequest, PrivacyVerificationResponse } from '../../src/lib/privacyClient';

type VerifyFn = jest.Mock<Promise<PrivacyVerificationResponse>, [PrivacyVerificationRequest]>;

export interface PrivacyClientMock {
  factory: () => {
    __esModule: true;
    privacyClient: { verifyProof: VerifyFn };
    HttpPrivacyClient: jest.Mock;
    DevPrivacyClient: jest.Mock;
  };
  verifyProof: VerifyFn;
  reset: () => void;
}

const defaultResponse = (): PrivacyVerificationResponse => ({
  valid: true,
  checkedAt: new Date().toISOString(),
  details: { disclosureType: 'full', strategy: 'mock' },
});

export const createPrivacyClientMock = (): PrivacyClientMock => {
  const verifyProof: VerifyFn = jest.fn(async (_req) => defaultResponse());
  const createClientMock = () => ({ verifyProof });
  const HttpPrivacyClient = jest.fn().mockImplementation(createClientMock);
  const DevPrivacyClient = jest.fn().mockImplementation(createClientMock);

  return {
    factory: () => ({
      __esModule: true as const,
      privacyClient: { verifyProof },
      HttpPrivacyClient,
      DevPrivacyClient,
    }),
    verifyProof,
    reset: () => {
      verifyProof.mockReset().mockResolvedValue(defaultResponse());
      HttpPrivacyClient.mockReset();
      DevPrivacyClient.mockReset();
    },
  };
};
