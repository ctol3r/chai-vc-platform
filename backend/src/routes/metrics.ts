/**
 * Metrics endpoint for Prometheus scraping
 * Lightweight implementation for pilot observability
 */

import { Router, Request, Response } from 'express';

const router = Router();

// In-memory metrics store (for pilot)
interface Metrics {
  claimCount: number;
  claimLatencies: number[]; // milliseconds
  lastUpdated: Date;
}

let metrics: Metrics = {
  claimCount: 0,
  claimLatencies: [],
  lastUpdated: new Date(),
};

/**
 * Record a claim submission
 */
export function recordClaimSubmission(latencyMs: number): void {
  metrics.claimCount++;
  metrics.claimLatencies.push(latencyMs);
  // Keep only last 100 latencies to avoid memory bloat
  if (metrics.claimLatencies.length > 100) {
    metrics.claimLatencies.shift();
  }
  metrics.lastUpdated = new Date();
}

/**
 * GET /api/metrics
 * Prometheus-compatible metrics endpoint
 */
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const avgLatency = metrics.claimLatencies.length > 0
      ? metrics.claimLatencies.reduce((a, b) => a + b, 0) / metrics.claimLatencies.length
      : 0;

    const maxLatency = metrics.claimLatencies.length > 0
      ? Math.max(...metrics.claimLatencies)
      : 0;

    const minLatency = metrics.claimLatencies.length > 0
      ? Math.min(...metrics.claimLatencies)
      : 0;

    // Prometheus format (simple gauge/counter metrics)
    const prometheusFormat = `# HELP chai_claim_total Total number of claims submitted
# TYPE chai_claim_total counter
chai_claim_total ${metrics.claimCount}

# HELP chai_claim_latency_seconds Average claim processing latency in seconds
# TYPE chai_claim_latency_seconds gauge
chai_claim_latency_seconds ${avgLatency / 1000}

# HELP chai_claim_latency_seconds_max Maximum claim processing latency in seconds
# TYPE chai_claim_latency_seconds_max gauge
chai_claim_latency_seconds_max ${maxLatency / 1000}

# HELP chai_claim_latency_seconds_min Minimum claim processing latency in seconds
# TYPE chai_claim_latency_seconds_min gauge
chai_claim_latency_seconds_min ${minLatency / 1000}

# HELP chai_metrics_last_updated_seconds Timestamp of last metrics update
# TYPE chai_metrics_last_updated_seconds gauge
chai_metrics_last_updated_seconds ${Math.floor(metrics.lastUpdated.getTime() / 1000)}
`;

    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(prometheusFormat);
  } catch (err) {
    console.error('Error generating metrics:', err);
    res.status(500).json({ error: 'Internal server error generating metrics' });
  }
});

/**
 * GET /api/metrics/json
 * JSON format metrics for debugging
 */
router.get('/metrics/json', (req: Request, res: Response) => {
  try {
    const avgLatency = metrics.claimLatencies.length > 0
      ? metrics.claimLatencies.reduce((a, b) => a + b, 0) / metrics.claimLatencies.length
      : 0;

    res.json({
      claimCount: metrics.claimCount,
      latency: {
        average: avgLatency,
        max: metrics.claimLatencies.length > 0 ? Math.max(...metrics.claimLatencies) : 0,
        min: metrics.claimLatencies.length > 0 ? Math.min(...metrics.claimLatencies) : 0,
        samples: metrics.claimLatencies.length,
      },
      lastUpdated: metrics.lastUpdated,
    });
  } catch (err) {
    console.error('Error generating metrics:', err);
    res.status(500).json({ error: 'Internal server error generating metrics' });
  }
});

export default router;
