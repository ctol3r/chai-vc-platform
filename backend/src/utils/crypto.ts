import crypto from 'crypto';

const ALG = 'aes-256-gcm';

function getKey(): Buffer {
  const key = process.env.CREDENTIAL_ENC_KEY || '';
  if (!key) throw new Error('CREDENTIAL_ENC_KEY not set');
  // Accept 32-byte base64 or hex; else derive from utf8 string (not recommended for prod)
  if (/^[A-Za-z0-9+/=]+$/.test(key) && Buffer.from(key, 'base64').length === 32) {
    return Buffer.from(key, 'base64');
  }
  if (/^[0-9a-fA-F]+$/.test(key) && Buffer.from(key, 'hex').length === 32) {
    return Buffer.from(key, 'hex');
  }
  // Fallback: hash to 32 bytes
  return crypto.createHash('sha256').update(key, 'utf8').digest();
}

export function encryptPayload(plaintext: string): { ciphertextB64: string; ivB64: string; alg: string } {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([ciphertext, tag]);
  return { ciphertextB64: combined.toString('base64'), ivB64: iv.toString('base64'), alg: 'AES-256-GCM' };
}

export function decryptPayload(ciphertextB64: string, ivB64: string): string {
  const key = getKey();
  const data = Buffer.from(ciphertextB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = data.subarray(data.length - 16);
  const ct = data.subarray(0, data.length - 16);
  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  return plaintext;
}

