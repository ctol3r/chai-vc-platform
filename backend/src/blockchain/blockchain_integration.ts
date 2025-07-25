import { queryRiskScore } from './chainlink_oracle';

/**
 * Example blockchain integration utilities.
 * The real implementation would interact with smart contracts and oracles.
 */

export async function getOnChainRisk(userId: string): Promise<number> {
  // Delegate to the Chainlink Functions oracle integration.
  return queryRiskScore(userId);
}

