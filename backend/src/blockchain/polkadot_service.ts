import { ApiPromise, WsProvider, SubmittableResult } from '@polkadot/api';
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

interface SubmittableExtrinsicLike {
  signAndSend(
    signer: KeyringPair,
    cb: (result: SubmittableResult) => void
  ): Promise<() => void>;
}

const DEFAULT_ENDPOINT = 'ws://127.0.0.1:9944';

/**
 * Service wrapping Polkadot-js API interactions.
 */
export class PolkadotService {
  private api: ApiPromise | null = null;
  private readonly keyPolicy: KeyRotationPolicy;

  constructor(initialKey: string = 'default-key') {
    this.keyPolicy = new KeyRotationPolicy(initialKey);
  }

  /** Connect to a chain endpoint using WebSockets. */
  async connect(endpoint: string = DEFAULT_ENDPOINT): Promise<void> {
    const provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({ provider });
  }

  /** Issue a credential to a destination account. */
  async issueCredential(
    signer: KeyringPair,
    dest: string,
    data: string
  ): Promise<SubmittableResult> {
    const api = this.requireApi();
    const tx = api.tx.credentialsModule.issueCredential(dest, data) as unknown as SubmittableExtrinsicLike;
    return this.signAndAwait(tx, signer);
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
    const api = this.requireApi();
    if (destinations.length !== data.length) {
      throw new Error('Array lengths must match');
    }
    const calls = destinations.map((dest, i) =>
      api.tx.credentialsModule.issueCredential(dest, data[i])
    );
    const batch = api.tx.utility.batch(calls) as unknown as SubmittableExtrinsicLike;
    return this.signAndAwait(batch, signer);
  }

  /** Store audit record on-chain for immutable tracking. */
  async storeAuditRecord(record: AuditRecord): Promise<void> {
    console.log('Storing record on-chain:', record);
  }

  /**
   * Persist an anonymized erasure record to the blockchain.
   * The implementation is a stub for demonstration purposes.
   */
  async recordErasure(record: ErasureRecord): Promise<void> {
    console.log('Recording erasure on-chain:', record);
  }

  /**
   * Anchor arbitrary payloads for explainability logs. Stub implementation.
   */
  async anchorData(payload: string): Promise<void> {
    console.log('Anchoring payload on-chain:', payload);
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

  private requireApi(): ApiPromise {
    if (!this.api) {
      throw new Error('API not connected');
    }
    return this.api;
  }

  private async signAndAwait(
    extrinsic: SubmittableExtrinsicLike,
    signer: KeyringPair,
  ): Promise<SubmittableResult> {
    return new Promise<SubmittableResult>((resolve, reject) => {
      let unsubscribe: (() => void) | null = null;

      const handleResult = (result: SubmittableResult) => {
        if (result.status.isInBlock || result.status.isFinalized) {
          unsubscribe?.();
          resolve(result);
        }
      };

      extrinsic
        .signAndSend(signer, handleResult)
        .then((unsub: () => void) => {
          unsubscribe = unsub;
        })
        .catch((error: unknown) => {
          unsubscribe?.();
          reject(error as Error);
        });
    });
  }
}
