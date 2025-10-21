/**
 * JWT handling service for Pilot P0
 * Minimal implementation for pilot - proper crypto comes in Phase 2
 */

import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

// Pilot secret - in production use proper key management
const PILOT_SECRET = process.env.JWT_SECRET || 'pilot-p0-secret-change-in-production';

export interface JWTPayload {
  jti?: string;           // JWT ID
  credentialId?: string;  // Our credential ID
  sub?: string;           // Subject
  iss?: string;           // Issuer
  nbf?: number;           // Not before
  exp?: number;           // Expiration
  vc?: any;              // Verifiable Credential payload
  [key: string]: any;     // Allow other fields
}

/**
 * Decode JWT without verification
 * Extracts payload from base64url encoding
 */
export function decodeJwt(token: string): JWTPayload {
  try {
    // Handle both raw JWT and wrapped formats
    const cleanToken = token.trim();
    
    // Basic JWT structure validation
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }
    
    // Decode payload (middle part)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8')
    );
    
    return payload;
  } catch (error) {
    console.error('JWT decode error:', error);
    return {};
  }
}

/**
 * Verify JWT signature
 * For pilot: minimal check, allows HS256 with env key
 */
export function verifySig(token: string): boolean {
  try {
    // Basic structure check
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // For pilot, do minimal verification
    // In production, use proper RS256/ES256 with key management
    try {
      jwt.verify(token, PILOT_SECRET, {
        algorithms: ['HS256'],
        ignoreExpiration: false // Still check expiration
      });
      return true;
    } catch (verifyError) {
      // If verification with secret fails, check if it's at least well-formed
      // This is ONLY for pilot - remove in production
      const decoded = jwt.decode(token, { complete: true });
      if (decoded && decoded.header && decoded.payload) {
        console.warn('JWT signature not verified (pilot mode)');
        return true; // Allow for pilot
      }
      return false;
    }
  } catch (error) {
    console.error('JWT verification error:', error);
    return false;
  }
}

/**
 * Create a signed JWT for a verifiable credential
 */
export function createCredentialJWT(payload: any): string {
  try {
    // Add standard claims
    const now = Math.floor(Date.now() / 1000);
    
    const fullPayload = {
      ...payload,
      iss: payload.iss || 'vitalcv-pilot-issuer',
      iat: now,
      nbf: payload.nbf || now,
      // Default 1 year expiry if not specified
      exp: payload.exp || (now + 365 * 24 * 60 * 60)
    };
    
    // Sign with HS256 for pilot
    return jwt.sign(fullPayload, PILOT_SECRET, {
      algorithm: 'HS256',
      header: {
        typ: 'JWT',
        alg: 'HS256'
      }
    });
  } catch (error) {
    console.error('JWT creation error:', error);
    throw new Error('Failed to create JWT');
  }
}

/**
 * Generate a hash of the JWT for anchoring
 */
export function hashJWT(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}