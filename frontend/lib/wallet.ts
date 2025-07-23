export interface WalletEvent {
  id: string;
  label: string;
  timestamp: string;
}

export function mintSampleCmeToken(): WalletEvent {
  const now = new Date().toISOString();
  return {
    id: 'sample-cme-token',
    label: 'CME Certification Minted',
    timestamp: now,
  };
}
