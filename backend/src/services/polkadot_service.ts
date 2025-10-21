/**
 * Non-blocking Polkadot anchoring service for Pilot P0 API
 * Fire-and-forget hash anchoring with no blocking operations
 */

/**
 * Attempt to anchor a hash to the blockchain
 * This is a non-blocking operation that never throws
 * @param hash - The hash to anchor
 */
export async function tryAnchor(hash: string): Promise<void> {
  try {
    // Pilot implementation: no-op client with logging only
    console.log('PILOT: Attempting to anchor hash', { hash, timestamp: new Date().toISOString() });
    
    // Simulate async operation without actual blockchain interaction
    // In production, this would connect to Polkadot and submit the hash
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('PILOT: Hash anchoring completed (simulated)', { hash });
  } catch (error) {
    // Never throw - this is fire-and-forget
    console.warn('anchor_failed_nonblocking', {
      message: String((error as any)?.message || error),
      hash,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Generate a hash for anchoring (SHA-256)
 * @param data - The data to hash
 * @returns SHA-256 hash as hex string
 */
export function generateHash(data: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a hash for JWT anchoring
 * @param jwt - The JWT to hash
 * @returns SHA-256 hash as hex string
 */
export function hashJwt(jwt: string): string {
  return generateHash(jwt);
}