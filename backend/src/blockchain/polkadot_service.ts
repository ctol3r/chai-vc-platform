import { ApiPromise, SubmittableResult, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import { KeyRotationPolicy } from './key_rotation_policy';

export interface ErasureRecord {
  userId: string;
  dataHash: string;
  timestamp: number;
}

export interface AuditRecord {
  userId: string;
  action: string;
  timestamp: number;
}

export type ChainTxStatus = 'IN_BLOCK' | 'FINALIZED';

export interface ChainTxResult {
  txHash: string;
  status: ChainTxStatus;
}

/**
 * Service wrapping Polkadot-js API interactions.
 */
export class PolkadotService {
  private api: ApiPromise | null = null;
  private keyPolicy: KeyRotationPolicy;
  private adminSigner: KeyringPair | null = null;

  constructor(initialKey?: string) {
    this.keyPolicy = new KeyRotationPolicy(initialKey || 'default-key');
  }

  private async ensureApi(): Promise<ApiPromise | null> {
    if (!this.api) {
      const endpoint = process.env.POLKADOT_WS_ENDPOINT || 'ws://127.0.0.1:9944';
      try {
        await this.connect(endpoint);
      } catch (error) {
        console.error('Failed to connect to Polkadot endpoint', error);
        return null;
      }
    }
    return this.api;
  }

  private async ensureAdminSigner(): Promise<KeyringPair> {
    if (this.adminSigner) {
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
          } catch (e) {
            console.warn('Failed to unsubscribe from extrinsic status', e);
          }
        }
      };

      tx.signAndSend(signer, (result) => {
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
    const api = await this.ensureApi();
    if (!api) {
      throw new Error('Polkadot API not connected');
    }
    const signer = await this.ensureAdminSigner();
    const tx = api.tx.credentialPallet.authorizeIssuer(account);
    await this.submitAndFinalize(api, tx, signer);
  }

  async deauthorizeIssuer(account: string): Promise<void> {
    const api = await this.ensureApi();
    if (!api) {
      throw new Error('Polkadot API not connected');
    }
    const signer = await this.ensureAdminSigner();
    const tx = api.tx.credentialPallet.deauthorizeIssuer(account);
    await this.submitAndFinalize(api, tx, signer);
  }

  /** Connect to a chain endpoint using WebSockets. */
  async connect(endpoint: string): Promise<void> {
    const provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({ provider });
  }

  async issueCredential(hash: string, signer?: KeyringPair): Promise<ChainTxResult> {
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

  /** Store audit record on-chain for immutable tracking. */
  async storeAuditRecord(record: AuditRecord): Promise<void> {
    // This is a placeholder for the actual interaction with the Polkadot
    // blockchain which would store a hash of the audit data.
    console.log('Storing record on-chain:', record);
  }

  /**
   * Persist an anonymized erasure record to the blockchain.
   * The implementation is a stub for demonstration purposes.
   */
  async recordErasure(record: ErasureRecord): Promise<void> {
    // In a real implementation, this would submit a transaction to the chain.
    console.log('Recording erasure on-chain:', record);
  }

  /**
   * Schedule rotation of the signing key used for transactions.
   */
  scheduleKeyRotation(newKey: string, transitionTime: number): void {
    this.keyPolicy.scheduleRotation(newKey, transitionTime);
  }

  /**
   * Retrieve the key that should be used for signing at the given time.
   */
  getSigningKey(currentTime: number = Date.now()): string {
    return this.keyPolicy.getActiveKey(currentTime);
  }
}
