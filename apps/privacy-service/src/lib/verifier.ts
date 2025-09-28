import { verifyDisclosureProof, verifyCredential, type DisclosureProof, type IssuedCredential } from './bbsplus';

export interface VerifyRequest {
  credential: IssuedCredential;
  proof: DisclosureProof;
}

export interface VerificationResult {
  valid: boolean;
  checkedAt: string;
  reason?: string;
  details: Record<string, unknown>;
}

export function verifyProof(request: VerifyRequest): VerificationResult {
  const credentialValid = verifyCredential(request.credential);
  const report = verifyDisclosureProof(request.proof, request.credential);

  const valid = credentialValid && report.valid;

  return {
    valid,
    checkedAt: new Date().toISOString(),
    reason: valid ? undefined : report.reason ?? (credentialValid ? undefined : 'invalid-credential'),
    details: {
      strategy: 'bbs+v1-stub',
      credentialValid,
      ...report.details,
    },
  };
}
