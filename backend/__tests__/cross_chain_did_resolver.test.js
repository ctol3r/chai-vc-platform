const { CrossChainDIDResolver } = require('../src/blockchain/cross_chain_did_resolver.js');

describe('CrossChainDIDResolver', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('resolves DID using external resolver', async () => {
    const mockDoc = { id: 'did:example:123', '@context': ['https://www.w3.org/ns/did/v1'] };

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ didDocument: mockDoc }),
    }));

    const resolver = new CrossChainDIDResolver('https://mock.resolver');
    const doc = await resolver.resolve('did:example:123');

    expect(doc).toEqual(mockDoc);
  });
});
