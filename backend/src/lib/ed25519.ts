import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Enable synchronous mode for noble/ed25519
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

/**
 * Ed25519 Key Management and Signing for VCs
 */

export interface Ed25519KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  privateKeyHex: string;
  publicKeyHex: string;
}

/**
 * Generate Ed25519 keypair
 */
export async function generateKeyPair(): Promise<Ed25519KeyPair> {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);

  return {
    privateKey,
    publicKey,
    privateKeyHex: Buffer.from(privateKey).toString('hex'),
    publicKeyHex: Buffer.from(publicKey).toString('hex'),
  };
}

/**
 * Sign message with Ed25519
 */
export async function sign(
  message: string | Uint8Array,
  privateKeyHex: string
): Promise<string> {
  const messageBytes =
    typeof message === 'string' ? Buffer.from(message, 'utf-8') : message;
  const privateKey = Buffer.from(privateKeyHex, 'hex');

  const signature = await ed25519.signAsync(messageBytes, privateKey);
  return Buffer.from(signature).toString('base64url');
}

/**
 * Verify Ed25519 signature
 */
export async function verify(
  message: string | Uint8Array,
  signatureBase64url: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    const messageBytes =
      typeof message === 'string' ? Buffer.from(message, 'utf-8') : message;
    const signature = Buffer.from(signatureBase64url, 'base64url');
    const publicKey = Buffer.from(publicKeyHex, 'hex');

    return await ed25519.verifyAsync(signature, messageBytes, publicKey);
  } catch {
    return false;
  }
}

/**
 * Get or create signing keypair from environment
 */
export async function getSigningKeyPair(): Promise<Ed25519KeyPair> {
  const privateKeyHex = process.env.ED25519_PRIVATE_KEY;

  if (privateKeyHex) {
    const privateKey = Buffer.from(privateKeyHex, 'hex');
    const publicKey = await ed25519.getPublicKeyAsync(privateKey);

    return {
      privateKey,
      publicKey,
      privateKeyHex,
      publicKeyHex: Buffer.from(publicKey).toString('hex'),
    };
  }

  // Generate new keypair for development
  console.warn(
    'ED25519_PRIVATE_KEY not set, generating ephemeral keypair (dev only)'
  );
  return await generateKeyPair();
}

/**
 * Create JWS (JSON Web Signature) with Ed25519
 */
export async function createJWS(
  payload: any,
  privateKeyHex: string
): Promise<string> {
  const header = {
    alg: 'EdDSA',
    typ: 'JWT',
  };

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signingInput = `${headerBase64}.${payloadBase64}`;
  const signature = await sign(signingInput, privateKeyHex);

  return `${signingInput}.${signature}`;
}

/**
 * Verify JWS with Ed25519
 */
export async function verifyJWS(
  jws: string,
  publicKeyHex: string
): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = jws.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWS format' };
    }

    const [headerBase64, payloadBase64, signatureBase64] = parts;

    // Verify header
    const header = JSON.parse(Buffer.from(headerBase64, 'base64url').toString('utf-8'));
    if (header.alg !== 'EdDSA') {
      return { valid: false, error: `Unsupported algorithm: ${header.alg}` };
    }

    // Verify signature
    const signingInput = `${headerBase64}.${payloadBase64}`;
    const valid = await verify(signingInput, signatureBase64, publicKeyHex);

    if (!valid) {
      return { valid: false, error: 'Signature verification failed' };
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}
