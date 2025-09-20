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
  ): Promise<void> {
    try {
      const result = await tx.signAndSend(signer);
      if (result.dispatchError) {
        if (result.dispatchError.isModule) {
          const meta = api.registry.findMetaError(result.dispatchError.asModule);
          throw new Error(`Extrinsic failed: ${meta.section}.${meta.name}`);
        }
        throw new Error(result.dispatchError.toString());
      }
      if (!(result.status.isFinalized || result.status.isInBlock)) {
        console.warn('Extrinsic submitted but not yet confirmed');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
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

  /** Issue a credential to a destination account. */
  async issueCredential(
    signer: KeyringPair,
    dest: string,
    data: string
  ): Promise<SubmittableResult> {
    if (!this.api) {
      throw new Error('API not connected');
    }
    const tx = this.api.tx.credentialsModule.issueCredential(dest, data);
    return tx.signAndSend(signer);
  }

  /**
   * Batch multiple credential issuance calls into a single extrinsic using
   * the utility.batch function.
   */
  async batchIssueCredentials(
    signer: KeyringPair,
    destinations: string[],
    data: string[]
  ): Promise<SubmittableResult> {
    if (!this.api) {
      throw new Error('API not connected');
    }
    if (destinations.length !== data.length) {
      throw new Error('Array lengths must match');
    }
    const calls = destinations.map((dest, i) =>
      this.api!.tx.credentialsModule.issueCredential(dest, data[i])
    );
    const batch = this.api.tx.utility.batch(calls);
    return batch.signAndSend(signer);
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
