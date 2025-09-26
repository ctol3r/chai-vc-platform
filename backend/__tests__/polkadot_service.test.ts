import { PolkadotService } from '../src/blockchain/polkadot_service';
import type { KeyringPair } from '@polkadot/keyring/types';

class TestablePolkadotService extends PolkadotService {
  public setApi(api: any) {
    (this as any).api = api;
  }

  public async invokeSignAndAwait(extrinsic: any, signer: KeyringPair) {
    return (PolkadotService.prototype as any).signAndAwait.call(this, extrinsic, signer);
  }
}

const signer = {} as KeyringPair;

const makeExtrinsic = (callback: (handler: (result: any) => void) => void) => ({
  signAndSend: jest.fn(async (_signer: KeyringPair, handler: (result: any) => void) => {
    callback(handler);
    return () => void 0;
  }),
});

describe('PolkadotService', () => {
  it('resolves when the extrinsic reaches in-block status', async () => {
    const statuses = [
      { status: {} },
      { status: { isInBlock: true } },
    ];

    const extrinsic = makeExtrinsic((handler) => {
      statuses.forEach((status) => handler(status as any));
    });

    const service = new TestablePolkadotService();
    service.setApi({
      tx: {
        credentialsModule: {
          issueCredential: jest.fn(() => extrinsic),
        },
        utility: {
          batch: jest.fn(() => extrinsic),
        },
      },
    });

    const result = await service.invokeSignAndAwait(extrinsic, signer);
    expect(result.status?.isInBlock).toBe(true);
  });

  it('resolves when finalized after intermediate statuses', async () => {
    let handlerRef: ((result: any) => void) | undefined;
    const extrinsic = makeExtrinsic((handler) => {
      handlerRef = handler;
    });

    const service = new TestablePolkadotService();
    service.setApi({ tx: { credentialsModule: { issueCredential: jest.fn(() => extrinsic) }, utility: { batch: jest.fn(() => extrinsic) } } });

    const promise = service.invokeSignAndAwait(extrinsic, signer);
    handlerRef?.({ status: {} });
    handlerRef?.({ status: { isFinalized: true } });
    await expect(promise).resolves.toEqual(expect.objectContaining({ status: { isFinalized: true } }));
  });

  it('propagates signAndSend errors', async () => {
    const extrinsic = {
      signAndSend: jest.fn(async () => {
        throw new Error('boom');
      }),
    };

    const service = new TestablePolkadotService();
    service.setApi({ tx: { credentialsModule: { issueCredential: jest.fn(() => extrinsic) }, utility: { batch: jest.fn(() => extrinsic) } } });

    await expect(service.invokeSignAndAwait(extrinsic, signer)).rejects.toThrow('boom');
  });
});
