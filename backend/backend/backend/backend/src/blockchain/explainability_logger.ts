import { PolkadotService } from './polkadot_service';
const service = new PolkadotService();
const endpoint = process.env.POLKADOT_ENDPOINT || 'ws://127.0.0.1:9944';
await service.connect(endpoint);

export async function logExplainability(payload: any) {
  if (typeof (service as any).anchorData === 'function') {
    await (service as any).anchorData(payload).catch((err) => {
      console.warn('anchorData failed (nonfatal in test):', err?.message || err);
    });
  }
}
