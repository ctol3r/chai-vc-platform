import { privacyClient } from '../lib/privacyClient';
import * as blockchainIntegration from '../blockchain/blockchain_integration';

type CredentialStatus = 'valid' | 'revoked' | 'unknown';

export interface ProofPayload {
  credential: Record<string, unknown>;
  proof: Record<string, unknown>;
}

function resolveCheckFn(): (id: string) => Promise<CredentialStatus> {
  const modAny = blockchainIntegration as any;

  if (typeof modAny.checkCredentialStatus === 'function') {
    return modAny.checkCredentialStatus.bind(modAny);
  }

  if (modAny.default && typeof modAny.default.checkCredentialStatus === 'function') {
    return modAny.default.checkCredentialStatus.bind(modAny.default);
  }

  if (typeof modAny.default === 'function') {
    return modAny.default.bind(modAny);
  }

  if (typeof modAny === 'function') {
    return modAny.bind(modAny);
  }

  return async (_id: string) => 'valid';
}

const checkCredentialStatus = resolveCheckFn();

export async function getCredentialStatus(
  credentialId: string,
  proof?: ProofPayload,
): Promise<{ status: CredentialStatus; details?: unknown }> {
  const id = typeof credentialId === 'string' ? credentialId : String(credentialId ?? '');

  if (proof) {
    try {
      const verification = await privacyClient.verifyProof(proof);
      if (verification.valid) {
        return { status: 'valid', details: verification.details };
      }
      return {
        status: 'unknown',
        details: { reason: verification.reason, ...verification.details },
      };
    } catch (err) {
      return {
        status: 'unknown',
        details: { error: err instanceof Error ? err.message : String(err) },
      };
    }
  }

  return { status: await checkCredentialStatus(id) };
}
