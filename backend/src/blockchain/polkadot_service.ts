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

export type ChainTxStatus = 'mock-finalized';

export interface ChainTxResult {
  txHash: string;
  status: ChainTxStatus;
}

function mockTxHash(hash: string): string {
  const trimmed = hash?.replace(/^0x/i, '') ?? '';
  const slice = trimmed.slice(0, 16).padEnd(16, '0');
  return `0x${slice.toLowerCase()}`;
}

export class PolkadotService {
  async issueCredential(hash: string, _signer?: unknown): Promise<ChainTxResult> {
    return {
      txHash: mockTxHash(hash),
      status: 'mock-finalized',
    };
  }

  async revokeCredential(hash: string, _reason?: string): Promise<ChainTxResult> {
    return {
      txHash: mockTxHash(hash),
      status: 'mock-finalized',
    };
  }

  async authorizeIssuer(_account: string): Promise<void> {
    // no-op mock
  }

  async deauthorizeIssuer(_account: string): Promise<void> {
    // no-op mock
  }

  async connect(_endpoint: string): Promise<void> {
    // no-op mock
  }

  async storeAuditRecord(_record: AuditRecord): Promise<void> {
    // no-op mock
  }

  async recordErasure(_record: ErasureRecord): Promise<void> {
    // no-op mock
  }

  scheduleKeyRotation(_newKey: string, _transitionTime: number): void {
    // no-op mock
  }

  getSigningKey(_currentTime: number = Date.now()): string {
    return 'mock-signing-key';
  }
}
