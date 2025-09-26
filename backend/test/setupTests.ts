import { createBlockchainIntegrationMock } from './helpers/blockchainIntegrationMock';
import { createPrivacyClientMock } from './helpers/privacyClientMock';

type GlobalWithMocks = typeof globalThis & {
  __blockchainIntegrationMock__?: ReturnType<typeof createBlockchainIntegrationMock>;
  __privacyClientMock__?: ReturnType<typeof createPrivacyClientMock>;
};

const blockchainIntegrationMock = createBlockchainIntegrationMock();
const privacyClientMock = createPrivacyClientMock();

(globalThis as GlobalWithMocks).__blockchainIntegrationMock__ = blockchainIntegrationMock;
(globalThis as GlobalWithMocks).__privacyClientMock__ = privacyClientMock;

jest.mock('../src/blockchain/blockchain_integration', () => blockchainIntegrationMock.factory());
jest.mock('../src/lib/privacyClient', () => privacyClientMock.factory());
jest.mock('@polkadot/api', () => ({
  ApiPromise: { create: jest.fn() },
  WsProvider: jest.fn(),
}));

beforeEach(() => {
  blockchainIntegrationMock.reset();
  privacyClientMock.reset();
});

export {};
