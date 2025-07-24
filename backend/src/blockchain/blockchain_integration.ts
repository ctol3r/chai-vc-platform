// blockchain_integration.ts - wiring for blockchain services

import { ImpactAnalytics } from '../analytics/impact_analytics';
import { PolkadotService } from './polkadot_service';

const polkadot = new PolkadotService();

export const impactAnalytics = new ImpactAnalytics(metric =>
  polkadot.recordImpactMetric(metric)
);
