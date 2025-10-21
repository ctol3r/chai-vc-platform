/**
 * JWT decode/verify helpers for Pilot P0
 * Minimal implementation for pilot - proper crypto comes in next phase
 */

export interface JwtPayload {
  jti?: string;
  credentialId?: string;
  sub?: string;
  iss?: string;
  nbf?: number;
  exp?: number;
  [key: string]: any;
}

/**
 * Decode JWT payload without verification
 * Returns parsed payload or throws on invalid format
 */
export function decodeJwt(jwt: string): JwtPayload {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    // Add padding if needed for base64url decoding
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Failed to decode JWT payload');
  }
}

/**
 * Verify JWT signature
 * For pilot: minimal check for proper shape + optional HS256 verification
 */
export function verifySig(jwt: string): boolean {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Check if all parts are valid base64url
    for (const part of parts) {
      if (!part || !/^[A-Za-z0-9_-]+$/.test(part)) {
        return false;
      }
    }

    // For pilot: if JWT_SECRET is set, do basic HS256 verification
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      const crypto = require('crypto');
      const [header, payload, signature] = parts;
      const data = `${header}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha256', jwtSecret)
        .update(data)
        .digest('base64url');
      
      return signature === expectedSignature;
    }

    // Without secret, just validate format
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Create a simple JWT for pilot (HS256)
 */
export function createJwt(payload: JwtPayload): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const jwtSecret = process.env.JWT_SECRET || 'pilot-secret';
  const crypto = require('crypto');

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${encodedHeader}.${encodedPayload}`;
  
  const signature = crypto
    .createHmac('sha256', jwtSecret)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}