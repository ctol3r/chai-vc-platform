import {
  HardwareWallet,
  LedgerWallet,
  YubiKeyWallet,
} from './hardware_wallet';

let issuerWallet: HardwareWallet | null = null;

/**
 * Initialize the issuer wallet using hardware-backed storage.
 * Only YubiKey or Ledger devices are supported.
 */
export function initializeIssuerWallet(type: 'yubikey' | 'ledger'): void {
  issuerWallet = type === 'yubikey' ? new YubiKeyWallet() : new LedgerWallet();
}

/**
 * Sign arbitrary data with the issuer's hardware wallet.
 * Throws if the wallet has not been initialized.
 */
export async function signWithIssuerWallet(data: Buffer): Promise<Buffer> {
  if (!issuerWallet) {
    throw new Error(
      'Issuer wallet not initialized. Use a hardware wallet such as YubiKey or Ledger.'
    );
  }

  await issuerWallet.connect();
  return issuerWallet.sign(data);
}
