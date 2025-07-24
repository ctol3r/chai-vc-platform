// impact_analytics.ts - logic for tracking hiring impact metrics

export interface ImpactMetric {
  timeToHireDays: number;
  costSavingsUsd: number;
}

export class ImpactAnalytics {
  constructor(private record: (metric: ImpactMetric) => Promise<void>) {}

  async track(timeToHireDays: number, costSavingsUsd: number): Promise<void> {
    const metric: ImpactMetric = { timeToHireDays, costSavingsUsd };
    await this.record(metric);
  }
}
