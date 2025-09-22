import { ApiPromise, SubmittableResult, WsProvider } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { Keyring } from '@polkadot/keyring';
import type { KeyringPair } from '@polkadot/keyring/types';
import { KeyRotationPolicy } from './key_rotation_policy';

export type ChainTxStatus = 'IN_BLOCK' | 'FINALIZED';

export interface ChainTxResult {
  txHash: string;
  status: ChainTxStatus;
}

export interface AuditRecord {
  userId: string;
  action: string;
  timestamp: number;
}

export interface ErasureRecord {
  userId: string;
  dataHash: string;
  timestamp: number;
}

const SKIP_ENV = 'SKIP_REAL_POLKADOT';

const isSkipEnabled = (): boolean => {
  const raw = process.env[SKIP_ENV];
  if (typeof raw === 'undefined') {
    return true;
  }
  return raw.toLowerCase() === 'true';
};

const buildMockResult = (seed: string): ChainTxResult => {
  const normalized = seed
    .replace(/[^a-zA-Z0-9]/g, '')
    .padEnd(12, '0')
    .slice(0, 12)
    .toLowerCase();
  return {
    txHash: `0xmock-${normalized || '000000000000'}`,
    status: 'FINALIZED',
  };
};

const createMockSigner = (): KeyringPair => ({
  address: 'mock-admin',
} as unknown as KeyringPair);

/**
 * Thin wrapper around Polkadot-JS with configurable mock fallback for tests and local dev.
 */
export class PolkadotService {
  private api: ApiPromise | null = null;
  private adminSigner: KeyringPair | null = null;
  private readonly keyPolicy: KeyRotationPolicy;

  constructor(initialKey?: string) {
    this.keyPolicy = new KeyRotationPolicy(initialKey || 'default-key');
  }

  private async ensureApi(): Promise<ApiPromise | null> {
    if (isSkipEnabled()) {
      return null;
    }

    if (!this.api) {
      const endpoint = process.env.POLKADOT_WS_ENDPOINT || 'ws://127.0.0.1:9944';
      await this.connect(endpoint);
    }

    return this.api;
  }

  private async ensureAdminSigner(): Promise<KeyringPair> {
    if (this.adminSigner) {
      return this.adminSigner;
    }

    if (isSkipEnabled()) {
      this.adminSigner = createMockSigner();
      return this.adminSigner;
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const seed = process.env.TRUST_REGISTRY_ADMIN_SEED || '//Alice';
    this.adminSigner = keyring.addFromUri(seed);
    return this.adminSigner;
  }

  private async submitAndFinalize(
    api: ApiPromise,
    tx: SubmittableExtrinsic<'promise', SubmittableResult>,
    signer: KeyringPair
  ): Promise<ChainTxResult> {
    return new Promise((resolve, reject) => {
      let unsubscribe: (() => void) | undefined;

      const cleanup = () => {
        if (unsubscribe) {
          try {
            unsubscribe();
          } catch (err) {
            console.warn('Failed to unsubscribe Polkadot extrinsic', err);
          }
        }
      };

      tx
        .signAndSend(signer, (result) => {
          if (result.dispatchError) {
            cleanup();
            if (result.dispatchError.isModule) {
              const meta = api.registry.findMetaError(result.dispatchError.asModule);
              reject(new Error(`Extrinsic failed: ${meta.section}.${meta.name}`));
            } else {
              reject(new Error(result.dispatchError.toString()));
            }
            return;
          }

          if (result.status.isInBlock || result.status.isFinalized) {
            const status: ChainTxStatus = result.status.isFinalized ? 'FINALIZED' : 'IN_BLOCK';
            const txHash = result.txHash?.toHex?.() ?? tx.hash.toHex();
            cleanup();
            resolve({ txHash, status });
          }
        })
        .then((unsub) => {
          unsubscribe = unsub;
        })
        .catch((error) => {
          cleanup();
          reject(error instanceof Error ? error : new Error(String(error)));
        });
    });
  }

  async authorizeIssuer(account: string): Promise<void> {
    if (isSkipEnabled()) {
      console.info('Skipping authorizeIssuer due to %s flag', SKIP_ENV);
      return;
    }

    const api = await this.ensureApi();
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    const signer = await this.ensureAdminSigner();
    const tx = api.tx.credentialPallet.authorizeIssuer(account);
    await this.submitAndFinalize(api, tx, signer);
  }

  async deauthorizeIssuer(account: string): Promise<void> {
    if (isSkipEnabled()) {
      console.info('Skipping deauthorizeIssuer due to %s flag', SKIP_ENV);
      return;
    }

    const api = await this.ensureApi();
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    const signer = await this.ensureAdminSigner();
    const tx = api.tx.credentialPallet.deauthorizeIssuer(account);
    await this.submitAndFinalize(api, tx, signer);
  }

  async connect(endpoint?: string): Promise<void> {
    if (isSkipEnabled()) {
      this.api = null;
      return;
    }

    const target = endpoint || process.env.POLKADOT_WS_ENDPOINT || 'ws://127.0.0.1:9944';
    const provider = new WsProvider(target);
    this.api = await ApiPromise.create({ provider });
  }

  async issueCredential(hash: string, signer?: KeyringPair): Promise<ChainTxResult> {
    if (isSkipEnabled()) {
      return buildMockResult(hash);
    }

    const api = await this.ensureApi();
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    const signingAccount = signer ?? (await this.ensureAdminSigner());
    const tx = api.tx.credentialPallet.issueCredential(hash);
    return this.submitAndFinalize(api, tx, signingAccount);
  }

  async revokeCredential(
    hash: string,
    reason?: string,
    signer?: KeyringPair
  ): Promise<ChainTxResult> {
    if (isSkipEnabled()) {
      const seed = reason ? `${hash}:${reason}` : hash;
      return buildMockResult(seed);
    }

    const api = await this.ensureApi();
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    const signingAccount = signer ?? (await this.ensureAdminSigner());
    const tx = reason
      ? api.tx.credentialPallet.revokeCredential(hash, reason)
      : api.tx.credentialPallet.revokeCredential(hash);
    return this.submitAndFinalize(api, tx, signingAccount);
  }

  async anchorProof(payloadHash: string, signer?: KeyringPair): Promise<ChainTxResult> {
    if (isSkipEnabled()) {
      return buildMockResult(payloadHash);
    }

    return this.issueCredential(payloadHash, signer);
  }

  async anchorData(
    data: string | Record<string, unknown>,
    signer?: KeyringPair
  ): Promise<ChainTxResult> {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    return this.anchorProof(payload, signer);
  }

  async storeAuditRecord(record: AuditRecord): Promise<void> {
    if (isSkipEnabled()) {
      console.info('Skipping storeAuditRecord for %s', record.userId);
      return;
    }

    await this.ensureApi();
    console.info('storeAuditRecord real-chain integration pending implementation.');
  }

  async recordErasure(record: ErasureRecord): Promise<void> {
    if (isSkipEnabled()) {
      console.info('Skipping recordErasure for %s', record.userId);
      return;
    }

    await this.ensureApi();
    console.info('recordErasure real-chain integration pending implementation.');
  }

  scheduleKeyRotation(newKey: string, transitionTime: number): void {
    this.keyPolicy.scheduleRotation(newKey, transitionTime);
  }

  getSigningKey(currentTime: number = Date.now()): string {
    return this.keyPolicy.getActiveKey(currentTime);
  }
}

export default PolkadotService;
