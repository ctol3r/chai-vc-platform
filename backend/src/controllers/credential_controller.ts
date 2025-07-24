// credential_controller.ts - minimal hiring controller logic

import { impactAnalytics } from '../blockchain/blockchain_integration';

export async function hireCandidate(
  applied: Date,
  hired: Date,
  estimatedCostUsd: number,
  actualCostUsd: number
): Promise<void> {
  const timeToHire =
    (hired.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
  const costSavings = estimatedCostUsd - actualCostUsd;

  await impactAnalytics.track(timeToHire, costSavings);
}
