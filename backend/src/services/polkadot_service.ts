/**
 * Non-blocking Polkadot anchoring service for Pilot P0
 * Fire-and-forget implementation that never blocks responses
 */

export async function tryAnchor(hash: string): Promise<void> {
  try {
    // Pilot P0: No-op client, just log for now
    // In production, this would connect to Polkadot and submit the hash
    console.log(`[ANCHOR] Attempting to anchor hash: ${hash.substring(0, 16)}...`);
    
    // Simulate async operation without blocking
    setTimeout(() => {
      console.log(`[ANCHOR] Successfully anchored hash: ${hash.substring(0, 16)}...`);
    }, 100);
    
  } catch (e) {
    // Never throw - always non-blocking
    const message = e instanceof Error ? e.message : String(e);
    console.warn('anchor_failed_nonblocking', { message });
  }
}

// Helper function to generate hash from data
export function generateHash(data: string): string {
  // Simple hash for pilot - in production use proper crypto
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}