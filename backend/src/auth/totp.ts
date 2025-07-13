import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

export interface Issuer {
  id: string;
  secret?: string;
}

/**
 * Registers a new issuer by generating a TOTP secret and QR code URL.
 */
export function registerIssuer(issuer: Issuer): Promise<{secret: string; otpauthUrl: string; qrCodeDataURL: string}> {
  const secret = speakeasy.generateSecret({ name: `ChaiVCPlatform:${issuer.id}` });
  issuer.secret = secret.base32;
  return qrcode.toDataURL(secret.otpauth_url!).then(qrCodeDataURL => ({
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url!,
    qrCodeDataURL
  }));
}

/**
 * Verifies a TOTP token for an issuer.
 */
export function verifyIssuerToken(issuer: Issuer, token: string): boolean {
  if (!issuer.secret) {
    return false;
  }
  return speakeasy.totp.verify({
    secret: issuer.secret,
    encoding: 'base32',
    token
  });
}
