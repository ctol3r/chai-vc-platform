import { randomBytes, createHash } from 'crypto';
import { createJWS, verifyJWS, getSigningKeyPair } from './ed25519';

/**
 * SD-JWT (Selective Disclosure JWT) utilities
 * Implements basic SD-JWT draft spec for selective disclosure
 */

export interface SDJWTClaim {
  key: string;
  value: any;
  selectable: boolean;
}

export interface SDJWTSalt {
  claim: string;
  salt: string;
  hash: string;
}

export interface SDJWTIssueResult {
  token: string;
  salts: SDJWTSalt[];
  disclosures: string[];
  preview: any;
}

export interface SDJWTVerifyResult {
  valid: boolean;
  claims: any;
  errors?: string[];
}

/**
 * Generate a cryptographically secure salt
 */
export function generateSalt(length: number = 16): string {
  return randomBytes(length).toString('base64url');
}

/**
 * Hash a claim with salt for selective disclosure
 */
export function hashClaim(salt: string, key: string, value: any): string {
  const claim = JSON.stringify([salt, key, value]);
  return createHash('sha256').update(claim).digest('base64url');
}

/**
 * Create a disclosure for a claim
 */
export function createDisclosure(salt: string, key: string, value: any): string {
  const disclosure = JSON.stringify([salt, key, value]);
  return Buffer.from(disclosure).toString('base64url');
}

/**
 * Issue an SD-JWT with selective disclosure
 * Now using Ed25519 instead of HMAC
 */
export async function issueSDJWT(
  claims: SDJWTClaim[],
  issuer: string,
  subject: string,
  signingKey: string
): Promise<SDJWTIssueResult> {
  const salts: SDJWTSalt[] = [];
  const disclosures: string[] = [];
  const _sd: string[] = [];
  const payload: any = {
    iss: issuer,
    sub: subject,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year
  };

  // Process each claim
  claims.forEach((claim) => {
    if (claim.selectable) {
      // Create selective disclosure for this claim
      const salt = generateSalt();
      const hash = hashClaim(salt, claim.key, claim.value);
      const disclosure = createDisclosure(salt, claim.key, claim.value);

      salts.push({
        claim: claim.key,
        salt,
        hash,
      });

      disclosures.push(disclosure);
      _sd.push(hash);
    } else {
      // Include claim directly in JWT
      payload[claim.key] = claim.value;
    }
  });

  // Add selective disclosure array if any
  if (_sd.length > 0) {
    payload._sd = _sd;
    payload._sd_alg = 'sha-256';
  }

  // Sign the JWT with Ed25519
  const token = await createJWS(payload, signingKey);

  // Build SD-JWT format: JWT~disclosure1~disclosure2~...
  const sdJWT = [token, ...disclosures].join('~');

  // Create human-readable preview
  const preview = {
    ...payload,
    _selectiveDisclosure: claims
      .filter((c) => c.selectable)
      .map((c) => ({ key: c.key, value: c.value })),
  };

  return {
    token: sdJWT,
    salts,
    disclosures,
    preview,
  };
}

/**
 * Verify an SD-JWT and extract disclosed claims
 * Now using Ed25519 verification
 */
export async function verifySDJWT(
  sdJWT: string,
  verifyKey: string,
  requiredDisclosures?: string[]
): Promise<SDJWTVerifyResult> {
  try {
    const parts = sdJWT.split('~');
    const token = parts[0];
    const disclosures = parts.slice(1).filter((d) => d.length > 0);

    // Verify JWT signature with Ed25519
    const verifyResult = await verifyJWS(token, verifyKey);
    if (!verifyResult.valid || !verifyResult.payload) {
      return {
        valid: false,
        claims: {},
        errors: [verifyResult.error || 'Signature verification failed'],
      };
    }
    const payload: any = verifyResult.payload;

    const claims: any = { ...payload };
    const errors: string[] = [];

    // Process disclosures
    if (disclosures.length > 0 && payload._sd) {
      const revealedHashes = new Set<string>();

      disclosures.forEach((disclosure) => {
        try {
          const decoded = Buffer.from(disclosure, 'base64url').toString('utf-8');
          const [salt, key, value] = JSON.parse(decoded);

          // Verify hash
          const hash = hashClaim(salt, key, value);
          if (payload._sd.includes(hash)) {
            claims[key] = value;
            revealedHashes.add(hash);
          } else {
            errors.push(`Invalid disclosure for claim: ${key}`);
          }
        } catch (err: any) {
          errors.push(`Failed to decode disclosure: ${err.message}`);
        }
      });

      // Check if required disclosures are present
      if (requiredDisclosures) {
        requiredDisclosures.forEach((required) => {
          if (!claims[required]) {
            errors.push(`Required claim not disclosed: ${required}`);
          }
        });
      }

      // Clean up SD-JWT metadata from final claims
      delete claims._sd;
      delete claims._sd_alg;
    }

    return {
      valid: errors.length === 0,
      claims,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (err: any) {
    return {
      valid: false,
      claims: {},
      errors: [err.message || 'Verification failed'],
    };
  }
}

/**
 * Extract disclosures for specific claims from an SD-JWT
 */
export function selectDisclosures(
  sdJWT: string,
  claimsToDisclose: string[]
): string {
  const parts = sdJWT.split('~');
  const token = parts[0];
  const allDisclosures = parts.slice(1).filter((d) => d.length > 0);

  const selectedDisclosures: string[] = [];

  allDisclosures.forEach((disclosure) => {
    try {
      const decoded = Buffer.from(disclosure, 'base64url').toString('utf-8');
      const [, key] = JSON.parse(decoded);
      if (claimsToDisclose.includes(key)) {
        selectedDisclosures.push(disclosure);
      }
    } catch {
      // Skip invalid disclosures
    }
  });

  return [token, ...selectedDisclosures].join('~');
}
