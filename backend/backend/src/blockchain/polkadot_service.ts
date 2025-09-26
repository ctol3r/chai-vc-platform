import { ApiPromise } from '@polkadot/api';
import type { SubmittableResult } from '@polkadot/api';

export class PolkadotService {
  api!: ApiPromise;

  async connect(endpoint: string): Promise<void> {
    // Minimal stub for tests; replace with real connection logic.
    // e.g. this.api = await ApiPromise.create({ provider: ... });
    return;
  }

  async anchorProof(payload: any): Promise<SubmittableResult | any> {
    // If real `tx` available: return (tx.signAndSend(signer) as unknown) as Promise<SubmittableResult>;
    // For tests keep a safe no-op result
    return { status: 'submitted', payload };
  }
}
