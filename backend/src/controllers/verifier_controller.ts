import { privacyClient } from '../lib/privacyClient';
import * as blockchainIntegration from '../blockchain/blockchain_integration';

type CredentialStatus = 'valid' | 'revoked' | 'unknown';

type CheckFn = (id: string) => Promise<CredentialStatus>;

export interface ProofPayload {
  credential: Record<string, unknown>;
  proof: Record<string, unknown>;
}

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null;

const isCredentialStatus = (value: unknown): value is CredentialStatus =>
  value === 'valid' || value === 'revoked' || value === 'unknown';

const ensureCredentialStatus = (value: unknown): CredentialStatus =>
  isCredentialStatus(value) ? value : 'valid';

const toCheckFn = (candidate: unknown, context?: unknown): CheckFn | undefined => {
  if (typeof candidate !== 'function') return undefined;
  return async (id: string) => {
    const result = (candidate as (identifier: string) => unknown).call(context, id);
    const resolved = await Promise.resolve(result);
    return ensureCredentialStatus(resolved);
  };
};

const getDefaultExport = (value: unknown): unknown | undefined => {
  if (!isRecord(value) || !('default' in value)) return undefined;
  return (value as Record<PropertyKey, unknown>).default;
};

const resolveCheckFn = (): CheckFn => {
  const visited = new Set<unknown>();
  const queue: unknown[] = [blockchainIntegration];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current == null || visited.has(current)) continue;

    visited.add(current);

    if (isRecord(current)) {
      const candidate = (current as Record<PropertyKey, unknown>).checkCredentialStatus;
      const fn = toCheckFn(candidate, current);
      if (fn) return fn;
    }

    const directFn = toCheckFn(current);
    if (directFn) return directFn;

    const fallback = getDefaultExport(current);
    if (fallback && !visited.has(fallback)) {
      queue.push(fallback);
    }
  }

  return async () => 'valid';
};

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

interface PresentationRequest {
  credentialId: string;
  vpToken: string;
  nonce: string;
  audience: string;
}

// Track used nonces to prevent replay attacks (in production this would be in Redis/DB)
const usedNonces = new Set<string>();

export async function verifyPresentation(
  request: PresentationRequest
): Promise<{ status: CredentialStatus; details?: unknown }> {
  const { credentialId, vpToken, nonce, audience } = request;

  // Check for replay attack
  if (usedNonces.has(nonce)) {
    return {
      status: 'unknown',
      details: { error: 'Nonce already used (replay attack)' }
    };
  }

  // Validate nonce format (basic validation)
  if (nonce.length < 16) {
    return {
      status: 'unknown',
      details: { error: 'Invalid nonce format' }
    };
  }

  // Validate audience (mock validation)
  if (!audience.includes('chai-vc')) {
    return {
      status: 'unknown',
      details: { error: 'Invalid audience' }
    };
  }

  try {
    // Mark nonce as used
    usedNonces.add(nonce);

    // Mock privacy adapter call
    const verification = await privacyClient.verifyProof({
      credential: { id: credentialId, token: vpToken },
      proof: { nonce, audience }
    });

    if (verification.valid) {
      return {
        status: 'valid',
        details: {
          verified: true,
          credentialId,
          nonce,
          audience,
          timestamp: new Date().toISOString()
        }
      };
    }

    return {
      status: 'unknown',
      details: {
        verified: false,
        reason: verification.reason,
        ...verification.details
      }
    };
  } catch (err) {
    return {
      status: 'unknown',
      details: { error: err instanceof Error ? err.message : String(err) }
    };
  }
}
