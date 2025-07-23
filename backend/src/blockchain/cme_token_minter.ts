export interface CmeToken {
  id: string;
  name: string;
  issuedAt: string;
}

export function mintSampleCmeToken(): CmeToken {
  const now = new Date().toISOString();
  return {
    id: 'sample-cme-token',
    name: 'CME Certification',
    issuedAt: now,
  };
}
