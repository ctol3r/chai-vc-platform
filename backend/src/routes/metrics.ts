import express from "express";
import client from "prom-client";
import {
  psvAccuracyRatio,
  evidenceCompleteRatio,
  fppeTriggerRatio,
  adverseMissCount,
  ttpSeconds,
} from "../instrumentation/metrics";

const router = express.Router();

/**
 * Helper to calculate P90 from histogram
 * In production, this should query Prometheus API for accurate quantiles
 */
async function calculateP90(histogram: client.Histogram): Promise<number> {
  try {
    // Query Prometheus registry for histogram data
    const metrics = await client.register.getMetricsAsJSON();
    const histogramMetric = metrics.find((m: any) => m.name === histogram.name);
    
    if (!histogramMetric || !histogramMetric.values) {
      return 0;
    }

    // Extract bucket values
    const buckets: Array<{ le: number; count: number }> = histogramMetric.values
      .filter((v: any) => v.metric && v.metric.le)
      .map((v: any) => ({
        le: parseFloat(v.metric.le),
        count: parseFloat(v.value) || 0,
      }))
      .sort((a: any, b: any) => a.le - b.le);

    if (buckets.length === 0) {
      return 0;
    }

    const total = buckets[buckets.length - 1]?.count || 0;
    if (total === 0) {
      return 0;
    }

    const p90Target = total * 0.9;

    // Find bucket where 90% of observations fall
    for (const bucket of buckets) {
      if (bucket.count >= p90Target) {
        return bucket.le / 86400; // Convert seconds to days
      }
    }

    // If no bucket found, return max bucket
    return buckets[buckets.length - 1]?.le / 86400 || 0;
  } catch (err) {
    console.warn('Error calculating P90, using default:', err);
    return 0;
  }
}

/**
 * GET /api/metrics/slo
 * Returns SLO metrics as JSON
 */
router.get("/slo", async (req, res) => {
  try {
    // Get current metric values
    const psvAcc = psvAccuracyRatio.get();
    const evidenceComplete = evidenceCompleteRatio.get();
    const fppeRate = fppeTriggerRatio.get();
    const adverseMisses = adverseMissCount.get();
    
    // Calculate TTP P90 from histogram
    const ttpP90Days = await calculateP90(ttpSeconds);

    const response = {
      psvAccuracy: typeof psvAcc === "number" ? psvAcc : 0.95, // Default if not set
      ttpDaysP90: ttpP90Days || 0,
      fppeRate: typeof fppeRate === "number" ? fppeRate : 0,
      adverseMisses: typeof adverseMisses === "number" ? adverseMisses : 0,
      evidenceComplete: typeof evidenceComplete === "number" ? evidenceComplete : 1.0,
    };

    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

export default router;
