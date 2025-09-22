// Small wrapper around credential pallet extrinsics so GraphQL resolvers can mock or call real chain.
import { ApiPromise } from '@polkadot/api';

/**
 * Lightweight wrapper around credential pallet extrinsics. When no API is supplied,
 * the service behaves as a no-op so unit tests can mock behaviour without a chain.
 */
export class CredentialChainService {
  constructor(private api?: ApiPromise | null) {}

  private ensureApi(): ApiPromise | null {
    if (!this.api) {
      return null;
    }
    return this.api;
  }

  async issue(hash: Uint8Array | string, signer: any): Promise<void> {
    const api = this.ensureApi();
    if (!api) {
      return;
    }
    await api.tx.credentialPallet.issueCredential(hash).signAndSend(signer);
  }

  async revoke(hash: Uint8Array | string, reason: string | null, signer: any): Promise<void> {
    const api = this.ensureApi();
    if (!api) {
      return;
    }
    await api.tx.credentialPallet.revokeCredential(hash, reason ?? null).signAndSend(signer);
  }

  async expire(hash: Uint8Array | string, signer: any): Promise<void> {
    const api = this.ensureApi();
    if (!api) {
      return;
    }
    await api.tx.credentialPallet.expireCredential(hash).signAndSend(signer);
  }
}
