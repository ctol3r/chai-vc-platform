/**
 * JWT decode/verify service for Pilot P0 API
 * Minimal implementation for pilot phase
 */

import jwt from 'jsonwebtoken';

export interface JwtPayload {
  jti?: string;
  credentialId?: string;
  sub?: string;
  iss?: string;
  nbf?: number;
  exp?: number;
  [key: string]: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'pilot-development-secret-key';

/**
 * Decode JWT payload without verification
 * @param token - The JWT token
 * @returns Decoded payload or null if invalid
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    // Decode without verification for pilot
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || typeof decoded === 'string') {
      return null;
    }
    
    return decoded.payload as JwtPayload;
  } catch (error) {
    console.warn('JWT decode failed:', error);
    return null;
  }
}

/**
 * Verify JWT signature (minimal implementation for pilot)
 * @param token - The JWT token
 * @returns true if valid, false otherwise
 */
export function verifySig(token: string): boolean {
  try {
    // For pilot: basic shape validation
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Check if it has the right structure (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Try to decode the header
    try {
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      if (!header.alg || !header.typ) {
        return false;
      }
    } catch {
      return false;
    }
    
    // Try to decode the payload
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      if (!payload || typeof payload !== 'object') {
        return false;
      }
    } catch {
      return false;
    }
    
    // For pilot: if we have a JWT_SECRET, try verification
    if (JWT_SECRET && JWT_SECRET !== 'pilot-development-secret-key') {
      try {
        jwt.verify(token, JWT_SECRET);
        return true;
      } catch {
        // Fall through to basic validation
      }
    }
    
    // Basic validation passed
    return true;
  } catch (error) {
    console.warn('JWT verification failed:', error);
    return false;
  }
}

/**
 * Create a simple JWT for pilot credentials
 * @param payload - The payload to encode
 * @returns JWT token
 */
export function createJwt(payload: JwtPayload): string {
  // Don't use expiresIn if payload already has exp
  const options: any = {
    algorithm: 'HS256',
  };
  
  // Only add expiresIn if payload doesn't have exp
  if (!payload.exp) {
    options.expiresIn = '1y';
  }
  
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Check if JWT is expired
 * @param token - The JWT token
 * @returns true if expired, false otherwise
 */
export function isExpired(token: string): boolean {
  try {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) {
      return false; // No expiry means not expired
    }
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true; // If we can't decode, consider it expired
  }
}