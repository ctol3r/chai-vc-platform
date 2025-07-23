import { ApiPromise, WsProvider, SubmittableExtrinsic } from '@polkadot/api';

// Basic Polkadot service for interacting with a chain.
export class PolkadotService {
  private api: ApiPromise | null = null;

  /** Initialize the API connection. */
  async init(endpoint: string): Promise<void> {
    const provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({ provider });
  }

  private ensureApi(): ApiPromise {
    if (!this.api) {
      throw new Error('Polkadot API not initialized');
    }
    return this.api;
  }

  /**
   * Create an extrinsic that sets the expiry time for a credential.
   * @param credentialId Identifier of the credential.
   * @param expiryUnix Expiry timestamp (in seconds since epoch).
   */
  createCredentialExpiryExtrinsic(
    credentialId: string,
    expiryUnix: number
  ): SubmittableExtrinsic<'promise'> {
    const api = this.ensureApi();
    return api.tx.credentials.setExpiry(credentialId, expiryUnix);
  }

  /**
   * Create an extrinsic that stores a renewal reminder for a credential.
   * @param credentialId Identifier of the credential.
   * @param expiryUnix Expiry timestamp of the credential.
   * @param daysBefore Number of days before expiry to trigger the reminder.
   */
  createLicenseRenewalReminderExtrinsic(
    credentialId: string,
    expiryUnix: number,
    daysBefore: number
  ): SubmittableExtrinsic<'promise'> {
    const api = this.ensureApi();
    return api.tx.credentials.setRenewalReminder(
      credentialId,
      expiryUnix,
      daysBefore
    );
  }
}
