import client from "prom-client";

const collectDefault = client.collectDefaultMetrics;
collectDefault({ timeout: 5000 });

export const commandExecCounter = new client.Counter({
  name: "vitalcv_command_execute_total",
  help: "Total number of commands executed",
  labelNames: ["command", "status", "user_role"],
});

export const npiLookupCounter = new client.Counter({
  name: "vitalcv_npi_lookup_total",
  help: "Total npi lookups",
  labelNames: ["result"], // success, cache_hit, cache_miss, error
});

export const commandLatency = new client.Histogram({
  name: "vitalcv_command_latency_seconds",
  help: "Latency distribution for command executions",
  buckets: [0.01, 0.05, 0.2, 0.5, 1, 2, 5],
  labelNames: ["command", "user_role"],
});

// SLO Metrics
export const psvAccuracyRatio = new client.Gauge({
  name: "psv_accuracy_ratio",
  help: "Primary Source Verification accuracy ratio (0-1)",
});

export const evidenceCompleteRatio = new client.Gauge({
  name: "evidence_complete_ratio",
  help: "Evidence completeness ratio (0-1)",
});

export const fppeTriggerRatio = new client.Gauge({
  name: "fppe_trigger_ratio",
  help: "Focused Professional Practice Evaluation trigger ratio (0-1)",
});

export const adverseMissCount = new client.Counter({
  name: "adverse_miss_count",
  help: "Count of adverse findings missed",
});

export const ttpSeconds = new client.Histogram({
  name: "ttp_seconds",
  help: "Time to Privilege in seconds",
  buckets: [
    86400,      // 1 day
    172800,     // 2 days
    259200,     // 3 days
    604800,     // 1 week
    1209600,    // 2 weeks
    2592000,    // 30 days
    5184000,    // 60 days
    7776000,    // 90 days
  ],
  labelNames: ["status"], // success, failed
});

export const metricsHandler = async (_req: any, res: any) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
};
