/**
 * Deterministic blockchain integration stub used in tests and local dev.
 * Provides both named and default exports so code written for real
 * integrations continues to work without coupling on the implementation.
 */

export type CredentialStatus = 'valid' | 'revoked' | 'unknown';

type StatusKeyword = {
  keyword: string;
  status: CredentialStatus;
};

const STATUS_KEYWORDS: StatusKeyword[] = [
  { keyword: 'revoked', status: 'revoked' },
  { keyword: 'unknown', status: 'unknown' },
];

/**
 * Looks at the credential id string and returns a predictable status.
 * Tests can encode the desired outcome in the id (e.g. "credential-revoked").
 */
export async function checkCredentialStatus(credentialId: unknown): Promise<CredentialStatus> {
  const id = typeof credentialId === 'string' ? credentialId : String(credentialId ?? '');
  const normalized = id.trim().toLowerCase();

  for (const { keyword, status } of STATUS_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return status;
    }
  }

  return 'valid';
}

const blockchainIntegration = Object.freeze({ checkCredentialStatus });
export default blockchainIntegration;
export type BlockchainIntegrationStub = typeof blockchainIntegration;
