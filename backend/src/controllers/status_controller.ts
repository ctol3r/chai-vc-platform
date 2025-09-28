type CredentialStatus = 'active' | 'revoked' | 'expired' | 'unknown';

interface StatusResponse {
  credentialId: string;
  status: CredentialStatus;
  issuedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  reason?: string;
}

// Mock storage for revoked credentials (in production this would be in a database)
const revokedCredentials = new Map<string, { revokedAt: string; reason?: string }>();

// Mock credential registry for testing
const mockCredentials = new Map<string, { issuedAt: string; expiresAt: string }>([
  ['cred_test_123', {
    issuedAt: '2024-01-01T00:00:00Z',
    expiresAt: '2026-01-01T00:00:00Z'
  }],
  ['cred_expired_456', {
    issuedAt: '2022-01-01T00:00:00Z',
    expiresAt: '2023-01-01T00:00:00Z'
  }]
]);

export async function getStatus(credentialId: string): Promise<StatusResponse> {
  // Check if credential is revoked
  const revocationInfo = revokedCredentials.get(credentialId);
  if (revocationInfo) {
    return {
      credentialId,
      status: 'revoked',
      revokedAt: revocationInfo.revokedAt,
      reason: revocationInfo.reason
    };
  }

  // Check if credential exists in mock registry
  const credentialInfo = mockCredentials.get(credentialId);
  if (!credentialInfo) {
    return {
      credentialId,
      status: 'unknown'
    };
  }

  // Check if credential is expired
  const now = new Date();
  const expiresAt = new Date(credentialInfo.expiresAt);

  if (now > expiresAt) {
    return {
      credentialId,
      status: 'expired',
      issuedAt: credentialInfo.issuedAt,
      expiresAt: credentialInfo.expiresAt
    };
  }

  // Credential is active
  return {
    credentialId,
    status: 'active',
    issuedAt: credentialInfo.issuedAt,
    expiresAt: credentialInfo.expiresAt
  };
}

export async function revokeCredential(
  credentialId: string,
  reason?: string
): Promise<{ success: boolean; credentialId: string; revokedAt: string }> {
  const revokedAt = new Date().toISOString();

  // Store revocation info
  revokedCredentials.set(credentialId, {
    revokedAt,
    reason
  });

  return {
    success: true,
    credentialId,
    revokedAt
  };
}