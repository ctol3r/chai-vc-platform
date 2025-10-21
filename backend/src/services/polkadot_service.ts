/**
 * Non-blocking Polkadot anchoring service for Pilot P0.
 * Fire-and-forget hash anchoring; never throws errors back to callers.
 */

export async function tryAnchor(hash: string): Promise<void> {
  try {
    // Pilot P0: log-only implementation
    // Future phases will integrate with actual Polkadot extrinsics
    console.log('[POLKADOT_ANCHOR]', { hash, timestamp: new Date().toISOString() });
    
    // Simulate async anchor operation
    await new Promise(resolve => setTimeout(resolve, 10));
  } catch (e: any) {
    // Never throw - this is fire-and-forget
    console.warn('anchor_failed_nonblocking', {
      message: String(e?.message || e),
    });
  }
}
