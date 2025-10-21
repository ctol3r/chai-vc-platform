/**
 * JWT helpers for Pilot P0.
 * Minimal decode/verify; cryptographic hardening in future phases.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pilot-p0-secret';

export interface JWTPayload {
  jti?: string;
  credentialId?: string;
  sub?: string;
  iss?: string;
  nbf?: number;
  exp?: number;
  [key: string]: any;
}

/**
 * Decode JWT without full verification (for inspection).
 * Returns the payload or null if malformed.
 */
export function decodeJwt(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as JWTPayload;
  } catch (e) {
    return null;
  }
}

/**
 * Verify JWT signature.
 * For pilot P0, we do basic shape validation and optional HS256 check.
 */
export function verifySig(token: string): boolean {
  try {
    // Basic format check
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Attempt signature verification if secret is set
    if (JWT_SECRET) {
      jwt.verify(token, JWT_SECRET);
    }

    return true;
  } catch (e) {
    // Signature verification failed
    return false;
  }
}

/**
 * Create a signed JWT for credential issuance.
 */
export function createCredentialJWT(payload: JWTPayload): string {
  // If exp is already in payload, don't use expiresIn option
  const options: any = {};
  if (!payload.exp) {
    options.expiresIn = '365d'; // 1 year default
  }
  
  return jwt.sign(payload, JWT_SECRET, options);
}
