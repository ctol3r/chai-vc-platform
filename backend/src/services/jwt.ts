import jwtLib from 'jsonwebtoken';

export type DecodedPilotJwt = {
  jti?: string;
  credentialId?: string;
  sub?: string;
  iss?: string;
  nbf?: number;
  exp?: number;
  [k: string]: any;
};

function base64UrlToString(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function decodeJwt(jwt: string): DecodedPilotJwt {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return {};
    const payloadJson = base64UrlToString(parts[1]);
    const parsed = JSON.parse(payloadJson);
    return parsed;
  } catch {
    return {};
  }
}

export function verifySig(token: string): boolean {
  try {
    if (!token || token.split('.').length !== 3) return false;
    const secret = process.env.JWT_HS256_SECRET;
    if (secret) {
      // HS256 verification if secret provided
      jwtLib.verify(token, secret, { algorithms: ['HS256'] });
      return true;
    }
    // Minimal shape check: decode header and ensure alg exists
    const headerPart = token.split('.')[0];
    const headerStr = base64UrlToString(headerPart);
    const header = JSON.parse(headerStr);
    if (!header || typeof header !== 'object') return false;
    if (!header.alg) return false;
    // Accept basic algs for pilot
    return true;
  } catch {
    return false;
  }
}

export function signPilotJwt(payload: object): string {
  const secret = process.env.JWT_HS256_SECRET || 'pilot_dev_secret';
  return jwtLib.sign(payload as any, secret, { algorithm: 'HS256' });
}
