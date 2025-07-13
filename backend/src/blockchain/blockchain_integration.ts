// blockchain_integration.ts - placeholder or stub for chai-vc-platform

// Time (in milliseconds) to wait before considering a block confirmed.
// This value is tuned to be less than two seconds in order to keep
// interactions with the chain snappy in local development.
export const BLOCK_CONFIRMATION_TARGET_MS = 1800;

/**
 * Wait for a block confirmation.
 *
 * In the actual implementation this would poll the blockchain for a
 * confirmation event. Since this repository only contains scaffolding,
 * the function simply waits for the configured confirmation time.
 */
export async function waitForBlockConfirmation(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, BLOCK_CONFIRMATION_TARGET_MS));
}

