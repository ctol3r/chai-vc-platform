import crypto from 'crypto';

export function encryptJson(json: unknown, key: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(json));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    payloadEnc: Buffer.concat([ciphertext, tag]).toString('base64'),
    iv: iv.toString('base64'),
    alg: 'AES-256-GCM',
  };
}

