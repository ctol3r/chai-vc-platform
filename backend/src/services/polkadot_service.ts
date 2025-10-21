import { PolkadotService } from '../blockchain/polkadot_service';

export async function tryAnchor(hash: string): Promise<void> {
  try {
    const service = new PolkadotService();
    await service.issueCredential(hash);
  } catch (e) {
    console.warn('anchor_failed_nonblocking', { hash, error: e });
  }
}
