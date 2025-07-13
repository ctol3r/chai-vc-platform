import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ENCLAVE_DIR = path.join(__dirname, '..', '..', 'enclave_keys');

/**
 * Ensure enclave directory exists with secure permissions.
 */
export function initEnclaveStorage() {
  if (!fs.existsSync(ENCLAVE_DIR)) {
    fs.mkdirSync(ENCLAVE_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * Generate a 256-bit key and securely store it in the enclave directory.
 * @param keyName Name of the key file without extension
 * @returns hex encoded key
 */
export function generateKey(keyName: string): string {
  initEnclaveStorage();
  const key = crypto.randomBytes(32).toString('hex');
  const filePath = path.join(ENCLAVE_DIR, `${keyName}.key`);
  fs.writeFileSync(filePath, key, { mode: 0o600 });
  return key;
}

/**
 * Retrieve a stored key from the enclave directory.
 * @param keyName Name of the key file without extension
 * @returns hex encoded key or null if not found
 */
export function getKey(keyName: string): string | null {
  const filePath = path.join(ENCLAVE_DIR, `${keyName}.key`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}
